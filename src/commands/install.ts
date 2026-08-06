import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { ensureFrameworkContent } from "../core/ensure-framework";
import { installSkills } from "../core/install-skills";
import { installHooks } from "../core/install-hooks";
import { installRules } from "../core/install-rules";
import { installClaudeMd } from "../core/install-claude-md";
import { installUserSettings } from "../core/install-user-settings";
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

  // 3. Framework paths — auto-clone framework content on first run.
  const frameworkRoot = getFrameworkRoot();
  ensureFrameworkContent(frameworkRoot);
  const frameworkContent = getFrameworkContentRoot();

  if (!existsSync(frameworkContent)) {
    throw new Error(
      `Framework content directory missing after clone: ${frameworkContent}. ` +
        "This is unexpected — please open an issue.",
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
    rules: await installRules(targetPath, frameworkContent),
    claudeMd: await installClaudeMd(targetPath, frameworkContent),
    userSettings: await installUserSettings(targetPath, frameworkContent),
    docsWorks: await initDocsWorks(targetPath),
    config: await initFremiConfig(targetPath, frameworkRoot),
  };

  // 5. Report
  console.log("");
  console.log("==> Install summary:");
  console.log(`    Skills:       ${report.skills.installed} installed, ${report.skills.skipped} unchanged, ${report.skills.recreated} recreated`);
  console.log(`    Hooks:        ${report.hooks.registered} registered in .claude/settings.json`);
  console.log(`    Rules:        ${report.rules.installed} installed, ${report.rules.skipped} unchanged, ${report.rules.recreated} recreated`);
  console.log(`    CLAUDE.md:    ${report.claudeMd.action}`);
  console.log(`    Settings:     ${report.userSettings.copied} copied, ${report.userSettings.skipped} kept (already customized)`);
  console.log(`    docs/works/:  ${report.docsWorks.action}`);
  console.log(`    .fremi/:      ${report.config.action}`);
  console.log("");
  console.log(`✓ fremi-framework installed in ${targetPath}`);
  console.log("");
  console.log("Next steps:");
  console.log("  → Restart Claude Code (or reload the workspace) to load the skills");
  console.log("  → Update framework later:   fremi update");
  console.log("  → Remove from this project: fremi uninstall");
}
