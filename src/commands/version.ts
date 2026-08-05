import { readFileSync } from "node:fs";
import { getFrameworkRoot } from "../core/paths";

/**
 * Compile-time embedded version — this is the version of the CLI binary
 * itself, and is what `fremi version` reports when the framework content
 * has not yet been fetched (first-run before `fremi install`).
 *
 * Bump this and the top-level VERSION file in lockstep on release.
 */
const EMBEDDED_VERSION = "0.1.3";

export async function runVersion(): Promise<void> {
  const root = getFrameworkRoot();

  // Prefer the framework's VERSION file (may be newer than the binary if
  // the user ran `git -C ~/.fremi/framework pull`). Fall back to the
  // embedded constant so `fremi version` works before first install.
  let version = EMBEDDED_VERSION;
  try {
    const fromFile = readFileSync(`${root}/VERSION`, "utf8").trim();
    if (fromFile) version = fromFile;
  } catch {
    // Framework not present yet — that's fine, use embedded version.
  }

  console.log(`fremi-framework v${version}`);
  console.log(`installed at: ${root}`);
}
