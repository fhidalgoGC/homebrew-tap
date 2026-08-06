#!/usr/bin/env bun
/**
 * fremi — CLI entry point
 *
 * Commands (v0.3):
 *   fremi agent install        → install fremi at USER level (~/.claude/)
 *   fremi agent uninstall      → remove user-level install
 *   fremi install [path]       → install PROJECT-level artifacts
 *      --agent LIST            → comma-separated agents (default prompt)
 *      --non-interactive | -y  → skip prompts, use defaults
 *   fremi uninstall [path]     → remove project-level artifacts
 *   fremi update               → git pull inside ~/.fremi
 *   fremi verify               → health check (used by SessionStart hook)
 *   fremi version              → prints CLI + framework version
 */

import { runVersion } from "./commands/version";
import { runInstall } from "./commands/install";
import type { InstallFlags } from "./commands/install";
import { runUninstall } from "./commands/uninstall";
import { runUpdate } from "./commands/update";
import { runVerify } from "./commands/verify";
import { runAgentInstall } from "./commands/agent-install";
import { runAgentUninstall } from "./commands/agent-uninstall";
import { runSetting } from "./commands/setting";
import { runMcp } from "./commands/mcp";

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "version":
    case "-v":
    case "--version":
      await runVersion();
      break;

    case "verify":
      await runVerify();
      break;

    case "install": {
      const { path, flags } = parseInstallArgs(rest);
      await runInstall(path, flags);
      break;
    }

    case "uninstall":
      await runUninstall(rest[0]);
      break;

    case "update":
      await runUpdate();
      break;

    case "setting":
    case "settings":
      await runSetting(rest[0]);
      break;

    case "mcp":
      await runMcp();
      break;

    case "agent": {
      const sub = rest[0];
      const subArgs = rest.slice(1);
      if (sub === "install") {
        const { flags } = parseInstallArgs(subArgs);
        await runAgentInstall(flags);
      } else if (sub === "uninstall") {
        const { flags } = parseInstallArgs(subArgs);
        await runAgentUninstall(flags);
      } else {
        console.error(`Unknown 'agent' subcommand: ${sub ?? "(none)"}\n`);
        printHelp();
        process.exit(1);
      }
      break;
    }

    case undefined:
    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;

    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

function parseInstallArgs(args: string[]): { path?: string; flags: InstallFlags } {
  const flags: InstallFlags = {};
  let path: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--agent" && i + 1 < args.length) {
      flags.agent = args[i + 1];
      i++;
      continue;
    }
    if (arg.startsWith("--agent=")) {
      flags.agent = arg.slice("--agent=".length);
      continue;
    }
    if (arg === "--non-interactive" || arg === "-y" || arg === "--yes") {
      flags.nonInteractive = true;
      continue;
    }
    if (arg === "--with-mcp") {
      flags.withMcp = true;
      continue;
    }
    if (arg === "--no-mcp") {
      flags.withMcp = false;
      continue;
    }
    if (!arg.startsWith("-") && !path) {
      path = arg;
      continue;
    }
    // Unknown flag — ignore silently (forward compat).
  }

  return { path, flags };
}

function printHelp(): void {
  console.log(`
fremi — Product Discovery + SDD + BDD + TDD framework CLI

Usage:
  fremi <command> [args]

Commands:
  agent install          Install fremi at USER level (~/.claude/) — skills,
                         rules, and one bootstrap hook. Run once per machine.
    --agent LIST           Comma-separated agents (claude only for now).
                           If omitted and TTY is present, an interactive
                           multiselect prompt is shown.
    --non-interactive, -y  Skip prompts, default to 'claude'.

  agent uninstall        Remove the user-level install.

  install [path]         Install fremi at PROJECT level.
                         Auto-runs 'agent install' first if not done yet.
                         Writes: CLAUDE.md block, .fremi/config.yaml,
                                 .fremi/settings/, docs/works/.
    --agent LIST, -y       (Same flags as 'agent install'.)

  uninstall [path]       Remove project-level artifacts (CLAUDE.md block,
                         .fremi/config.yaml). Preserves docs/works/ and
                         .fremi/settings/.

  update                 Pull the latest framework content from GitHub.
  verify                 Health check (silent when everything is OK).
  version                Show installed framework version.
  help                   Show this help.

Examples:
  fremi agent install                          → interactive user-level setup
  fremi install                                → project-level (auto-agent-install if needed)
  fremi install ~/code/my-project --agent claude -y
  fremi uninstall                              → project-level cleanup
  fremi agent uninstall                        → full user-level cleanup
  fremi update
`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});
