#!/usr/bin/env bun
/**
 * fremi — CLI entry point
 *
 * Commands (v0.2):
 *   fremi version              → prints framework version
 *   fremi install [path]       → interactive install into a project
 *      --agent LIST            → comma-separated agents (e.g. claude,cursor)
 *      --non-interactive | -y  → skip prompts, use defaults
 *   fremi uninstall [path]     → removes framework enganches
 *   fremi update               → pulls the latest framework content
 */

import { runVersion } from "./commands/version";
import { runInstall } from "./commands/install";
import type { InstallFlags } from "./commands/install";
import { runUninstall } from "./commands/uninstall";
import { runUpdate } from "./commands/update";

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "version":
    case "-v":
    case "--version":
      await runVersion();
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
  version                Show installed framework version
  install [path]         Install framework enganches into project
                         (defaults to \$PWD if path is omitted)
    --agent LIST           Comma-separated agents (claude,cursor,windsurf).
                           If omitted and TTY is present, an interactive
                           multiselect prompt is shown.
    --non-interactive, -y  Skip prompts. Uses --agent value if given,
                           otherwise defaults to 'claude'.
  uninstall [path]       Remove framework enganches from project
                         (preserves docs/works/ and .fremi/config.yaml)
  update                 Pull the latest framework content from GitHub
  help                   Show this help

Examples:
  fremi install                                → interactive, targets \$PWD
  fremi install ~/code/my-project              → interactive, custom path
  fremi install --agent claude -y              → non-interactive, claude only
  fremi install --agent claude,cursor          → interactive for other opts
  fremi uninstall
  fremi update
`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});
