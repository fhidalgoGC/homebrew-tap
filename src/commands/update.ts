import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { getFrameworkRoot } from "../core/paths";

/**
 * Updates the local framework content by running `git pull` inside
 * ~/.fremi/framework. Sparse-checkout config is preserved automatically.
 *
 * Projects that have `fremi install`-ed enganches will pick up the new
 * skills/hooks the next time the user runs `fremi install` in them
 * (idempotent — symlinks are refreshed to the new targets).
 */
export async function runUpdate(): Promise<void> {
  const frameworkRoot = getFrameworkRoot();

  if (!existsSync(join(frameworkRoot, "VERSION"))) {
    throw new Error(
      `Framework not installed yet at ${frameworkRoot}. ` +
        "Run `fremi install <path>` first — it fetches the framework on first use.",
    );
  }

  console.log(`==> Updating framework at ${frameworkRoot}`);
  console.log("");

  try {
    execSync(`git -C "${frameworkRoot}" pull --quiet`, { stdio: "inherit" });
  } catch (err) {
    throw new Error(`git pull failed: ${(err as Error).message}`);
  }

  const newVersion = (() => {
    try {
      const { readFileSync } = require("node:fs") as typeof import("node:fs");
      return readFileSync(join(frameworkRoot, "VERSION"), "utf8").trim();
    } catch {
      return "unknown";
    }
  })();

  console.log("");
  console.log(`✓ Framework updated (v${newVersion}).`);
  console.log("");
  console.log("If you want a project to pick up the changes, run in that project:");
  console.log("  fremi install");
}
