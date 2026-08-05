import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { installSkills } from "../core/install-skills";
import { installHooks } from "../core/install-hooks";
import { installClaudeMd } from "../core/install-claude-md";
import { initDocsWorks } from "../core/init-docs-works";
import { initFremiConfig } from "../core/init-config";

export async function runInstall(rawPath?: string): Promise<void> {
  // 1. Resolve target project path — use CWD if not provided
  const targetPath = resolve(rawPath ?? process.cwd());

  // 2. Verify target exists and is a directory
  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  // 3. Framework paths (resolved from where fremi is installed)
  const frameworkRoot = getFrameworkRoot();
  const frameworkContent = getFrameworkContentRoot();

  if (!existsSync(frameworkContent)) {
    throw new Error(
      `Framework content not found at ${frameworkContent}. ` +
        `Try reinstalling: curl -sL https://raw.githubusercontent.com/fhidalgoGC/homebrew-tap/main/install.sh | bash`,
    );
  }

  console.log(`==> Installing fremi-framework enganches`);
  console.log(`    target:    ${targetPath}`);
  console.log(`    framework: ${frameworkContent}`);
  console.log("");

  // 4. Execute install steps (idempotent — safe to re-run)
  const report = {
    skills: await installSkills(targetPath, frameworkContent),
    hooks: await installHooks(targetPath, frameworkContent),
    claudeMd: await installClaudeMd(targetPath, frameworkContent),
    docsWorks: await initDocsWorks(targetPath),
    config: await initFremiConfig(targetPath, frameworkRoot),
  };

  // 5. Report
  console.log("");
  console.log("==> Install summary:");
  console.log(`    Skills:       ${report.skills.installed} installed, ${report.skills.skipped} unchanged, ${report.skills.recreated} recreated`);
  console.log(`    Hooks:        ${report.hooks.registered} registered in .claude/settings.json`);
  console.log(`    CLAUDE.md:    ${report.claudeMd.action}`);
  console.log(`    docs/works/:  ${report.docsWorks.action}`);
  console.log(`    .fremi/:      ${report.config.action}`);
  console.log("");
  console.log("✓ fremi install complete. Restart Claude Code to load the skills.");
}
