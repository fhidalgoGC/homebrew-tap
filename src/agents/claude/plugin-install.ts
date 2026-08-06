import { resolve, join, dirname } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { installFremiMarketplace, type MarketplaceInstallReport } from "./marketplace";

// Materialises fremi as a native Claude Code plugin (same layout Engram
// uses). Everything lands under:
//   ~/.claude/plugins/cache/fremi/fremi/<version>/
//     .claude-plugin/plugin.json
//     .mcp.json                       (empty for now)
//     hooks/hooks.json                (SessionStart -> `fremi verify`)
//     skills/fremi-*/SKILL.md         (symlinks into ~/.fremi/framework)
// Then we register the plugin in ~/.claude/plugins/installed_plugins.json
// and enable it via ~/.claude/settings.json.enabledPlugins.

const PLUGIN_NAME = "fremi";

export interface PluginInstallReport {
  pluginRoot: string;
  skillsInstalled: number;
  skillsSkipped: number;
  skillsRecreated: number;
  hooksJsonWritten: boolean;
  mcpJsonWritten: boolean;
  pluginJsonWritten: boolean;
  registeredInRegistry: boolean;
  enabledInSettings: boolean;
  marketplace: MarketplaceInstallReport;
  errors: string[];
}

export async function installClaudePlugin(
  homePath: string,
  frameworkContent: string,
  version: string,
): Promise<PluginInstallReport> {
  const report: PluginInstallReport = {
    pluginRoot: "",
    skillsInstalled: 0,
    skillsSkipped: 0,
    skillsRecreated: 0,
    hooksJsonWritten: false,
    mcpJsonWritten: false,
    pluginJsonWritten: false,
    registeredInRegistry: false,
    enabledInSettings: false,
    marketplace: {
      marketplaceDir: "",
      cloned: false,
      updatedExisting: false,
      registeredInKnown: false,
      addedToSettings: false,
      errors: [],
    },
    errors: [],
  };

  const pluginRoot = getPluginRoot(homePath, version);
  report.pluginRoot = pluginRoot;
  mkdirSync(pluginRoot, { recursive: true });

  writePluginJson(pluginRoot, version);
  report.pluginJsonWritten = true;

  writeMcpJson(pluginRoot);
  report.mcpJsonWritten = true;

  writeHooksJson(pluginRoot);
  report.hooksJsonWritten = true;

  const skillsReport = symlinkSkillsIntoPlugin(pluginRoot, frameworkContent);
  report.skillsInstalled = skillsReport.installed;
  report.skillsSkipped = skillsReport.skipped;
  report.skillsRecreated = skillsReport.recreated;
  report.errors.push(...skillsReport.errors);

  registerInInstalledPlugins(homePath, pluginRoot, version);
  report.registeredInRegistry = true;

  enableInUserSettings(homePath);
  report.enabledInSettings = true;

  // Marketplace side: clone repo + register in known_marketplaces.json
  // + add to extraKnownMarketplaces so Claude Code recognises fremi
  // as a first-class plugin source (same treatment Engram gets).
  report.marketplace = installFremiMarketplace(homePath);
  report.errors.push(...report.marketplace.errors);

  return report;
}

function getPluginRoot(homePath: string, version: string): string {
  return resolve(homePath, ".claude", "plugins", "cache", PLUGIN_NAME, PLUGIN_NAME, version);
}

function writePluginJson(pluginRoot: string, version: string): void {
  const path = join(pluginRoot, ".claude-plugin", "plugin.json");
  mkdirSync(dirname(path), { recursive: true });
  const content = {
    name: PLUGIN_NAME,
    description: "Product Discovery + SDD + BDD + TDD framework for AI coding agents",
    version,
    author: { name: "fhidalgoGC" },
    homepage: "https://github.com/fhidalgoGC/homebrew-tap",
    repository: "https://github.com/fhidalgoGC/homebrew-tap",
    license: "MIT",
  };
  writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
}

function writeMcpJson(pluginRoot: string): void {
  const path = join(pluginRoot, ".mcp.json");
  writeFileSync(path, JSON.stringify({ mcpServers: {} }, null, 2) + "\n");
}

function writeHooksJson(pluginRoot: string): void {
  const path = join(pluginRoot, "hooks", "hooks.json");
  mkdirSync(dirname(path), { recursive: true });
  const content = {
    description: "fremi bootstrap - SessionStart calls `fremi verify` to inject project status.",
    hooks: {
      SessionStart: [
        {
          matcher: "startup|clear",
          hooks: [
            {
              type: "command",
              command: "fremi verify",
              timeout: 5,
            },
          ],
        },
      ],
    },
  };
  writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
}

function symlinkSkillsIntoPlugin(
  pluginRoot: string,
  frameworkContent: string,
): { installed: number; skipped: number; recreated: number; errors: string[] } {
  const result = { installed: 0, skipped: 0, recreated: 0, errors: [] as string[] };
  const skillsDst = join(pluginRoot, "skills");
  mkdirSync(skillsDst, { recursive: true });

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

  for (const { name, skillDir } of discovered) {
    if (!name.startsWith("fremi-")) {
      result.errors.push(`Skipped ${skillDir}: skill name "${name}" doesn't start with 'fremi-'`);
      continue;
    }
    const linkPath = join(skillsDst, name);
    const action = ensureSymlink(linkPath, skillDir);
    result[action]++;
  }

  return result;
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
    const nested = join(dir, "skills");
    if (existsSync(nested) && lstatSync(nested).isDirectory()) {
      walkForSkills(nested, out);
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

function registerInInstalledPlugins(homePath: string, pluginRoot: string, version: string): void {
  const path = resolve(homePath, ".claude", "plugins", "installed_plugins.json");
  mkdirSync(dirname(path), { recursive: true });

  let registry: {
    version?: number;
    plugins?: Record<string, Array<{ scope: string; installPath: string; version: string; installedAt: string; lastUpdated: string; gitCommitSha?: string }>>;
  } = {};

  if (existsSync(path)) {
    try {
      registry = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      registry = {};
    }
  }

  const key = `${PLUGIN_NAME}@${PLUGIN_NAME}`;
  const entry = {
    scope: "user",
    installPath: pluginRoot,
    version,
    installedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  registry.version = registry.version ?? 2;
  registry.plugins = registry.plugins ?? {};
  registry.plugins[key] = [entry];

  writeFileSync(path, JSON.stringify(registry, null, 2) + "\n");
}

function enableInUserSettings(homePath: string): void {
  const path = resolve(homePath, ".claude", "settings.json");
  mkdirSync(dirname(path), { recursive: true });

  let settings: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      settings = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      settings = {};
    }
  }

  const enabled = (settings.enabledPlugins ?? {}) as Record<string, boolean>;
  enabled[`${PLUGIN_NAME}@${PLUGIN_NAME}`] = true;
  settings.enabledPlugins = enabled;

  writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
}
