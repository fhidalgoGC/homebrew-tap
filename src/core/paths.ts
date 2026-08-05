import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves the framework root — the directory containing the CLI + framework/.
 *
 * When compiled with `bun --compile`, `import.meta.url` points at the binary
 * embedded location. We walk up until we find the marker file (VERSION or
 * package.json). Falls back to `~/.fremi/framework` if walking fails.
 */
export function getFrameworkRoot(): string {
  // When running from source (`bun run dev`), import.meta.url points at src/core/paths.ts
  // When compiled, it points at the binary — but Bun's compile embeds the source,
  // so relative paths within `../../` still work if the layout is intact.
  //
  // Simpler + robust strategy: use FREMI_HOME env var if set, else ~/.fremi/framework.
  const envOverride = process.env.FREMI_HOME;
  if (envOverride) return resolve(envOverride);

  // Dev fallback: walk up from this file to find VERSION marker.
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // src/core/paths.ts → walk up 2 levels to repo root
    const candidate = resolve(here, "..", "..");
    if (isFrameworkRoot(candidate)) return candidate;
  } catch {
    // Compiled binary — no meaningful __dirname
  }

  // Production default: ~/.fremi/framework (installed by install.sh)
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return resolve(home, ".fremi", "framework");
}

/**
 * The `framework/` subdirectory that holds skills/hooks/rules/etc.
 */
export function getFrameworkContentRoot(): string {
  return resolve(getFrameworkRoot(), "framework");
}

function isFrameworkRoot(dir: string): boolean {
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    return fs.existsSync(resolve(dir, "VERSION")) && fs.existsSync(resolve(dir, "framework"));
  } catch {
    return false;
  }
}
