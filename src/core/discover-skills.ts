import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Finds every fremi skill in the framework tree. A skill is any directory
 * holding a SKILL.md whose frontmatter declares a `name`.
 *
 * Discovery roots:
 *   artifacts/            the artifact layers (product, feature, story,
 *                         enabler, extra) — the bulk of the skills
 *   skills/               utility skills (tools/, sync-check/)
 *   reverse-engineering/  reverse-* skills for pre-existing code
 *
 * Layers nest their steps under `<layer>/skills/`, so the walk recurses
 * into any `skills/` subdirectory it finds.
 */
export interface DiscoveredSkill {
  name: string;
  skillDir: string;
}

export function discoverSkills(frameworkContent: string): DiscoveredSkill[] {
  const roots = [
    resolve(frameworkContent, "artifacts"),
    resolve(frameworkContent, "skills"),
    resolve(frameworkContent, "reverse-engineering"),
  ];

  const out: DiscoveredSkill[] = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    walk(root, out);
  }
  return out;
}

function walk(root: string, out: DiscoveredSkill[]): void {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);

    const skillMd = join(dir, "SKILL.md");
    if (existsSync(skillMd)) {
      const name = extractSkillName(skillMd);
      if (name) out.push({ name, skillDir: dir });
    }

    const nested = join(dir, "skills");
    if (existsSync(nested) && lstatSync(nested).isDirectory()) {
      walk(nested, out);
    }
  }
}

export function extractSkillName(skillMd: string): string | null {
  try {
    const content = readFileSync(skillMd, "utf8");
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const nameMatch = (match[1] ?? "").match(/^name:\s*(.+?)\s*$/m);
    return nameMatch?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}
