import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const FRAMEWORK_REPO = "https://github.com/fhidalgoGC/homebrew-tap.git";

/**
 * Paths inside the source repo that the CLI needs at runtime. The repo has
 * a top-level `framework/` subdirectory that groups all framework content
 * (skills, rules, hooks, flows, etc.), plus a couple of loose metadata
 * files. `src/`, `Formula/`, Dockerfiles etc. are excluded.
 */
const SPARSE_PATHS = ["framework", "VERSION", "LICENSE", "README.md"];

/**
 * Ensures the framework content is present at `frameworkRoot`. Since v0.2.x
 * the clone target is `~/.fremi/` (not `~/.fremi/framework/`), so the
 * effective content path is `~/.fremi/framework/skills/` — a single
 * `framework/` in the path, not the doubled one that earlier v0.1.x
 * releases produced.
 *
 * Auto-migration handles two legacy layouts on first run:
 *   - v0.1.x: clone was at `~/.fremi/framework/`, producing the doubled
 *     `~/.fremi/framework/framework/VERSION`. Detected and wiped so the
 *     next clone lands at `~/.fremi/` with the correct single layout.
 *   - v0.2.0 (brief): the repo was flattened, producing `~/.fremi/framework/
 *     VERSION` alongside `skills/`, `rules/`, etc. at the same level (no
 *     nested `framework/`). Detected and wiped, then re-cloned.
 */
export function ensureFrameworkContent(frameworkRoot: string): void {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const legacyClone = home ? join(home, ".fremi", "framework") : "";

  // Migration 1: v0.1.x doubled layout — ~/.fremi/framework/framework/VERSION
  if (legacyClone && existsSync(join(legacyClone, "framework", "VERSION"))) {
    console.log(`==> Detected legacy v0.1.x layout at ${legacyClone}`);
    console.log(`    Migrating to standard clone target...`);
    execSync(`rm -rf "${legacyClone}"`, { stdio: "inherit" });
  }

  // Migration 2: brief v0.2.0 flat layout — ~/.fremi/framework/VERSION with
  // skills/ etc. at the same level and no nested framework/ subdir.
  if (
    legacyClone &&
    existsSync(join(legacyClone, "VERSION")) &&
    existsSync(join(legacyClone, "skills")) &&
    !existsSync(join(legacyClone, "framework", "skills"))
  ) {
    console.log(`==> Detected legacy v0.2.0 flat layout at ${legacyClone}`);
    console.log(`    Migrating to standard clone target...`);
    execSync(`rm -rf "${legacyClone}"`, { stdio: "inherit" });
  }

  // Fast path: already installed at the correct layout.
  if (
    existsSync(join(frameworkRoot, "VERSION")) &&
    existsSync(join(frameworkRoot, "framework", "skills"))
  ) {
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
    // `git clone` refuses non-empty target dirs. If frameworkRoot exists but
    // is NOT a valid git clone (no .git/), remove it first so we can start
    // fresh. This covers migration leftovers and partial installs.
    if (existsSync(frameworkRoot) && !existsSync(join(frameworkRoot, ".git"))) {
      execSync(`rm -rf "${frameworkRoot}"`, { stdio: "ignore" });
    }
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse --quiet "${FRAMEWORK_REPO}" "${frameworkRoot}"`,
      { stdio: "inherit" },
    );
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
