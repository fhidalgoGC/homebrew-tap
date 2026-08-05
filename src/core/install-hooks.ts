import { resolve, join } from "node:path";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

export interface InstallHooksReport {
  registered: number;
  skipped: number;
  errors: string[];
}

/**
 * Registers framework hooks in <target>/.claude/settings.json.
 *
 * Discovery: all *.sh files under framework/hooks/ (except README.md).
 * Each hook is added to settings.json under the appropriate event key,
 * with the absolute path to the framework hook.
 *
 * Merge policy: non-destructive — existing hooks are preserved; framework
 * hooks are added only if not already present (matched by absolute path).
 *
 * Note: MVP wires all hooks under the "PostToolUse" event with a generic
 * matcher for docs/works/**. A future version will read each hook's header
 * comment for its recommended event and matcher.
 */
export async function installHooks(
  targetPath: string,
  frameworkContent: string,
): Promise<InstallHooksReport> {
  const report: InstallHooksReport = { registered: 0, skipped: 0, errors: [] };

  const claudeDir = resolve(targetPath, ".claude");
  const settingsPath = join(claudeDir, "settings.json");
  const hooksDir = join(frameworkContent, "hooks");

  if (!existsSync(hooksDir)) {
    report.errors.push(`Hooks dir not found: ${hooksDir}`);
    return report;
  }

  mkdirSync(claudeDir, { recursive: true });

  // Load existing settings.json (or start fresh)
  let settings: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    } catch {
      report.errors.push(`Malformed settings.json — leaving untouched.`);
      return report;
    }
  }

  const hooks = (settings.hooks ?? {}) as Record<string, unknown>;
  const postToolUse = (hooks.PostToolUse ?? []) as Array<Record<string, unknown>>;

  // Discover hook files
  const hookFiles = readdirSync(hooksDir).filter((f) => f.endsWith(".sh"));

  for (const hookFile of hookFiles) {
    const absPath = join(hooksDir, hookFile);
    const alreadyRegistered = postToolUse.some((entry) => {
      const hooksArr = (entry.hooks ?? []) as Array<Record<string, unknown>>;
      return hooksArr.some((h) => h.command === absPath);
    });

    if (alreadyRegistered) {
      report.skipped++;
      continue;
    }

    postToolUse.push({
      matcher: "Edit|Write",
      hooks: [{ type: "command", command: absPath }],
    });
    report.registered++;
  }

  hooks.PostToolUse = postToolUse;
  settings.hooks = hooks;

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");

  return report;
}
