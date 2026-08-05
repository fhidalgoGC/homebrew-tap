import { resolve, join, basename, dirname } from "node:path";
import {
  readdirSync,
  existsSync,
  mkdirSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
  readFileSync,
} from "node:fs";

export interface InstallSkillsReport {
  installed: number;
  skipped: number;
  recreated: number;
  errors: string[];
}

/**
 * Installs skill symlinks into <target>/.claude/skills/ pointing to the framework.
 *
 * Discovery: walks framework/skills/, framework/reverse-engineering/, and
 * framework/installs/ looking for SKILL.md files. The `name:` field of the
 * frontmatter is used as the symlink name (must start with "fremi-" per Regla 21).
 */
export async function installSkills(
  targetPath: string,
  frameworkContent: string,
): Promise<InstallSkillsReport> {
  const report: InstallSkillsReport = { installed: 0, skipped: 0, recreated: 0, errors: [] };

  const claudeSkillsDir = resolve(targetPath, ".claude", "skills");
  mkdirSync(claudeSkillsDir, { recursive: true });

  // Discover all SKILL.md files under the known framework roots
  const skillRoots = [
    resolve(frameworkContent, "skills"),
    resolve(frameworkContent, "reverse-engineering"),
    resolve(frameworkContent, "installs"),
  ];

  const discovered: Array<{ name: string; skillDir: string }> = [];

  for (const root of skillRoots) {
    if (!existsSync(root)) continue;
    walkForSkills(root, discovered);
  }

  // Install each skill as a symlink
  for (const { name, skillDir } of discovered) {
    if (!name.startsWith("fremi-")) {
      report.errors.push(`Skipped ${skillDir}: skill name "${name}" doesn't start with 'fremi-' (Regla 21)`);
      continue;
    }

    const linkPath = join(claudeSkillsDir, name);
    const action = ensureSymlink(linkPath, skillDir);
    report[action]++;
  }

  return report;
}

function walkForSkills(root: string, out: Array<{ name: string; skillDir: string }>): void {
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    const skillMd = join(dir, "SKILL.md");
    if (existsSync(skillMd)) {
      const name = extractSkillName(skillMd);
      if (name) out.push({ name, skillDir: dir });
    }
    // Recurse into skills/<layer>/skills/<sub>/ pattern
    const nestedSkills = join(dir, "skills");
    if (existsSync(nestedSkills) && lstatSync(nestedSkills).isDirectory()) {
      walkForSkills(nestedSkills, out);
    }
  }
}

function extractSkillName(skillMd: string): string | null {
  try {
    const content = readFileSync(skillMd, "utf8");
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const frontmatter = match[1] ?? "";
    const nameMatch = frontmatter.match(/^name:\s*(.+?)\s*$/m);
    return nameMatch?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Ensure `linkPath` is a symlink to `target`. Returns action taken.
 */
function ensureSymlink(linkPath: string, target: string): "installed" | "skipped" | "recreated" {
  if (existsSync(linkPath)) {
    // Check if it's already a symlink to the right target
    const stat = lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = readlinkSync(linkPath);
      const currentAbs = resolve(dirname(linkPath), current);
      if (currentAbs === resolve(target)) {
        return "skipped"; // Already correct
      }
      // Wrong target — recreate
      unlinkSync(linkPath);
      symlinkSync(target, linkPath);
      return "recreated";
    }
    // Exists but not a symlink — skip (don't overwrite non-symlinks silently)
    return "skipped";
  }

  mkdirSync(dirname(linkPath), { recursive: true });
  symlinkSync(target, linkPath);
  return "installed";
}
