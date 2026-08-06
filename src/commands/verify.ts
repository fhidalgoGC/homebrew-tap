import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readUserMarker } from "../core/user-marker";

/**
 * `fremi verify` — health check invoked by the user-level SessionStart hook.
 *
 * Purpose: when Claude Code opens a workspace, this runs silently. It has
 * TWO checks:
 *   1. User-level install present (marker + framework content).
 *   2. THIS project has `.fremi/config.yaml` at its root.
 *
 * Anything missing gets printed to stdout. SessionStart hooks feed stdout
 * into the model's context, so Claude sees exactly what needs to happen
 * and can suggest `fremi install` (or `fremi agent install`) to the user.
 *
 * Silent when both levels are healthy — no context noise for well-set-up
 * projects. Never blocks: filesystem checks only, no network.
 *
 * The hook passes SessionStart JSON on stdin (session_id, cwd, ...). We
 * read cwd from there to know which project to inspect. If no stdin
 * (called from a plain terminal), we fall back to `process.cwd()`.
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

  const projectMarker = join(projectCwd, ".fremi", "config.yaml");
  if (!existsSync(projectMarker)) {
    messages.push(
      "[fremi] this project has no .fremi/config.yaml.\n" +
        "        The fremi framework is available but not installed here.\n" +
        "        Ask the user before running: fremi install",
    );
  }

  if (messages.length === 0) {
    // Silent success — nothing to inject.
    return;
  }

  console.log("=== fremi status ===");
  for (const m of messages) {
    console.log(m);
  }
}

/**
 * Reads stdin best-effort for the SessionStart JSON payload
 * (`{ "session_id": "...", "cwd": "..." }`) and returns the cwd. Falls
 * back to `process.cwd()` if stdin is absent or malformed — so `fremi
 * verify` works as a standalone CLI command too.
 */
async function resolveProjectCwd(): Promise<string> {
  // If stdin is not a piped input, don't block waiting for it.
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
