import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { uninstallClaudeMd } from "../core/uninstall-claude-md";
import { uninstallFremiConfig } from "../core/uninstall-fremi-config";

/**
 * `fremi uninstall [path]` — removes PROJECT-level enganches. Since v0.3.0
 * skills / rules / hooks live at user level, so this command only reverses
 * the project-scoped artifacts: the CLAUDE.md block and .fremi/config.yaml.
 *
 * Preserves docs/works/ (real user content — user stories, PRDs, features)
 * and .fremi/settings/ (per-project overrides the user may have edited).
 *
 * To remove the user-level install too, use `fremi agent uninstall`.
 */
export async function runUninstall(rawPath?: string): Promise<void> {
  const targetPath = resolve(rawPath ?? process.cwd());

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  console.log(`==> Uninstalling fremi from project`);
  console.log(`    target:    ${targetPath}`);
  console.log("");

  const report = {
    claudeMd: await uninstallClaudeMd(targetPath),
    fremiConfig: await uninstallFremiConfig(targetPath),
  };

  console.log("==> Uninstall summary:");
  console.log(`    CLAUDE.md:    ${report.claudeMd.action}`);
  console.log(`    .fremi/:      ${report.fremiConfig.action}`);
  console.log("");
  console.log("Preserved (your content — remove manually if desired):");
  console.log(`    docs/works/`);
  console.log(`    .fremi/settings/`);
  console.log("");
  console.log("✓ fremi uninstall complete.");
  console.log("");
  console.log("To also remove the user-level install (skills, rules, bootstrap hook):");
  console.log("  fremi agent uninstall");
}
