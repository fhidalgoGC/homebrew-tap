import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as YAML from "yaml";

// Read/mutate/write helpers for structured YAML editing. Uses the `yaml`
// package's Document API so comments and formatting survive the round
// trip. All setters preserve the original document layout.

/**
 * Parses a YAML file as a Document. Returns null if the file is missing
 * or unparseable.
 */
export function loadYamlDoc(filePath: string): YAML.Document.Parsed | null {
  if (!existsSync(filePath)) return null;
  try {
    return YAML.parseDocument(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Saves a Document back to its file preserving structure + comments.
 */
export function saveYamlDoc(filePath: string, doc: YAML.Document.Parsed): void {
  writeFileSync(filePath, doc.toString());
}

/**
 * Reads a value at a dotted path (e.g. "paths.features_dir" or
 * "identifiers.feature.prefix"). Returns undefined if the path doesn't
 * resolve to a scalar.
 */
export function getAtPath(doc: YAML.Document.Parsed, dottedPath: string): unknown {
  const parts = dottedPath.split(".");
  const value = doc.getIn(parts, true);
  if (value === undefined || value === null) return undefined;
  // YAML nodes need `.value` to reach the JS primitive.
  if (YAML.isScalar(value)) return value.value;
  return value;
}

/**
 * Writes a scalar value at a dotted path. Creates intermediate maps if
 * they don't exist. Preserves surrounding comments and layout.
 */
export function setAtPath(
  doc: YAML.Document.Parsed,
  dottedPath: string,
  value: string | number | boolean,
): void {
  const parts = dottedPath.split(".");
  doc.setIn(parts, value);
}

/**
 * Returns the list of KEYS under a given map path. e.g.
 * `listKeys(doc, "paths")` returns ["product_dir", "features_dir", ...].
 * Returns [] if the path isn't a map.
 */
export function listKeys(doc: YAML.Document.Parsed, dottedPath: string): string[] {
  const parts = dottedPath.length > 0 ? dottedPath.split(".") : [];
  const node = doc.getIn(parts, true);
  if (!node || !YAML.isMap(node)) return [];
  const keys: string[] = [];
  for (const item of node.items) {
    const key = item.key;
    if (YAML.isScalar(key)) {
      keys.push(String(key.value));
    } else if (typeof key === "string") {
      keys.push(key);
    }
  }
  return keys;
}
