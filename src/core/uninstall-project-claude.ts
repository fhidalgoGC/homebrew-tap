import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { isFrameworkHook } from "./install-project-claude";

/**
 * Removes what `installProjectClaude` put in the project's .claude/.
 *
 * Only fremi's own entries go: a link is removed when it points into the
 * framework tree (or is a `fremi-*` skill), so a project's hand-written
 * skills and rules survive. Directories are removed only once empty, and
 * .claude/ itself is left alone — other tools live there too.
 */
export interface UninstallProjectClaudeReport {
  skillsRemoved: number;
  rulesRemoved: number;
  skillsKept: number;
  rulesKept: number;
  hooksRemoved: number;
  errors: string[];
}

export function uninstallProjectClaude(
  projectPath: string,
  frameworkContent: string,
): UninstallProjectClaudeReport {
  const report: UninstallProjectClaudeReport = {
    skillsRemoved: 0,
    rulesRemoved: 0,
    skillsKept: 0,
    rulesKept: 0,
    hooksRemoved: 0,
    errors: [],
  };

  const claudeDir = join(projectPath, ".claude");
  const frameworkRoot = resolve(frameworkContent);

  const skills = sweep(join(claudeDir, "skills"), frameworkRoot, (name) => name.startsWith("fremi-"), report.errors);
  report.skillsRemoved = skills.removed;
  report.skillsKept = skills.kept;

  const rules = sweep(join(claudeDir, "rules"), frameworkRoot, () => false, report.errors);
  report.rulesRemoved = rules.removed;
  report.rulesKept = rules.kept;

  report.hooksRemoved = stripFrameworkHooks(claudeDir, frameworkRoot, report.errors);

  return report;
}

function sweep(
  dir: string,
  frameworkRoot: string,
  alsoOwnedByName: (name: string) => boolean,
  errors: string[],
): { removed: number; kept: number } {
  if (!existsSync(dir)) return { removed: 0, kept: 0 };

  let removed = 0;
  let kept = 0;

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    let isOurs = false;
    try {
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        const target = resolve(dir, readlinkSync(path));
        isOurs = target.startsWith(frameworkRoot + "/") || alsoOwnedByName(entry);
      }
    } catch (err) {
      errors.push(`${path}: ${(err as Error).message}`);
      continue;
    }

    if (!isOurs) {
      kept++;
      continue;
    }
    try {
      unlinkSync(path);
      removed++;
    } catch (err) {
      errors.push(`${path}: ${(err as Error).message}`);
    }
  }

  if (kept === 0) {
    try {
      rmdirSync(dir);
    } catch {
      // Non-empty for a reason we don't own, or already gone — either is fine.
    }
  }

  return { removed, kept };
}

/**
 * Drops fremi's hook entries from .claude/settings.json, identified the same
 * way the installer claims them: the command points into the framework tree.
 * The file survives with the project's own settings; it is removed only if
 * uninstalling emptied it completely.
 */
function stripFrameworkHooks(claudeDir: string, frameworkRoot: string, errors: string[]): number {
  const path = join(claudeDir, "settings.json");
  if (!existsSync(path)) return 0;

  try {
    const settings = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    const hooks = (settings.hooks ?? {}) as Record<string, Array<Record<string, unknown>>>;

    let removed = 0;
    for (const event of Object.keys(hooks)) {
      const before = hooks[event]!.length;
      hooks[event] = hooks[event]!.filter((entry) => !isFrameworkHook(entry, frameworkRoot));
      removed += before - hooks[event]!.length;
      if (hooks[event]!.length === 0) delete hooks[event];
    }

    if (Object.keys(hooks).length === 0) delete settings.hooks;
    else settings.hooks = hooks;

    if (Object.keys(settings).length === 0) {
      unlinkSync(path);
    } else {
      writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
    }
    return removed;
  } catch (err) {
    errors.push(`${path}: ${(err as Error).message}`);
    return 0;
  }
}
