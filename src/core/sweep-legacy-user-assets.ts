import { existsSync, lstatSync, readdirSync, readlinkSync, rmdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Sweeps the skills and rules fremi used to install into the user's home.
 *
 * Before the plugin layout, `fremi install` symlinked every skill into
 * ~/.claude/skills/ and every cross-domain rule into ~/.claude/rules/. Those
 * links are stale twice over: they belong to a delivery model that no longer
 * exists (skills are per-project now), and they point at whatever framework
 * path that machine used back then — commonly a dev checkout, so most of them
 * dangle after any refactor.
 *
 * Nothing in the current codebase creates them, so nothing in the current
 * codebase removed them either: an upgrade carried the residue forward
 * silently. Both install and uninstall run this so the cleanup happens
 * without the user having to know the history.
 *
 * Ownership is deliberately narrow — a link goes only if it is a symlink AND
 * (its name is `fremi-*` or its target points inside a `framework/` tree).
 * Real files and links to anything else are left alone, broken or not.
 */
export interface SweepLegacyReport {
  skillsRemoved: string[];
  rulesRemoved: string[];
  errors: string[];
}

export function sweepLegacyUserAssets(homePath: string): SweepLegacyReport {
  const report: SweepLegacyReport = { skillsRemoved: [], rulesRemoved: [], errors: [] };

  report.skillsRemoved = sweepDir(
    join(homePath, ".claude", "skills"),
    (name, target) => name.startsWith("fremi-") || isFrameworkPath(target),
    report.errors,
  );

  report.rulesRemoved = sweepDir(
    join(homePath, ".claude", "rules"),
    (_name, target) => isFrameworkPath(target),
    report.errors,
  );

  return report;
}

function isFrameworkPath(target: string): boolean {
  return target.includes("/framework/") || target.endsWith("/framework");
}

function sweepDir(
  dir: string,
  isOurs: (name: string, target: string) => boolean,
  errors: string[],
): string[] {
  if (!existsSync(dir) && !isDanglingDir(dir)) return [];

  const removed: string[] = [];
  let kept = 0;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    errors.push(`${dir}: ${(err as Error).message}`);
    return removed;
  }

  for (const name of entries) {
    const path = join(dir, name);
    try {
      // lstat, not stat: these links are usually broken, and stat follows.
      if (!lstatSync(path).isSymbolicLink()) {
        kept++;
        continue;
      }
      const target = resolve(dir, readlinkSync(path));
      if (!isOurs(name, target)) {
        kept++;
        continue;
      }
      unlinkSync(path);
      removed.push(name);
    } catch (err) {
      errors.push(`${path}: ${(err as Error).message}`);
      kept++;
    }
  }

  if (kept === 0) {
    try {
      rmdirSync(dir);
    } catch {
      // Still holds something we don't own, or already gone.
    }
  }

  return removed;
}

function isDanglingDir(dir: string): boolean {
  try {
    return lstatSync(dir).isDirectory();
  } catch {
    return false;
  }
}
