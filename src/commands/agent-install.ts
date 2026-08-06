import { getFrameworkRoot, getFrameworkContentRoot } from "../core/paths";
import { ensureFrameworkContent } from "../core/ensure-framework";
import { gatherInstallAnswers, validateAgentsAreSupported } from "../prompts/install";
import { installClaudeUserLevel } from "../agents/claude/user-install";
import { writeUserMarker, readUserMarker } from "../core/user-marker";
import type { InstallFlags } from "./install";

/**
 * `fremi agent install` — installs fremi at USER level for the selected
 * agents. Skills, rules, and one bootstrap hook land in ~/.claude/ (for
 * Claude Code); other agents will get parallel install modules in future
 * releases.
 *
 * Idempotent: if the marker already reports the same agents, we skip.
 * Version comparison will land in v0.3.x.
 */
export async function runAgentInstall(flags: InstallFlags = {}): Promise<void> {
  const answers = await gatherInstallAnswers(flags);
  validateAgentsAreSupported(answers.agents);

  const frameworkRoot = getFrameworkRoot();
  ensureFrameworkContent(frameworkRoot);
  const frameworkContent = getFrameworkContentRoot();

  const home = process.env.HOME || process.env.USERPROFILE || "";
  if (!home) {
    throw new Error("Cannot resolve HOME/USERPROFILE — user-level install requires a home directory.");
  }

  console.log(`==> User-level install for agent(s): ${answers.agents.join(", ")}`);
  console.log(`    home:      ${home}`);
  console.log(`    framework: ${frameworkContent}`);
  console.log("");

  for (const agent of answers.agents) {
    if (agent !== "claude") continue; // gated by validateAgentsAreSupported
    const report = await installClaudeUserLevel(home, frameworkContent);
    console.log(`==> Claude Code user-level install`);
    console.log(`    Skills:         ${report.skills.installed} installed, ${report.skills.skipped} unchanged, ${report.skills.recreated} recreated`);
    console.log(`    Rules:          ${report.rules.installed} installed, ${report.rules.skipped} unchanged, ${report.rules.recreated} recreated`);
    console.log(`    Bootstrap hook: ${report.bootstrapHook.action}`);
    console.log("");
  }

  // Persist marker so `fremi install` knows this ran.
  const previous = readUserMarker();
  writeUserMarker({
    fremi_version: readEmbeddedVersion(),
    installed_at: new Date().toISOString(),
    agents: dedupe([...(previous?.agents ?? []), ...answers.agents]),
  });

  console.log("✓ fremi installed at user level.");
  console.log("");
  console.log("Next: `fremi install <path>` to enable fremi in a specific project.");
}

function readEmbeddedVersion(): string {
  // Match the constant in src/commands/version.ts so both stay in lockstep.
  return "0.3.0";
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
