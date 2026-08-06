import { shouldPrompt, askSelect } from "./_helpers";

const DONE_TOKEN = "__done__";

export interface AgentUninstallFlags {
  agent?: string;
  nonInteractive?: boolean;
}

export interface AgentUninstallAnswers {
  agents: string[];
}

/**
 * Loop-select for `fremi agent uninstall`. The list of options is scoped
 * to whatever the marker reports as previously installed — you can't
 * uninstall what you never installed. Same UX as gatherInstallAnswers:
 * ENTER toggles an agent, "Done" finalizes.
 */
export async function gatherAgentUninstallAnswers(
  flags: AgentUninstallFlags,
  installedAgents: string[],
): Promise<AgentUninstallAnswers> {
  if (installedAgents.length === 0) {
    return { agents: [] };
  }

  if (flags.agent) {
    const requested = flags.agent.split(",").map((s) => s.trim()).filter(Boolean);
    // Only allow removing agents that are actually installed.
    return { agents: requested.filter((a) => installedAgents.includes(a)) };
  }

  if (!shouldPrompt(flags)) {
    // Non-interactive → remove everything the marker knows about.
    return { agents: installedAgents };
  }

  const selected = new Set<string>();

  while (true) {
    const options = [
      ...installedAgents.map((a) => ({
        value: a,
        label: `${selected.has(a) ? "◼" : "◻"}  ${labelFor(a)}`,
      })),
      {
        value: DONE_TOKEN,
        label: `✓  Done — uninstall ${selected.size} agent${selected.size === 1 ? "" : "s"}`,
        hint: selected.size === 0 ? "select at least one first" : "confirm and remove",
      },
    ];

    const choice = await askSelect({
      message: "Toggle an agent to uninstall (ENTER) or pick Done to finish:",
      options,
    });

    if (choice === DONE_TOKEN) {
      if (selected.size === 0) continue;
      return { agents: Array.from(selected) };
    }

    if (selected.has(choice)) {
      selected.delete(choice);
    } else {
      selected.add(choice);
    }
  }
}

function labelFor(agent: string): string {
  switch (agent) {
    case "claude":
      return "Claude Code";
    case "cursor":
      return "Cursor";
    case "windsurf":
      return "Windsurf";
    case "aider":
      return "Aider";
    default:
      return agent;
  }
}
