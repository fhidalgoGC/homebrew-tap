import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const FRAMEWORK_REPO = "https://github.com/fhidalgoGC/homebrew-tap.git";

/**
 * Paths inside the source repo that the CLI actually needs at runtime.
 * Everything else (src/, Formula/, Dockerfile*, package.json, install.*,
 * bun.lock, tsconfig, docs, bin) is developer-only and gets skipped by
 * the sparse-checkout below.
 */
const SPARSE_PATHS = ["framework", "VERSION", "LICENSE", "README.md"];

/**
 * Ensures the framework content is present at `frameworkRoot`. If missing,
 * clones only the paths listed in SPARSE_PATHS from the repo using git's
 * sparse-checkout — so the user's ~/.fremi/framework never ends up holding
 * the CLI source code, Docker files, Homebrew formula, etc.
 */
export function ensureFrameworkContent(frameworkRoot: string): void {
  if (existsSync(join(frameworkRoot, "VERSION"))) {
    return;
  }

  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    throw new Error(
      "git is required to fetch the framework content on first use. " +
        "Install git and re-run.",
    );
  }

  console.log(`==> First-run: fetching framework content`);
  console.log(`    ${FRAMEWORK_REPO}`);
  console.log(`    → ${frameworkRoot}`);
  console.log("");

  try {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse --quiet "${FRAMEWORK_REPO}" "${frameworkRoot}"`,
      { stdio: "inherit" },
    );
    // --no-cone lets us mix directory prefixes (`framework/`) with
    // top-level files (VERSION, LICENSE, README.md). Cone mode would
    // reject the files.
    execSync(
      `git -C "${frameworkRoot}" sparse-checkout set --no-cone ${SPARSE_PATHS.join(" ")}`,
      { stdio: "inherit" },
    );
  } catch (err) {
    throw new Error(
      `Failed to clone framework: ${(err as Error).message}. ` +
        "Check network access to GitHub and try again.",
    );
  }

  console.log("    ✓ Framework content installed.");
  console.log("");
}
