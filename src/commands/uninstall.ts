import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { uninstallClaudeMd } from "../core/uninstall-claude-md";
import { uninstallFremiConfig } from "../core/uninstall-fremi-config";
import { runAgentUninstall } from "./agent-uninstall";

export interface UninstallFlags {
  /** Remove the whole .fremi/ tree, not just config.user.yaml. */
  purge?: boolean;
  /** Chain the user-level uninstall (skills, hooks, marketplace, mcp). */
  withUser?: boolean;
  /** Forwarded to the user-level uninstall when withUser is set. */
  agent?: string;
  nonInteractive?: boolean;
}

/**
 * `fremi uninstall [path]` — removes PROJECT-level enganches. Since v0.3.0
 * skills / rules / hooks live at user level, so by default this command only
 * reverses the project-scoped artifacts: the CLAUDE.md block and
 * .fremi/settings/config.user.yaml (the master switch).
 *
 * Two flags widen the blast radius:
 *   --purge       also removes the rest of .fremi/ (settings + catalog).
 *   --with-user   also runs the user-level uninstall, so nothing fremi
 *                 remains for ANY project (skills, hooks.json, plugin
 *                 registry, marketplace, mcp registration, marker).
 *
 * docs/works/ is NEVER removed, with or without flags — it holds the user's
 * real work (PRDs, stories, decisions), not framework scaffolding. Delete it
 * by hand if that is really what you want.
 */
export async function runUninstall(
  rawPath?: string,
  flags: UninstallFlags = {},
): Promise<void> {
  const targetPath = resolve(rawPath ?? process.cwd());

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  console.log(`==> Uninstalling fremi from project`);
  console.log(`    target:    ${targetPath}`);
  console.log(`    mode:      ${flags.purge ? "purge (.fremi/ removed entirely)" : "default (keeps your .user.yaml overrides)"}`);
  console.log("");

  const report = {
    claudeMd: await uninstallClaudeMd(targetPath),
    fremiConfig: await uninstallFremiConfig(targetPath, { purge: flags.purge }),
  };

  console.log("==> Uninstall summary:");
  console.log(`    CLAUDE.md:    ${report.claudeMd.action}`);
  console.log(`    .fremi/:      ${report.fremiConfig.action}`);
  for (const e of [...report.claudeMd.errors, ...report.fremiConfig.errors]) {
    console.log(`    error:        ${e}`);
  }
  console.log("");

  // Be explicit about leftovers. A summary that only names directories reads
  // as "nothing left" when in fact the per-project overrides are still there.
  const kept = report.fremiConfig.kept;
  if (kept.length > 0) {
    console.log(`Kept in .fremi/ (${kept.length} file${kept.length === 1 ? "" : "s"} — your overrides, may carry edits):`);
    for (const f of kept) console.log(`    .fremi/${f}`);
    console.log(`    → remove them too with: fremi uninstall ${rawPath ?? ""} --purge`.replace(/\s+$/, ""));
    console.log("");
  }

  const docsWorks = resolve(targetPath, "docs", "works");
  if (existsSync(docsWorks)) {
    console.log("Preserved (your actual work — never removed by fremi):");
    console.log(`    docs/works/`);
    console.log("");
  }

  if (flags.withUser) {
    console.log("==> --with-user: continuing with the user-level uninstall");
    console.log("");
    await runAgentUninstall({
      agent: flags.agent,
      nonInteractive: flags.nonInteractive,
    });
    return;
  }

  console.log("✓ fremi uninstall complete (project level).");
  console.log("");
  console.log("The user-level install (skills, hooks, marketplace, mcp) is still in place.");
  console.log("To remove it for every project too:");
  console.log("  fremi agent uninstall          (or re-run this with --with-user)");
}
