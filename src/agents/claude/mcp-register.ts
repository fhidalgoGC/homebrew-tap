import { resolve, dirname, basename } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  realpathSync,
} from "node:fs";
import { execSync } from "node:child_process";

// Registers the fremi CLI as a Claude Code MCP server. Writes
// ~/.claude/mcp/fremi.json (the same "loose" location Engram uses for
// its MCP entry), adds fremi's tool patterns to settings.json's
// permissions.allow, and updates the plugin's .mcp.json so Claude Code
// wires the server on plugin load.

const MCP_NAME = "fremi";
const MCP_ARGS = ["mcp"];
const FREMI_TOOLS = [
  "mcp__fremi__project_status",
  "mcp__fremi__list_features",
  "mcp__fremi__list_stories",
  "mcp__fremi__list_enablers",
  "mcp__plugin_fremi_fremi__project_status",
  "mcp__plugin_fremi_fremi__list_features",
  "mcp__plugin_fremi_fremi__list_stories",
  "mcp__plugin_fremi_fremi__list_enablers",
] as const;

export interface McpRegisterReport {
  fremiJsonPath: string;
  fremiJsonWritten: boolean;
  permissionsAdded: number;
  pluginMcpJsonUpdated: boolean;
  binaryPath: string;
  errors: string[];
}

export function registerFremiMcp(homePath: string, pluginRoot: string): McpRegisterReport {
  const report: McpRegisterReport = {
    fremiJsonPath: "",
    fremiJsonWritten: false,
    permissionsAdded: 0,
    pluginMcpJsonUpdated: false,
    binaryPath: "",
    errors: [],
  };

  try {
    // 1. Resolve how to invoke fremi. Absolute paths only: ~/.claude/mcp/*.json
    //    entries are exec'd directly, so they must not depend on PATH.
    const invocation = resolveMcpInvocation();
    report.binaryPath = [invocation.command, ...invocation.args].join(" ");

    // 2. Write ~/.claude/mcp/fremi.json - the Engram-style loose config.
    const mcpJsonPath = resolve(homePath, ".claude", "mcp", `${MCP_NAME}.json`);
    report.fremiJsonPath = mcpJsonPath;
    mkdirSync(dirname(mcpJsonPath), { recursive: true });
    writeFileSync(
      mcpJsonPath,
      JSON.stringify({ command: invocation.command, args: invocation.args }, null, 2) + "\n",
    );
    report.fremiJsonWritten = true;

    // 3. Add allow-list entries for the tool patterns so Claude Code
    //    doesn't prompt on every call.
    report.permissionsAdded = mergePermissions(homePath);

    // 4. Update the plugin's own .mcp.json so the plugin declares the
    //    MCP server it ships with (Claude Code merges this with the
    //    loose config in step 2).
    updatePluginMcpJson(pluginRoot);
    report.pluginMcpJsonUpdated = true;
  } catch (err) {
    report.errors.push((err as Error).message);
  }

  return report;
}

export function unregisterFremiMcp(homePath: string): {
  fremiJsonRemoved: boolean;
  permissionsRemoved: number;
  errors: string[];
} {
  const result = { fremiJsonRemoved: false, permissionsRemoved: 0, errors: [] as string[] };

  const mcpJsonPath = resolve(homePath, ".claude", "mcp", `${MCP_NAME}.json`);
  if (existsSync(mcpJsonPath)) {
    try {
      unlinkSync(mcpJsonPath);
      result.fremiJsonRemoved = true;
    } catch (err) {
      result.errors.push(`Failed to remove ${mcpJsonPath}: ${(err as Error).message}`);
    }
  }

  const settingsPath = resolve(homePath, ".claude", "settings.json");
  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>;
      const perms = settings.permissions as { allow?: string[] } | undefined;
      if (perms?.allow) {
        const before = perms.allow.length;
        perms.allow = perms.allow.filter((p) => !FREMI_TOOLS.includes(p as (typeof FREMI_TOOLS)[number]));
        const removed = before - perms.allow.length;
        if (perms.allow.length === 0) {
          delete perms.allow;
          if (Object.keys(perms).length === 0) {
            delete settings.permissions;
          }
        }
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        result.permissionsRemoved = removed;
      }
    } catch (err) {
      result.errors.push(`Failed to update permissions: ${(err as Error).message}`);
    }
  }

  return result;
}

interface McpInvocation {
  command: string;
  args: string[];
}

function resolveMcpInvocation(): McpInvocation {
  // Register whatever is ACTUALLY running, so a brew install, a curl
  // install, a local dev build and a from-source run each point at
  // themselves instead of at whatever `which fremi` happens to find.
  const running = process.execPath;

  // 1. Compiled binary (brew / curl / `scripts/build.sh`): for a Bun
  //    single-file executable process.execPath IS that binary.
  if (running && basename(running).startsWith(MCP_NAME)) {
    // A package manager may expose a stable symlink on PATH that points at a
    // version-pinned real path (brew: bin/fremi -> Cellar/fremi/X.Y.Z/bin/fremi,
    // and execPath resolves symlinks). Prefer the symlink when it designates
    // this same binary, so the entry survives `brew upgrade`.
    const onPath = whichFremi();
    if (onPath && realPath(onPath) === realPath(running)) {
      return { command: onPath, args: [...MCP_ARGS] };
    }
    return { command: running, args: [...MCP_ARGS] };
  }

  // 2. Running from TypeScript source (`bun run src/index.ts`, i.e. the
  //    sandbox's fast path): execPath is bun-the-runtime, so pair it with
  //    the entry script. Without this the MCP would silently point at an
  //    unrelated installed binary rather than the code being edited.
  const entry = process.argv[1];
  if (running && entry && entry.endsWith(".ts")) {
    return { command: running, args: [entry, ...MCP_ARGS] };
  }

  // 3. Last resort: an installation somewhere on PATH.
  const onPath = whichFremi();
  if (onPath) return { command: onPath, args: [...MCP_ARGS] };

  return { command: MCP_NAME, args: [...MCP_ARGS] };
}

function whichFremi(): string | null {
  try {
    const out = execSync(`which ${MCP_NAME}`, { encoding: "utf8" }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function realPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

function mergePermissions(homePath: string): number {
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

  const perms = (settings.permissions ?? {}) as { allow?: string[]; defaultMode?: string };
  const existingAllow = new Set(perms.allow ?? []);
  let added = 0;
  for (const tool of FREMI_TOOLS) {
    if (!existingAllow.has(tool)) {
      existingAllow.add(tool);
      added++;
    }
  }
  perms.allow = Array.from(existingAllow).sort();
  settings.permissions = perms;

  writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
  return added;
}

function updatePluginMcpJson(pluginRoot: string): void {
  const path = resolve(pluginRoot, ".mcp.json");
  // Plugin-embedded .mcp.json matches Engram's pattern: the command is
  // the bare binary name, resolved via PATH at runtime. Keeps the plugin
  // portable across brew / curl / dev installs where the absolute path
  // differs. The loose ~/.claude/mcp/fremi.json still uses the resolved
  // absolute path for stable direct invocation.
  const content = {
    mcpServers: {
      [MCP_NAME]: {
        command: MCP_NAME,
        args: MCP_ARGS,
      },
    },
  };
  writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
}
