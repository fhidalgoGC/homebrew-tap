import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const FRAMEWORK_REPO = "https://github.com/fhidalgoGC/homebrew-tap.git";

/**
 * Ensures the framework content (skills, hooks, rules, flows, templates) is
 * present at `frameworkRoot`. If it's missing, clones the repo synchronously.
 * This is the "first-run" bootstrap that lets `brew install fremi` be a
 * single command — the binary self-provisions its content on demand.
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
    execSync(`git clone --quiet "${FRAMEWORK_REPO}" "${frameworkRoot}"`, {
      stdio: "inherit",
    });
  } catch (err) {
    throw new Error(
      `Failed to clone framework: ${(err as Error).message}. ` +
        "Check network access to GitHub and try again.",
    );
  }

  console.log("    ✓ Framework content installed.");
  console.log("");
}
