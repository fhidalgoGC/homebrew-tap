import { shouldPrompt, askMultiselect } from "./_helpers";
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

export interface InstallAnswers {
  agents: string[];
}

/**
 * Gathers all interactive answers for `fremi install`. Precedence order:
 *   1. Explicit --agent LIST flag wins (any TTY state).
 *   2. Interactive prompt when TTY + no --non-interactive.
 *   3. Fallback default (["claude"]) for non-TTY / --non-interactive.
 *
 * As `install` grows more questions (install mode, per-agent options, etc.),
 * add them here and expose them on the InstallAnswers return type.
 */
export async function gatherInstallAnswers(
  flags: InstallFlags,
): Promise<InstallAnswers> {
  let agents: string[];

  if (flags.agent) {
    agents = flags.agent.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (shouldPrompt(flags)) {
    agents = await askMultiselect({
      message: "Which agent(s) do you want to install for?",
      options: AGENT_CATALOG.map((opt) => ({ ...opt })),
      defaults: ["claude"],
    });
  } else {
    agents = ["claude"];
  }

  return { agents };
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
