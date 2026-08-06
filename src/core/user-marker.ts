import { existsSync, writeFileSync, readFileSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

/**
 * The marker file lives at ~/.claude/.fremi-installed and signals that
 * `fremi agent install` has already run for the current user. Its presence
 * is the fast-path check for `fremi install`: no marker → user-level
 * install must run first.
 */

export interface UserMarker {
  fremi_version: string;
  installed_at: string;
  agents: string[];
}

export function getUserMarkerPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return resolve(home, ".claude", ".fremi-installed");
}

export function readUserMarker(): UserMarker | null {
  const p = getUserMarkerPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as UserMarker;
  } catch {
    return null;
  }
}

export function writeUserMarker(data: UserMarker): void {
  const p = getUserMarkerPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

export function removeUserMarker(): boolean {
  const p = getUserMarkerPath();
  if (!existsSync(p)) return false;
  try {
    unlinkSync(p);
    return true;
  } catch {
    return false;
  }
}
