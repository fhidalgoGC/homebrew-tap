import { resolve, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

export interface InstallBootstrapHookReport {
  action: "registered" | "already-present" | "malformed-settings";
  errors: string[];
}

const BOOTSTRAP_MATCHER = "startup|clear";
const BOOTSTRAP_COMMAND = "fremi verify";
const BOOTSTRAP_TIMEOUT_SEC = 5;

/**
 * Registers the ONE bootstrap hook fremi needs at user level: a SessionStart
 * hook that runs `fremi verify` on every fresh Claude Code session (and on
 * /clear). The command is silent when everything is healthy and prints a
 * helpful message otherwise, so users see immediately if their install is
 * broken.
 *
 * All other framework hooks (check-flow-preconditions, check-strict-tdd,
 * etc.) are deliberately NOT installed at user level in v0.3.0. Only this
 * bootstrap hook — the minimum needed for verification.
 *
 * Merge policy: non-destructive. Existing hooks in ~/.claude/settings.json
 * are preserved. Duplicate registration is idempotent (matched by command).
 */
export async function installBootstrapHook(homePath: string): Promise<InstallBootstrapHookReport> {
  const settingsPath = resolve(homePath, ".claude", "settings.json");
  const claudeDir = resolve(homePath, ".claude");

  mkdirSync(claudeDir, { recursive: true });

  let settings: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    } catch {
      return { action: "malformed-settings", errors: [`Cannot parse ${settingsPath} — left untouched.`] };
    }
  }

  const hooks = (settings.hooks ?? {}) as Record<string, unknown>;
  const sessionStart = (hooks.SessionStart ?? []) as Array<Record<string, unknown>>;

  // Check if we already have a bootstrap hook entry matching our command.
  const alreadyPresent = sessionStart.some((entry) => {
    const hooksArr = (entry.hooks ?? []) as Array<Record<string, unknown>>;
    return hooksArr.some((h) => h.command === BOOTSTRAP_COMMAND);
  });

  if (alreadyPresent) {
    return { action: "already-present", errors: [] };
  }

  sessionStart.push({
    matcher: BOOTSTRAP_MATCHER,
    hooks: [
      {
        type: "command",
        command: BOOTSTRAP_COMMAND,
        timeout: BOOTSTRAP_TIMEOUT_SEC,
      },
    ],
  });

  hooks.SessionStart = sessionStart;
  settings.hooks = hooks;

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  return { action: "registered", errors: [] };
}

/**
 * Removes the bootstrap hook entry from ~/.claude/settings.json (used by
 * `fremi agent uninstall`). Only removes entries matching our exact
 * command; foreign entries in SessionStart are left alone.
 */
export async function uninstallBootstrapHook(homePath: string): Promise<{ removed: number; errors: string[] }> {
  const settingsPath = resolve(homePath, ".claude", "settings.json");
  if (!existsSync(settingsPath)) return { removed: 0, errors: [] };

  let settings: Record<string, unknown>;
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  } catch {
    return { removed: 0, errors: [`Cannot parse ${settingsPath} — left untouched.`] };
  }

  const hooks = (settings.hooks ?? {}) as Record<string, unknown>;
  const sessionStart = (hooks.SessionStart ?? []) as Array<Record<string, unknown>>;

  let removed = 0;
  const kept: Array<Record<string, unknown>> = [];

  for (const entry of sessionStart) {
    const commands = (entry.hooks ?? []) as Array<Record<string, unknown>>;
    const filtered = commands.filter((h) => {
      if (h.command === BOOTSTRAP_COMMAND) {
        removed++;
        return false;
      }
      return true;
    });
    if (filtered.length > 0) {
      kept.push({ ...entry, hooks: filtered });
    }
  }

  if (kept.length > 0) {
    hooks.SessionStart = kept;
  } else {
    delete hooks.SessionStart;
  }

  if (Object.keys(hooks).length === 0) {
    delete settings.hooks;
  } else {
    settings.hooks = hooks;
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  return { removed, errors: [] };
}
