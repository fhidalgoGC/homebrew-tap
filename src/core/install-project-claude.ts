import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { discoverSkills } from "./discover-skills";
import { ensureSymlink } from "./symlink";
import { discoverFrameworkHooks, toHooksConfig } from "./discover-hooks";

/**
 * Installs everything Claude Code needs INSIDE the project, so a project
 * carries its own fremi and nothing has to live in the developer's home:
 *
 *   .claude/skills/<name>   → symlink to the framework's skill directory
 *   .claude/rules/<name>.md → symlink to the framework's rule file
 *   .claude/settings.json   → every framework hook, wired to the event each
 *                             hook declares in its own header
 *
 * What stays user-level (`fremi agent install`): the MCP server, which
 * answers about fremi itself rather than about any one project, and the
 * SessionStart bootstrap hook, which has to run in projects that never
 * installed fremi in order to say so. Framework hooks live HERE and only
 * here — registered at both levels they would fire twice per event.
 *
 * Symlinks, not copies: `fremi update` pulls new framework content and every
 * project that installed sees it without reinstalling. The settings.json
 * write is a merge: a project's own hooks are preserved, fremi's are
 * replaced wholesale so a reinstall drops hooks the framework removed.
 */
export interface InstallProjectClaudeReport {
  skillsInstalled: number;
  skillsSkipped: number;
  skillsRecreated: number;
  rulesInstalled: number;
  rulesSkipped: number;
  rulesRecreated: number;
  hooksRegistered: number;
  hooksSkipped: string[];
  settingsWritten: boolean;
  errors: string[];
}

export async function installProjectClaude(
  projectPath: string,
  frameworkContent: string,
): Promise<InstallProjectClaudeReport> {
  const report: InstallProjectClaudeReport = {
    skillsInstalled: 0,
    skillsSkipped: 0,
    skillsRecreated: 0,
    rulesInstalled: 0,
    rulesSkipped: 0,
    rulesRecreated: 0,
    hooksRegistered: 0,
    hooksSkipped: [],
    settingsWritten: false,
    errors: [],
  };

  const claudeDir = join(projectPath, ".claude");

  // --- skills ---------------------------------------------------------
  try {
    const skillsDir = join(claudeDir, "skills");
    mkdirSync(skillsDir, { recursive: true });
    for (const { name, skillDir } of discoverSkills(frameworkContent)) {
      if (!name.startsWith("fremi-")) {
        report.errors.push(`Skipped ${skillDir}: skill name "${name}" doesn't start with 'fremi-'`);
        continue;
      }
      const action = ensureSymlink(join(skillsDir, name), skillDir);
      if (action === "installed") report.skillsInstalled++;
      else if (action === "recreated") report.skillsRecreated++;
      else report.skillsSkipped++;
    }
  } catch (err) {
    report.errors.push(`skills: ${(err as Error).message}`);
  }

  // --- rules ----------------------------------------------------------
  try {
    const rulesDir = join(claudeDir, "rules");
    mkdirSync(rulesDir, { recursive: true });
    for (const rule of discoverRules(frameworkContent)) {
      const action = ensureSymlink(join(rulesDir, rule.name), rule.path);
      if (action === "installed") report.rulesInstalled++;
      else if (action === "recreated") report.rulesRecreated++;
      else report.rulesSkipped++;
    }
  } catch (err) {
    report.errors.push(`rules: ${(err as Error).message}`);
  }


  // --- hooks in .claude/settings.json ---------------------------------
  try {
    const discovered = discoverFrameworkHooks(frameworkContent);
    report.hooksRegistered = discovered.hooks.length;
    report.hooksSkipped = discovered.skipped;
    writeProjectHooks(claudeDir, discovered, resolve(frameworkContent));
    report.settingsWritten = true;
  } catch (err) {
    report.errors.push(`settings.json: ${(err as Error).message}`);
  }

  return report;
}

/**
 * Merges fremi's hooks into .claude/settings.json. Ownership is decided by
 * the command itself: an entry whose command points into the framework tree
 * is ours, so we drop all of those and write the current set back. Anything
 * the project added by hand is left untouched.
 */
function writeProjectHooks(
  claudeDir: string,
  discovered: ReturnType<typeof discoverFrameworkHooks>,
  frameworkRoot: string,
): void {
  mkdirSync(claudeDir, { recursive: true });
  const path = join(claudeDir, "settings.json");

  let settings: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      settings = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    } catch {
      settings = {};
    }
  }

  const ours = toHooksConfig(discovered.hooks, { timeout: 10 }) as HookMap;
  const existing = (settings.hooks ?? {}) as HookMap;
  const merged: HookMap = {};

  for (const event of new Set([...Object.keys(existing), ...Object.keys(ours)])) {
    const theirs = (existing[event] ?? []).filter((entry) => !isFrameworkHook(entry, frameworkRoot));
    const combined = [...theirs, ...(ours[event] ?? [])];
    if (combined.length > 0) merged[event] = combined;
  }

  if (Object.keys(merged).length > 0) settings.hooks = merged;
  else delete settings.hooks;

  writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
}

type HookMap = Record<string, Array<Record<string, unknown>>>;

export function isFrameworkHook(entry: Record<string, unknown>, frameworkRoot: string): boolean {
  const hooks = (entry.hooks ?? []) as Array<{ command?: string }>;
  return hooks.some((h) => typeof h.command === "string" && h.command.includes(frameworkRoot));
}

interface DiscoveredRule {
  name: string;
  path: string;
}

/**
 * The cross-domain rule files plus the reverse-engineering rule. Domain
 * rules stay where they are — each layer's `applies.yaml` points at them
 * per step, so surfacing them all here would defeat the scoped loading.
 */
function discoverRules(frameworkContent: string): DiscoveredRule[] {
  const out: DiscoveredRule[] = [];
  const roots = [
    resolve(frameworkContent, "rules"),
    resolve(frameworkContent, "reverse-engineering", "rules"),
  ];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      out.push({ name: entry.name, path: join(root, entry.name) });
    }
  }
  return out;
}


