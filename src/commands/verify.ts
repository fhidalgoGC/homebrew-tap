import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readUserMarker } from "../core/user-marker";

/**
 * `fremi verify` — health + status check invoked by the user-level
 * SessionStart hook on every Claude Code session.
 *
 * Rules:
 *   1. If ~/.claude/.fremi-installed is missing → warn (user-level
 *      install not run yet).
 *   2. If the current project has .fremi/settings/config.user.yaml
 *      AND `enabled: true` inside → silent. Fremi is active here.
 *   3. Otherwise → inject an INACTIVE notice so Claude does NOT
 *      auto-invoke fremi-* skills in projects that never opted in.
 *
 * Legacy: pre-v0.4.11 installs kept this file at .fremi/config.yaml.
 * We still recognize that location as a fallback so old projects don't
 * suddenly turn inactive after a `brew upgrade fremi`.
 *
 * The stdout of this command feeds Claude Code's SessionStart context.
 * Silence on the happy path keeps the model's context clean; a short
 * bulletized message otherwise steers Claude away from fremi tooling.
 */
export async function runVerify(): Promise<void> {
  const projectCwd = await resolveProjectCwd();
  const marker = readUserMarker();

  const messages: string[] = [];

  if (!marker) {
    messages.push(
      "[fremi] user-level install is missing on this machine.\n" +
        "        Run: fremi agent install",
    );
  }

  const configPath = resolveProjectConfigPath(projectCwd);
  const projectStatus = evaluateProjectStatus(configPath);

  if (projectStatus === "inactive-no-config") {
    messages.push(
      "[fremi] fremi is INACTIVE in this project.\n" +
        "        .fremi/settings/config.user.yaml is missing.\n" +
        "        Do NOT invoke fremi-* skills unless the user explicitly requests\n" +
        "        them or asks to run `fremi install`.",
    );
  } else if (projectStatus === "inactive-disabled") {
    messages.push(
      "[fremi] fremi is INACTIVE in this project.\n" +
        "        .fremi/settings/config.user.yaml exists but `enabled: true` is not set.\n" +
        "        Do NOT invoke fremi-* skills. Ask the user to flip `enabled` to\n" +
        "        true (or remove the config) if they want fremi active here.",
    );
  }
  // projectStatus === "active" → no message (fremi runs normally)

  if (messages.length === 0) {
    return;
  }

  console.log("=== fremi status ===");
  for (const m of messages) {
    console.log(m);
  }
}

type ProjectStatus = "active" | "inactive-no-config" | "inactive-disabled";

// Prefer the new location under settings/. Fall back to the legacy
// path at .fremi/config.yaml so pre-v0.4.11 installs keep working
// until the user runs `fremi install` and the migration lands.
function resolveProjectConfigPath(projectCwd: string): string {
  const newPath = join(projectCwd, ".fremi", "settings", "config.user.yaml");
  if (existsSync(newPath)) return newPath;
  return join(projectCwd, ".fremi", "config.yaml");
}

function evaluateProjectStatus(configPath: string): ProjectStatus {
  if (!existsSync(configPath)) return "inactive-no-config";

  let content: string;
  try {
    content = readFileSync(configPath, "utf8");
  } catch {
    return "inactive-disabled";
  }

  // Look for `enabled: true` at the top level. Match any line that is
  // effectively `enabled: true`, tolerant of surrounding whitespace and
  // an optional trailing comment. Reject explicit `enabled: false`.
  //
  // Deliberate: parse with regex so we avoid pulling a full YAML lib
  // for what is a very simple top-level scalar check. If the user
  // nests `enabled: true` under a different key, that does NOT count.
  const lines = content.split("\n");
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trimEnd();
    // Must be a top-level key (no leading spaces).
    if (/^enabled:\s*true\s*$/.test(line)) return "active";
    if (/^enabled:\s*false\s*$/.test(line)) return "inactive-disabled";
  }
  // Key not present at top level.
  return "inactive-disabled";
}

async function resolveProjectCwd(): Promise<string> {
  if (process.stdin.isTTY) {
    return process.cwd();
  }

  try {
    const raw = await readStdinWithTimeout(500);
    if (!raw) return process.cwd();
    const parsed = JSON.parse(raw) as { cwd?: string };
    if (parsed.cwd && typeof parsed.cwd === "string") {
      return resolve(parsed.cwd);
    }
  } catch {
    // Malformed or empty stdin — that's fine.
  }
  return process.cwd();
}

function readStdinWithTimeout(timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    let buf = "";
    const timer = setTimeout(() => resolve(buf), timeoutMs);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      buf += chunk;
    });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      resolve(buf);
    });
    process.stdin.on("error", () => {
      clearTimeout(timer);
      resolve(buf);
    });
  });
}
