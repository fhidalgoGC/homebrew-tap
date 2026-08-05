import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { getFrameworkContentRoot } from "../core/paths";
import { uninstallSkills } from "../core/uninstall-skills";
import { uninstallHooks } from "../core/uninstall-hooks";
import { uninstallClaudeMd } from "../core/uninstall-claude-md";
import { uninstallFremiConfig } from "../core/uninstall-fremi-config";

export async function runUninstall(rawPath?: string): Promise<void> {
  const targetPath = resolve(rawPath ?? process.cwd());

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  const frameworkContent = getFrameworkContentRoot();

  console.log(`==> Uninstalling fremi-framework enganches`);
  console.log(`    target:    ${targetPath}`);
  console.log(`    framework: ${frameworkContent}`);
  console.log("");

  const report = {
    skills: await uninstallSkills(targetPath, frameworkContent),
    hooks: await uninstallHooks(targetPath, frameworkContent),
    claudeMd: await uninstallClaudeMd(targetPath),
    fremiConfig: await uninstallFremiConfig(targetPath),
  };

  console.log("==> Uninstall summary:");
  console.log(`    Skills:       ${report.skills.removed} removed, ${report.skills.kept} kept (non-fremi)`);
  console.log(`    Hooks:        ${report.hooks.removed} removed from .claude/settings.json`);
  console.log(`    CLAUDE.md:    ${report.claudeMd.action}`);
  console.log(`    .fremi/:      ${report.fremiConfig.action}`);
  console.log("");
  console.log("Preserved (your content — remove manually if desired):");
  console.log(`    docs/works/`);
  console.log("");
  console.log("✓ fremi uninstall complete.");
}
