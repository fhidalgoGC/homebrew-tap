import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { ensureFrameworkContent } from "../core/ensure-framework";
import { gatherInstallAnswers, validateAgentsAreSupported } from "../prompts/install";
import { installClaudePlugin } from "../agents/claude/plugin-install";
import { writeUserMarker, readUserMarker } from "../core/user-marker";
import type { InstallFlags } from "./install";

const FREMI_VERSION = "0.4.16";

// `fremi agent install` - materialises fremi as a plugin at USER level for
// every selected agent. For Claude Code that means writing to
// ~/.claude/plugins/cache/fremi/fremi/<version>/ and registering the plugin
// so Claude picks it up on next session start.

export async function runAgentInstall(flags: InstallFlags = {}): Promise<void> {
  const answers = await gatherInstallAnswers(flags);
  validateAgentsAreSupported(answers.agents);

  const frameworkRoot = getFrameworkRoot();
  ensureFrameworkContent(frameworkRoot);
  const frameworkContent = getFrameworkContentRoot();

  const home = process.env.HOME || process.env.USERPROFILE || "";
  if (!home) {
    throw new Error("Cannot resolve HOME/USERPROFILE - user-level install requires a home directory.");
  }

  console.log(`==> User-level plugin install for agent(s): ${answers.agents.join(", ")}`);
  console.log(`    home:      ${home}`);
  console.log(`    framework: ${frameworkContent}`);
  console.log("");

  for (const agent of answers.agents) {
    if (agent !== "claude") continue;
    const report = await installClaudePlugin(home, frameworkContent, FREMI_VERSION, {
      withMcp: answers.withMcp,
    });
    console.log(`==> Claude Code plugin`);
    console.log(`    plugin root:  ${report.pluginRoot}`);
    console.log(`    skills:       ${report.skillsInstalled} installed, ${report.skillsSkipped} unchanged, ${report.skillsRecreated} recreated`);
    console.log(`    plugin.json:  ${report.pluginJsonWritten ? "written" : "skipped"}`);
    console.log(`    .mcp.json:    ${report.mcpJsonWritten ? "written" : "skipped"}`);
    console.log(`    hooks.json:   ${report.hooksJsonWritten ? "written (SessionStart -> fremi verify)" : "skipped"}`);
    console.log(`    registry:     ${report.registeredInRegistry ? "added to installed_plugins.json" : "unchanged"}`);
    console.log(`    settings:     ${report.enabledInSettings ? "enabledPlugins updated" : "unchanged"}`);
    const mkt = report.marketplace;
    const mktAction = mkt.cloned ? "cloned" : mkt.updatedExisting ? "updated" : "unchanged";
    console.log(`    marketplace:  ${mktAction} at ${mkt.marketplaceDir}`);
    console.log(`                  known_marketplaces.json: ${mkt.registeredInKnown ? "registered" : "unchanged"}`);
    console.log(`                  settings.extraKnownMarketplaces: ${mkt.addedToSettings ? "updated" : "unchanged"}`);
    const mcp = report.mcp;
    if (answers.withMcp) {
      console.log(`    mcp server:   ${mcp.fremiJsonWritten ? "registered" : "unchanged"} at ${mcp.fremiJsonPath}`);
      console.log(`                  binary: ${mcp.binaryPath}`);
      console.log(`                  plugin .mcp.json: ${mcp.pluginMcpJsonUpdated ? "populated" : "unchanged"}`);
      console.log(`                  permissions.allow: +${mcp.permissionsAdded}`);
    } else {
      console.log(`    mcp server:   skipped (opted out)`);
    }
    if (report.errors.length > 0) {
      console.log(`    errors:`);
      for (const e of report.errors) console.log(`      - ${e}`);
    }
    console.log("");
  }

  const previous = readUserMarker();
  writeUserMarker({
    fremi_version: FREMI_VERSION,
    installed_at: new Date().toISOString(),
    agents: dedupe([...(previous?.agents ?? []), ...answers.agents]),
  });

  console.log("✓ fremi installed as user-level plugin.");
  console.log("");
  console.log("Restart Claude Code (or open a new session) to load the plugin.");
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
