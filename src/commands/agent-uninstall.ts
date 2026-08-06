import { getFrameworkContentRoot } from "../core/paths";
import { uninstallClaudeUserLevel } from "../agents/claude/user-uninstall";
import { removeUserMarker, readUserMarker, writeUserMarker } from "../core/user-marker";
import { gatherAgentUninstallAnswers, type AgentUninstallFlags } from "../prompts/agent-uninstall";

/**
 * `fremi agent uninstall` — interactive removal of USER-level installs.
 *
 * Behavior:
 *   1. Read marker to know which agents were installed.
 *   2. Prompt (loop-select) for which of those to uninstall.
 *   3. Run each agent's uninstall module.
 *   4. Update marker: remove uninstalled agents. If none remain, remove
 *      the marker entirely so `fremi install` treats the machine as
 *      fresh again.
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

  const frameworkContent = getFrameworkContentRoot();
  const home = process.env.HOME || process.env.USERPROFILE || "";

  console.log(`==> User-level uninstall for agent(s): ${answers.agents.join(", ")}`);
  console.log(`    home: ${home}`);
  console.log("");

  for (const agent of answers.agents) {
    if (agent === "claude") {
      const report = await uninstallClaudeUserLevel(home, frameworkContent);
      console.log(`==> Claude Code user-level uninstall`);
      console.log(`    Skills:         ${report.skills.removed} removed, ${report.skills.kept} kept (non-fremi)`);
      console.log(`    Rules:          ${report.rules.removed} removed, ${report.rules.kept} kept (non-fremi)`);
      console.log(`    Bootstrap hook: ${report.bootstrapHook.removed} removed from settings.json`);
      console.log("");
    }
  }

  // Update marker: strip removed agents.
  const remaining = marker.agents.filter((a) => !answers.agents.includes(a));
  if (remaining.length === 0) {
    removeUserMarker();
    console.log("✓ User-level install removed entirely.");
  } else {
    writeUserMarker({ ...marker, agents: remaining });
    console.log(`✓ Removed. Still installed for: ${remaining.join(", ")}`);
  }
}
