import { resolve, join } from "node:path";
import { accessSync, constants, existsSync, readdirSync, readFileSync } from "node:fs";

/**
 * Framework hook discovery.
 *
 * Hooks are no longer centralised: each domain owns its own `hooks/` dir
 * (artifacts/<layer>/hooks/, pipelines/<p>/hooks/, reverse-engineering/<skill>/hooks/)
 * next to its rules and workflow.yaml. Cross-domain hooks stay in
 * framework/hooks/. This module walks the whole framework tree, so adding a
 * hook to any domain is picked up on the next install with no code change.
 *
 * Each hook declares its Claude Code event in its header comment:
 *
 *     # Tipo: PostToolUse
 *     # Matcher (sugerido): { "tool_name": "Edit|Write", ... }
 *
 * `# Tipo recomendado:` is accepted as a synonym. Files whose basename starts
 * with `_` are shared bash libraries meant to be `source`d, never executed as
 * hooks — they are skipped.
 */

export interface DiscoveredHook {
  /** Absolute path to the .sh file. */
  command: string;
  /** Claude Code hook event, e.g. "PostToolUse". */
  event: string;
  /** Tool-name matcher, only meaningful for Pre/PostToolUse events. */
  matcher?: string;
  /** Framework-relative path, for reporting. */
  relPath: string;
}

export interface DiscoverHooksResult {
  hooks: DiscoveredHook[];
  /**
   * Files that looked like hooks but were not wired: no usable `# Tipo:`
   * header, or missing the executable bit. Both are authoring bugs worth
   * surfacing — a non-executable hook would fail on every event it matched.
   */
  skipped: string[];
}

/** Events Claude Code accepts in a hooks config. */
const KNOWN_EVENTS = new Set([
  "PreToolUse",
  "PostToolUse",
  "UserPromptSubmit",
  "Stop",
  "SubagentStop",
  "SessionStart",
  "SessionEnd",
  "Notification",
  "PreCompact",
]);

/** Events that take a tool-name matcher. Others are matcher-less. */
const MATCHER_EVENTS = new Set(["PreToolUse", "PostToolUse"]);

/** Fallback matcher when a Pre/PostToolUse hook declares none. */
const DEFAULT_TOOL_MATCHER = "Edit|Write";

/** Dirs we never descend into while looking for hooks/ dirs. */
const PRUNED_DIRS = new Set([".git", "node_modules", "references"]);

export function discoverFrameworkHooks(frameworkContent: string): DiscoverHooksResult {
  const result: DiscoverHooksResult = { hooks: [], skipped: [] };
  const root = resolve(frameworkContent);
  if (!existsSync(root)) return result;

  for (const hooksDir of findDirsNamed(root, "hooks")) {
    for (const file of readdirSync(hooksDir).sort()) {
      if (!file.endsWith(".sh")) continue;
      if (file.startsWith("_")) continue; // shared lib, source-only

      const command = join(hooksDir, file);
      const relPath = command.slice(root.length + 1);
      const header = readHeader(command);
      const event = parseEvent(header);

      if (!event || !KNOWN_EVENTS.has(event)) {
        result.skipped.push(`${relPath} (no '# Tipo:' header)`);
        continue;
      }

      if (!isExecutable(command)) {
        result.skipped.push(`${relPath} (not executable — needs chmod +x)`);
        continue;
      }

      const hook: DiscoveredHook = { command, event, relPath };
      if (MATCHER_EVENTS.has(event)) {
        hook.matcher = parseToolMatcher(header) ?? DEFAULT_TOOL_MATCHER;
      }
      result.hooks.push(hook);
    }
  }

  return result;
}

/**
 * Groups discovered hooks into the shape Claude Code expects:
 *   { <Event>: [ { matcher?, hooks: [{ type, command, timeout }] } ] }
 * Hooks sharing an event + matcher collapse into a single entry.
 */
export function toHooksConfig(
  hooks: DiscoveredHook[],
  opts: { timeout?: number } = {},
): Record<string, Array<Record<string, unknown>>> {
  const config: Record<string, Array<Record<string, unknown>>> = {};

  for (const hook of hooks) {
    const entries = (config[hook.event] ??= []);
    let entry = entries.find((e) => e.matcher === hook.matcher);
    if (!entry) {
      entry = hook.matcher ? { matcher: hook.matcher, hooks: [] } : { hooks: [] };
      entries.push(entry);
    }
    const commands = entry.hooks as Array<Record<string, unknown>>;
    commands.push({
      type: "command",
      command: hook.command,
      ...(opts.timeout ? { timeout: opts.timeout } : {}),
    });
  }

  return config;
}

function findDirsNamed(root: string, name: string): string[] {
  const found: string[] = [];
  const stack = [root];

  while (stack.length > 0) {
    const dir = stack.pop() as string;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (PRUNED_DIRS.has(entry.name)) continue;
      const child = join(dir, entry.name);
      if (entry.name === name) {
        found.push(child);
        continue; // hooks dirs don't nest
      }
      stack.push(child);
    }
  }

  return found.sort();
}

/** First 40 lines — the header comment block. */
function readHeader(path: string): string {
  try {
    return readFileSync(path, "utf8").split("\n").slice(0, 40).join("\n");
  } catch {
    return "";
  }
}

function parseEvent(header: string): string | null {
  const match = header.match(/^#\s*Tipo(?:\s+recomendado)?\s*:\s*([A-Za-z]+)/m);
  return match?.[1] ?? null;
}

function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function parseToolMatcher(header: string): string | null {
  const match = header.match(/"tool_name"\s*:\s*"([^"]+)"/);
  return match?.[1] ?? null;
}
