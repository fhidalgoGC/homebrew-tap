import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const FRAMEWORK_REPO = "https://github.com/fhidalgoGC/homebrew-tap.git";

/**
 * Top-level paths inside the source repo that the CLI actually needs at
 * runtime. As of v0.2.0 the framework content sits at the repo root, so
 * these are directly the layer dirs plus a few files.
 */
const SPARSE_PATHS = [
  "skills",
  "rules",
  "hooks",
  "flows",
  "pipelines",
  "reverse-engineering",
  "settings",
  "installs",
  "plugins",
  "commands",
  "VERSION",
  "LICENSE",
  "README.md",
];

/**
 * Ensures the framework content is present at `frameworkRoot`.
 *
 * If missing → sparse clone with the paths above (skips CLI source, Formula,
 * Dockerfiles, etc.).
 *
 * v0.2.0 migration: if we detect the OLD nested layout (a `framework/`
 * subdirectory containing VERSION), remove the whole clone and start over
 * so the user ends up on the new flat layout automatically. This is a
 * one-time correction that happens on the first command after upgrading.
 */
export function ensureFrameworkContent(frameworkRoot: string): void {
  // v0.2.0 migration: old nested layout has framework/framework/VERSION.
  const nestedVersion = join(frameworkRoot, "framework", "VERSION");
  if (existsSync(nestedVersion)) {
    console.log(`==> Detected legacy nested framework at ${frameworkRoot}`);
    console.log(`    Migrating to flat layout (v0.2.0)...`);
    try {
      execSync(`rm -rf "${frameworkRoot}"`, { stdio: "inherit" });
    } catch (err) {
      throw new Error(
        `Failed to remove legacy framework dir: ${(err as Error).message}`,
      );
    }
  }

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
