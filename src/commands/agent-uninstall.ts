import { uninstallClaudePlugin } from "../agents/claude/plugin-uninstall";
import { removeUserMarker, readUserMarker, writeUserMarker } from "../core/user-marker";
import { gatherAgentUninstallAnswers, type AgentUninstallFlags } from "../prompts/agent-uninstall";

/**
 * `fremi agent uninstall` — interactive removal of user-level plugin
 * install per agent. Reads the marker to know which agents are installed,
 * asks which to remove, then reverses each plugin install.
 */
export async function runAgentUninstall(flags: AgentUninstallFlags = {}): Promise<void> {
  const marker = readUserMarker();
  if (!marker || marker.agents.length === 0) {
    console.log("No user-level install detected (missing ~/.claude/.fremi-installed).");
    return;
  }

  const answers = await gatherAgentUninstallAnswers(flags, marker.agents);
  if (answers.agents.length === 0) {
    console.log("No agents selected — nothing to uninstall.");
    return;
  }

  const home = process.env.HOME || process.env.USERPROFILE || "";

  console.log(`==> User-level plugin uninstall for agent(s): ${answers.agents.join(", ")}`);
  console.log(`    home: ${home}`);
  console.log("");

  for (const agent of answers.agents) {
    if (agent === "claude") {
      const report = await uninstallClaudePlugin(home);
      console.log(`==> Claude Code plugin uninstall`);
      console.log(`    plugin cache:   ${report.pluginRootRemoved ? "removed" : "not present"}`);
      console.log(`    registry:       ${report.registryUpdated ? "entry removed" : "unchanged"}`);
      console.log(`    settings:       ${report.settingsUpdated ? "enabledPlugins cleaned" : "unchanged"}`);
      console.log(`    marketplace:    ${report.marketplaceRemoved ? "removed" : "not present"}`);
      console.log(`                    known_marketplaces.json: ${report.marketplaceRegistryUpdated ? "entry removed" : "unchanged"}`);
      console.log(`                    settings.extraKnownMarketplaces: ${report.marketplaceSettingsUpdated ? "entry removed" : "unchanged"}`);
      console.log(`    mcp server:     ${report.mcpJsonRemoved ? "~/.claude/mcp/fremi.json removed" : "not present"}`);
      console.log(`                    permissions.allow: -${report.mcpPermissionsRemoved}`);
      if (report.errors.length > 0) {
        console.log(`    errors:`);
        for (const e of report.errors) console.log(`      - ${e}`);
      }
      console.log("");
    }
  }

  const remaining = marker.agents.filter((a) => !answers.agents.includes(a));
  if (remaining.length === 0) {
    removeUserMarker();
    console.log("✓ User-level plugin removed entirely.");
  } else {
    writeUserMarker({ ...marker, agents: remaining });
    console.log(`✓ Removed. Still installed for: ${remaining.join(", ")}`);
  }
}
