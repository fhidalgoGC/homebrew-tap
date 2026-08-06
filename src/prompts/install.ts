import { shouldPrompt, askSelect, note, intro } from "./_helpers";
import type { InstallFlags } from "../commands/install";

/**
 * Agents the CLI recognises. Only `claude` is fully implemented today; the
 * others show up in the interactive prompt as "planned — not yet implemented"
 * so the roadmap stays visible.
 */
export const SUPPORTED_AGENTS = ["claude"] as const;
export type SupportedAgent = (typeof SUPPORTED_AGENTS)[number];

const AGENT_CATALOG = [
  { value: "claude", label: "Claude Code", hint: "ready" },
  { value: "cursor", label: "Cursor", hint: "planned — not yet implemented" },
  { value: "windsurf", label: "Windsurf", hint: "planned — not yet implemented" },
  { value: "aider", label: "Aider", hint: "planned — not yet implemented" },
] as const;

const DONE_TOKEN = "__done__";

export interface InstallAnswers {
  agents: string[];
}

/**
 * Gathers all interactive answers for `fremi install`. Precedence order:
 *   1. Explicit --agent LIST flag wins (any TTY state).
 *   2. Interactive prompt when TTY + no --non-interactive.
 *   3. Fallback default (["claude"]) for non-TTY / --non-interactive.
 */
export async function gatherInstallAnswers(
  flags: InstallFlags,
): Promise<InstallAnswers> {
  let agents: string[];

  if (flags.agent) {
    agents = flags.agent.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (shouldPrompt(flags)) {
    agents = await pickAgentsLoop(["claude"]);
  } else {
    agents = ["claude"];
  }

  return { agents };
}

/**
 * Loop-style multiselect: press ENTER on an agent to toggle it, then
 * navigate down to "✓ Done" to finalize. Compared to @clack/prompts'
 * standard multiselect (SPACE = toggle, ENTER = submit), this is more
 * discoverable — one key, one action, obvious "finish" affordance.
 *
 * Draws a fresh menu each iteration by re-invoking select(). The screen
 * scrolls, but the flow reads naturally top to bottom.
 */
async function pickAgentsLoop(defaults: string[]): Promise<string[]> {
  const selected = new Set<string>(defaults);
  let firstIteration = true;

  while (true) {
    if (firstIteration) {
      intro("fremi install — pick your targets");
      firstIteration = false;
    }

    const options = [
      ...AGENT_CATALOG.map((a) => ({
        value: a.value,
        label: `${selected.has(a.value) ? "◼" : "◻"}  ${a.label}`,
        hint: a.hint,
      })),
      {
        value: DONE_TOKEN,
        label: `✓  Done — proceed with ${selected.size} agent${selected.size === 1 ? "" : "s"}`,
        hint: selected.size === 0 ? "select at least one first" : "confirm and continue",
      },
    ];

    const choice = await askSelect({
      message: "Toggle an agent (ENTER) or pick Done to finish:",
      options,
    });

    if (choice === DONE_TOKEN) {
      if (selected.size === 0) {
        note("Select at least one agent before continuing.", "⚠ empty selection");
        continue;
      }
      return Array.from(selected);
    }

    if (selected.has(choice)) {
      selected.delete(choice);
    } else {
      selected.add(choice);
    }
  }
}

/**
 * Fails fast if any of the selected agents is not yet implemented.
 * Called AFTER gatherInstallAnswers so the same rule applies whether the
 * user picked via flag or via prompt.
 */
export function validateAgentsAreSupported(agents: string[]): void {
  const unsupported = agents.filter(
    (a) => !SUPPORTED_AGENTS.includes(a as SupportedAgent),
  );
  if (unsupported.length > 0) {
    throw new Error(
      `Agent(s) not yet supported: ${unsupported.join(", ")}. ` +
        `Currently implemented: ${SUPPORTED_AGENTS.join(", ")}. ` +
        `Track progress in the fremi-framework roadmap.`,
    );
  }
}
