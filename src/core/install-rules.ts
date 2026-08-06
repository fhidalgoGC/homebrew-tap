import { resolve, join, dirname } from "node:path";
import {
  readdirSync,
  existsSync,
  mkdirSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";

export interface InstallRulesReport {
  installed: number;
  skipped: number;
  recreated: number;
  errors: string[];
}

/**
 * Installs rule symlinks into <target>/.claude/rules/ pointing to the
 * framework's rules directory. Rules are markdown files (workflow.md,
 * reverse.md, README.md) that Claude Code reads to understand the
 * mandatory framework flow.
 */
export async function installRules(
  targetPath: string,
  frameworkContent: string,
): Promise<InstallRulesReport> {
  const report: InstallRulesReport = { installed: 0, skipped: 0, recreated: 0, errors: [] };

  const rulesSrc = resolve(frameworkContent, "rules");
  if (!existsSync(rulesSrc)) {
    report.errors.push(`Rules dir not found: ${rulesSrc}`);
    return report;
  }

  const rulesDst = resolve(targetPath, ".claude", "rules");
  mkdirSync(rulesDst, { recursive: true });

  const entries = readdirSync(rulesSrc, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".md")) continue;

    const src = join(rulesSrc, entry.name);
    const dst = join(rulesDst, entry.name);
    const action = ensureSymlink(dst, src);
    report[action]++;
  }

  return report;
}

function ensureSymlink(linkPath: string, target: string): "installed" | "skipped" | "recreated" {
  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = readlinkSync(linkPath);
      const currentAbs = resolve(dirname(linkPath), current);
      if (currentAbs === resolve(target)) return "skipped";
      unlinkSync(linkPath);
      symlinkSync(target, linkPath);
      return "recreated";
    }
    return "skipped";
  }

  mkdirSync(dirname(linkPath), { recursive: true });
  symlinkSync(target, linkPath);
  return "installed";
}
