import { resolve, join } from "node:path";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readlinkSync,
  unlinkSync,
  rmdirSync,
} from "node:fs";

export interface UninstallRulesReport {
  removed: number;
  kept: number;
  errors: string[];
}

/**
 * Removes rule symlinks from <target>/.claude/rules/ that point into the
 * framework directory. Non-symlinks and symlinks pointing elsewhere are
 * kept. If the rules directory ends up empty it is also removed.
 */
export async function uninstallRules(
  targetPath: string,
  frameworkContent: string,
): Promise<UninstallRulesReport> {
  const report: UninstallRulesReport = { removed: 0, kept: 0, errors: [] };

  const rulesDir = resolve(targetPath, ".claude", "rules");
  if (!existsSync(rulesDir)) return report;

  const frameworkRulesAbs = resolve(join(frameworkContent, "rules"));

  for (const entry of readdirSync(rulesDir)) {
    const entryPath = join(rulesDir, entry);
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

    const target = resolve(rulesDir, readlinkSync(entryPath));
    if (target.startsWith(frameworkRulesAbs)) {
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

  // Clean up empty rules dir
  try {
    if (readdirSync(rulesDir).length === 0) {
      rmdirSync(rulesDir);
    }
  } catch {
    // ignore
  }

  return report;
}
