import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Small helpers for editing per-layer .user.yaml files in a project's
// .fremi/settings/. We deliberately do NOT pull in a full YAML parser:
// the fields we touch (`active: true|false`) live at the top level of
// hand-written YAML files, and line-based regex preserves comments,
// blank lines, and formatting.

export type ActiveState = "true" | "false" | "missing" | "malformed";

/**
 * Reads a settings file and returns the current value of the top-level
 * `active` key. "missing" if the key isn't present; "malformed" if the
 * value isn't the literal string `true` or `false`.
 */
export function readActive(filePath: string): ActiveState {
  if (!existsSync(filePath)) return "missing";
  const content = readFileSync(filePath, "utf8");
  for (const raw of content.split("\n")) {
    const line = raw.replace(/#.*$/, "").trimEnd();
    const match = line.match(/^active:\s*(\S+)\s*$/);
    if (!match) continue;
    const value = match[1];
    if (value === "true" || value === "false") return value;
    return "malformed";
  }
  return "missing";
}

/**
 * Flips the `active` key of a settings file between true and false.
 * Returns the new value. Throws when the file is missing or the key
 * cannot be located (caller should validate with readActive first).
 */
export function toggleActive(filePath: string): "true" | "false" {
  if (!existsSync(filePath)) {
    throw new Error(`Settings file not found: ${filePath}`);
  }
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  let newValue: "true" | "false" | null = null;
  const rewritten = lines.map((raw) => {
    if (newValue !== null) return raw;
    const stripped = raw.replace(/#.*$/, "").trimEnd();
    const match = stripped.match(/^active:\s*(true|false)\s*$/);
    if (!match) return raw;
    const current = match[1] as "true" | "false";
    newValue = current === "true" ? "false" : "true";
    // Preserve the original line ending (comments, spacing) as much as
    // reasonable by replacing only the boolean token.
    return raw.replace(/(active:\s*)(true|false)/, `$1${newValue}`);
  });

  if (newValue === null) {
    throw new Error(`No top-level 'active: true|false' key found in ${filePath}`);
  }

  writeFileSync(filePath, rewritten.join("\n"));
  return newValue;
}
