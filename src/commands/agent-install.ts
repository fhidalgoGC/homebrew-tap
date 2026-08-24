import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { ensureFrameworkContent } from "../core/ensure-framework";
import { gatherInstallAnswers, validateAgentsAreSupported } from "../prompts/install";
import { installClaudePlugin } from "../agents/claude/plugin-install";
import { writeUserMarker, readUserMarker } from "../core/user-marker";
import { sweepLegacyUserAssets } from "../core/sweep-legacy-user-assets";
import type { InstallFlags } from "./install";

const FREMI_VERSION = "0.4.20";

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

  // Migration: older versions symlinked every skill and rule into the home
  // directory. Nothing creates those anymore, so clear them before writing
  // the plugin — otherwise the old copies keep shadowing the per-project ones.
  const legacy = sweepLegacyUserAssets(home);
  if (legacy.skillsRemoved.length > 0 || legacy.rulesRemoved.length > 0) {
    console.log("==> Cleaned up assets left by an older fremi");
    if (legacy.skillsRemoved.length > 0) {
      console.log(`    ~/.claude/skills: ${legacy.skillsRemoved.length} stale symlink(s) removed`);
    }
    if (legacy.rulesRemoved.length > 0) {
      console.log(`    ~/.claude/rules:  ${legacy.rulesRemoved.length} stale symlink(s) removed`);
    }
    console.log("    (skills and rules install per-project since v0.4.19)");
    console.log("");
  }
  for (const e of legacy.errors) console.log(`    ! ${e}`);

  for (const agent of answers.agents) {
    if (agent !== "claude") continue;
    const report = await installClaudePlugin(home, frameworkContent, FREMI_VERSION, {
      withMcp: answers.withMcp,
    });
    console.log(`==> Claude Code plugin`);
    console.log(`    plugin root:  ${report.pluginRoot}`);
    console.log(`    plugin.json:  ${report.pluginJsonWritten ? "written" : "skipped"}`);
    console.log(`    .mcp.json:    ${report.mcpJsonWritten ? "written" : "skipped"}`);
    console.log(`    hooks.json:   ${report.hooksJsonWritten ? "written" : "skipped"} (SessionStart bootstrap)`);
    if (report.prunedVersions.length > 0) {
      console.log(`    old versions: pruned ${report.prunedVersions.join(", ")}`);
    }
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
  console.log("Skills, rules and framework hooks install per-project — run `fremi install` there.");
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
