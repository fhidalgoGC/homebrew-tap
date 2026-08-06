import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { ensureFrameworkContent } from "../core/ensure-framework";
import { installClaudeMd } from "../core/install-claude-md";
import { installUserSettings } from "../core/install-user-settings";
import { initDocsWorks } from "../core/init-docs-works";
import { initFremiConfig } from "../core/init-config";
import { readUserMarker } from "../core/user-marker";
import { runAgentInstall } from "./agent-install";

export interface InstallFlags {
  agent?: string;             // comma-separated list of agents, e.g. "claude,cursor"
  nonInteractive?: boolean;   // skip prompts, use defaults or --agent value
  withMcp?: boolean;          // true = --with-mcp, false = --no-mcp, undefined = ask/default
}

/**
 * `fremi install [path]` — installs fremi enganches at PROJECT level.
 *
 * Since v0.3.0 the heavy content (skills, rules, bootstrap hook) lives at
 * user level under ~/.claude/. This command only writes per-project
 * artifacts: the CLAUDE.md block, user-editable settings under
 * .fremi/settings/, docs/works/, and .fremi/config.yaml.
 *
 * If the user-level marker is missing we transparently run
 * `fremi agent install` first (same interactive/flag semantics) so the
 * user only ever runs one command.
 */
export async function runInstall(rawPath?: string, flags: InstallFlags = {}): Promise<void> {
  // 1. Resolve target project path — use CWD if not provided
  const targetPath = resolve(rawPath ?? process.cwd());

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  // 2. Verify user-level install (marker check). If missing, run
  //    `fremi agent install` first so the same prompt/flags satisfy both.
  if (!readUserMarker()) {
    console.log("==> No user-level install detected. Running `fremi agent install` first...");
    console.log("");
    await runAgentInstall(flags);
    console.log("");
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

  console.log(`==> Installing fremi-framework in project`);
  console.log(`    target:    ${targetPath}`);
  console.log(`    framework: ${frameworkContent}`);
  console.log("");

  // 4. Project-level artifacts ONLY. Skills / rules / hooks live at user
  //    level (installed via `fremi agent install`). Everything below is
  //    idempotent — safe to re-run.
  const report = {
    claudeMd: await installClaudeMd(targetPath, frameworkContent),
    userSettings: await installUserSettings(targetPath, frameworkContent),
    docsWorks: await initDocsWorks(targetPath),
    config: await initFremiConfig(targetPath, frameworkRoot),
  };

  // 5. Report
  console.log("==> Install summary:");
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
