#!/usr/bin/env bun
/**
 * fremi — CLI entry point
 *
 * Commands (v0.1):
 *   fremi version           → prints framework version
 *   fremi install [path]    → installs framework enganches into a project
 *   fremi uninstall [path]  → removes framework enganches
 *   fremi update            → pulls the latest framework content
 */

import { runVersion } from "./commands/version";
import { runInstall } from "./commands/install";
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

    case "install":
      await runInstall(rest[0]);
      break;

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

function printHelp(): void {
  console.log(`
fremi — Product Discovery + SDD + BDD + TDD framework CLI

Usage:
  fremi <command> [args]

Commands:
  version               Show installed framework version
  install [path]        Install framework enganches into project
                        (defaults to \$PWD if path is omitted)
  uninstall [path]      Remove framework enganches from project
                        (preserves docs/works/ and .fremi/config.yaml)
  update                Pull the latest framework content from GitHub
  help                  Show this help

Examples:
  fremi version
  fremi install
  fremi install ~/code/my-project
  fremi uninstall
  fremi update
`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});
