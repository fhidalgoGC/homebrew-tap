import { resolve, join } from "node:path";
import { existsSync, lstatSync, readdirSync, readlinkSync, unlinkSync } from "node:fs";

export interface UninstallSkillsReport {
  removed: number;
  kept: number;
  errors: string[];
}

/**
 * Removes skill symlinks from <target>/.claude/skills/ that point into the
 * framework directory. Non-symlinks and symlinks pointing elsewhere are kept.
 */
export async function uninstallSkills(
  targetPath: string,
  frameworkContent: string,
): Promise<UninstallSkillsReport> {
  const report: UninstallSkillsReport = { removed: 0, kept: 0, errors: [] };

  const skillsDir = resolve(targetPath, ".claude", "skills");
  if (!existsSync(skillsDir)) return report;

  const frameworkAbs = resolve(frameworkContent);

  for (const entry of readdirSync(skillsDir)) {
    const entryPath = join(skillsDir, entry);
    let stat;
    try {
      stat = lstatSync(entryPath);
    } catch {
      continue;
    }
    if (!stat.isSymbolicLink()) {
      report.kept++;
      continue;
    }

    const target = resolve(skillsDir, readlinkSync(entryPath));
    if (target.startsWith(frameworkAbs)) {
      try {
        unlinkSync(entryPath);
        report.removed++;
      } catch (err) {
        report.errors.push(`Failed to remove ${entryPath}: ${(err as Error).message}`);
      }
    } else {
      report.kept++;
    }
  }

  return report;
}
