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
  rmSync,
} from "node:fs";
import { installFremiMarketplace, type MarketplaceInstallReport } from "./marketplace";
import { registerFremiMcp, type McpRegisterReport } from "./mcp-register";

// Materialises fremi as a native Claude Code plugin (same layout Engram
// uses). Everything lands under:
//   ~/.claude/plugins/cache/fremi/fremi/<version>/
//     .claude-plugin/plugin.json
//     .mcp.json                       (empty for now)
//     hooks/hooks.json                (the SessionStart bootstrap only)
// Then we register the plugin in ~/.claude/plugins/installed_plugins.json
// and enable it via ~/.claude/settings.json.enabledPlugins.
//
// Skills, rules and the framework's hooks are NOT here: they install
// per-project so a project carries its own fremi. What stays user-level is
// the MCP server and the bootstrap hook. See core/install-project-claude.ts.

const PLUGIN_NAME = "fremi";

export interface PluginInstallReport {
  pluginRoot: string;
  hooksJsonWritten: boolean;
  mcpJsonWritten: boolean;
  pluginJsonWritten: boolean;
  registeredInRegistry: boolean;
  enabledInSettings: boolean;
  prunedVersions: string[];
  marketplace: MarketplaceInstallReport;
  mcp: McpRegisterReport;
  errors: string[];
}

export async function installClaudePlugin(
  homePath: string,
  frameworkContent: string,
  version: string,
  opts: { withMcp: boolean } = { withMcp: true },
): Promise<PluginInstallReport> {
  const report: PluginInstallReport = {
    pluginRoot: "",
    hooksJsonWritten: false,
    mcpJsonWritten: false,
    pluginJsonWritten: false,
    registeredInRegistry: false,
    enabledInSettings: false,
    prunedVersions: [],
    marketplace: {
      marketplaceDir: "",
      cloned: false,
      updatedExisting: false,
      registeredInKnown: false,
      addedToSettings: false,
      errors: [],
    },
    mcp: {
      fremiJsonPath: "",
      fremiJsonWritten: false,
      permissionsAdded: 0,
      pluginMcpJsonUpdated: false,
      binaryPath: "",
      errors: [],
    },
    errors: [],
  };

  report.prunedVersions = prunePluginVersions(homePath, version);

  const pluginRoot = getPluginRoot(homePath, version);
  report.pluginRoot = pluginRoot;
  mkdirSync(pluginRoot, { recursive: true });

  writePluginJson(pluginRoot, version);
  report.pluginJsonWritten = true;

  writeMcpJson(pluginRoot);
  report.mcpJsonWritten = true;

  writeHooksJson(pluginRoot);
  report.hooksJsonWritten = true;

  registerInInstalledPlugins(homePath, pluginRoot, version);
  report.registeredInRegistry = true;

  enableInUserSettings(homePath);
  report.enabledInSettings = true;

  // Marketplace side: clone repo + register in known_marketplaces.json
  // + add to extraKnownMarketplaces so Claude Code recognises fremi
  // as a first-class plugin source (same treatment Engram gets).
  report.marketplace = installFremiMarketplace(homePath);
  report.errors.push(...report.marketplace.errors);

  // MCP side (optional): register when opts.withMcp is true. Writes
  // ~/.claude/mcp/fremi.json, extends permissions.allow, and populates
  // the plugin's .mcp.json so `fremi mcp` boots when Claude Code loads
  // the plugin.
  if (opts.withMcp) {
    report.mcp = registerFremiMcp(homePath, pluginRoot);
    report.errors.push(...report.mcp.errors);
  }

  return report;
}

/**
 * Removes plugin directories from previous versions. The install path is
 * versioned (…/fremi/fremi/<version>/), so without this every upgrade leaves
 * the old tree behind and the cache grows one copy per release.
 */
function prunePluginVersions(homePath: string, keepVersion: string): string[] {
  const base = resolve(homePath, ".claude", "plugins", "cache", PLUGIN_NAME, PLUGIN_NAME);
  if (!existsSync(base)) return [];

  const pruned: string[] = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === keepVersion) continue;
    try {
      rmSync(join(base, entry.name), { recursive: true, force: true });
      pruned.push(entry.name);
    } catch {
      // Leave it rather than fail the install over a stale directory.
    }
  }
  return pruned;
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

/**
 * Writes the plugin's hooks/hooks.json.
 *
 * Two layers land in the same file:
 *   1. The bootstrap hook — SessionStart calls `fremi verify` to inject
 *      project status into the session.
 *   2. Every framework hook discovered across the tree (framework/hooks/ plus
 *      the per-domain hooks/ dirs under artifacts/, pipelines/ and
 *      reverse-engineering/). Each hook declares its own event and matcher in
 *      its header, so no event mapping is hardcoded here.
 *
 * Commands are absolute paths into ~/.fremi/framework — resolved at install
 * time, refreshed by `fremi update` + reinstall.
 */
function writeHooksJson(pluginRoot: string): void {
  const path = join(pluginRoot, "hooks", "hooks.json");
  mkdirSync(dirname(path), { recursive: true });

  // ONLY the bootstrap. It has to be user-level because its whole job is to
  // run in projects that never installed fremi and report that fremi is
  // inactive there. The framework's own hooks install per-project into
  // .claude/settings.json — see core/install-project-claude.ts. Registering
  // them here too would fire every hook twice.
  const content = {
    description:
      "fremi bootstrap hook. Framework hooks live per-project in .claude/settings.json.",
    hooks: {
      SessionStart: [
        {
          matcher: "startup|clear",
          hooks: [{ type: "command", command: "fremi verify", timeout: 5 }],
        },
      ],
    },
  };
  writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
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
