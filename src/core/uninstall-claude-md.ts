import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

export interface UninstallClaudeMdReport {
  action: "removed-block" | "removed-file" | "not-found" | "no-markers";
  errors: string[];
}

const FREMI_MARKER_START = "<!-- fremi-framework:start -->";
const FREMI_MARKER_END = "<!-- fremi-framework:end -->";

/**
 * Removes the fremi-framework block from CLAUDE.md. If the file only contained
 * that block, the file itself is deleted.
 */
export async function uninstallClaudeMd(targetPath: string): Promise<UninstallClaudeMdReport> {
  const claudeMdPath = resolve(targetPath, "CLAUDE.md");
  if (!existsSync(claudeMdPath)) {
    return { action: "not-found", errors: [] };
  }

  const current = readFileSync(claudeMdPath, "utf8");

  if (!current.includes(FREMI_MARKER_START) || !current.includes(FREMI_MARKER_END)) {
    return { action: "no-markers", errors: [] };
  }

  const stripped = current.replace(
    new RegExp(`${FREMI_MARKER_START}[\\s\\S]*?${FREMI_MARKER_END}\\n?`),
    "",
  );

  if (stripped.trim().length === 0) {
    unlinkSync(claudeMdPath);
    return { action: "removed-file", errors: [] };
  }

  writeFileSync(claudeMdPath, stripped);
  return { action: "removed-block", errors: [] };
}
