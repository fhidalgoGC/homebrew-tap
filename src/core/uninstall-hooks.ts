import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface UninstallHooksReport {
  removed: number;
  errors: string[];
}

/**
 * Removes hook entries from <target>/.claude/settings.json whose command path
 * lives inside the framework hooks dir. Foreign entries are preserved.
 */
export async function uninstallHooks(
  targetPath: string,
  frameworkContent: string,
): Promise<UninstallHooksReport> {
  const report: UninstallHooksReport = { removed: 0, errors: [] };

  const settingsPath = resolve(targetPath, ".claude", "settings.json");
  if (!existsSync(settingsPath)) return report;

  let settings: Record<string, unknown>;
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  } catch {
    report.errors.push(`Malformed settings.json — leaving untouched.`);
    return report;
  }

  const hooksSection = (settings.hooks ?? {}) as Record<string, unknown>;
  const frameworkHooksAbs = resolve(join(frameworkContent, "hooks"));

  for (const eventKey of Object.keys(hooksSection)) {
    const entries = (hooksSection[eventKey] ?? []) as Array<Record<string, unknown>>;
    const kept: Array<Record<string, unknown>> = [];

    for (const entry of entries) {
      const commands = (entry.hooks ?? []) as Array<Record<string, unknown>>;
      const filtered = commands.filter((h) => {
        const cmd = typeof h.command === "string" ? h.command : "";
        const isFremi = resolve(cmd).startsWith(frameworkHooksAbs);
        if (isFremi) report.removed++;
        return !isFremi;
      });

      if (filtered.length > 0) {
        kept.push({ ...entry, hooks: filtered });
      }
    }

    if (kept.length > 0) {
      hooksSection[eventKey] = kept;
    } else {
      delete hooksSection[eventKey];
    }
  }

  if (Object.keys(hooksSection).length === 0) {
    delete settings.hooks;
  } else {
    settings.hooks = hooksSection;
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  return report;
}
