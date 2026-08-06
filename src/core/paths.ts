import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The FREMI HOME — the directory where the framework repo is cloned.
 * On disk this is `~/.fremi/` by default. Inside it sits the sparse clone
 * of homebrew-tap, containing the top-level `framework/` subdirectory
 * (plus VERSION, LICENSE, README.md, .git/).
 *
 *   ~/.fremi/                       ← this dir (clone target, "framework root")
 *   ├── .git/
 *   ├── framework/                  ← the actual content root
 *   │   ├── skills/
 *   │   ├── rules/
 *   │   ├── hooks/
 *   │   └── ...
 *   ├── VERSION
 *   ├── LICENSE
 *   └── README.md
 */
export function getFrameworkRoot(): string {
  const envOverride = process.env.FREMI_HOME;
  if (envOverride) return resolve(envOverride);

  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // src/core/paths.ts → walk up 2 levels to repo root (dev mode).
    const candidate = resolve(here, "..", "..");
    if (isFrameworkRoot(candidate)) return candidate;
  } catch {
    // Compiled binary — no meaningful __dirname.
  }

  const home = process.env.HOME || process.env.USERPROFILE || "";
  return resolve(home, ".fremi");
}

/**
 * The `framework/` subdirectory inside the clone. This is where skills,
 * rules, hooks, flows, pipelines, settings, etc. live. Everything the CLI
 * consumes at runtime is under this path.
 */
export function getFrameworkContentRoot(): string {
  return resolve(getFrameworkRoot(), "framework");
}

function isFrameworkRoot(dir: string): boolean {
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    // A valid clone root has VERSION at its top level AND a framework/
    // subdir with skills/ inside it (the framework content).
    return (
      fs.existsSync(resolve(dir, "VERSION")) &&
      fs.existsSync(resolve(dir, "framework", "skills"))
    );
  } catch {
    return false;
  }
}
