import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves the framework root — the directory that holds skills/, hooks/,
 * rules/, flows/, pipelines/, settings/, VERSION, etc.
 *
 * As of v0.2.0 the framework content lives at the top level of the cloned
 * repo (no more nested `framework/` subdirectory). Both `getFrameworkRoot()`
 * and `getFrameworkContentRoot()` now return the same path — the latter is
 * kept as an alias for callers that still reference it.
 *
 * Resolution order:
 *   1. FREMI_HOME env var if set (used by tests and dev overrides).
 *   2. Walk up from this file (dev mode — `bun run dev`).
 *   3. Fallback to ~/.fremi/framework (production, installed by curl or brew).
 */
export function getFrameworkRoot(): string {
  const envOverride = process.env.FREMI_HOME;
  if (envOverride) return resolve(envOverride);

  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // src/core/paths.ts → walk up 2 levels to repo root.
    const candidate = resolve(here, "..", "..");
    if (isFrameworkRoot(candidate)) return candidate;
  } catch {
    // Compiled binary — no meaningful __dirname.
  }

  const home = process.env.HOME || process.env.USERPROFILE || "";
  return resolve(home, ".fremi", "framework");
}

/**
 * Since v0.2.0 the framework content sits at the repo root, so the content
 * root equals the framework root. Kept as a named export so existing
 * `import { getFrameworkContentRoot }` sites keep working.
 */
export function getFrameworkContentRoot(): string {
  return getFrameworkRoot();
}

function isFrameworkRoot(dir: string): boolean {
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    // A valid root has a VERSION marker plus at least one of the framework
    // content dirs (skills/ or rules/). Guards against pointing at a random
    // dir that happens to have a VERSION file.
    if (!fs.existsSync(resolve(dir, "VERSION"))) return false;
    return fs.existsSync(resolve(dir, "skills")) || fs.existsSync(resolve(dir, "rules"));
  } catch {
    return false;
  }
}
