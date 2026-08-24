import { resolve, join } from "node:path";
import { existsSync, unlinkSync, rmdirSync, readdirSync, rmSync } from "node:fs";

export interface UninstallFremiConfigReport {
  action: "removed" | "not-found" | "kept-non-empty" | "purged";
  /** Files still inside .fremi/ after a non-purge uninstall. */
  kept: string[];
  errors: string[];
}

/**
 * Removes the project's fremi config file. Since v0.4.11 it lives at
 * <target>/.fremi/settings/config.user.yaml; legacy installs kept it at
 * <target>/.fremi/config.yaml. Both paths are removed if present.
 *
 * If the .fremi/ tree ends up empty after removing the config, it is
 * also cleaned up. Any other files the user placed inside are
 * preserved — they are the project's own overrides and may carry edits.
 *
 * With `purge: true` the whole .fremi/ tree goes instead: settings,
 * catalog and anything else inside. docs/works/ is NEVER touched either
 * way — that is the user's actual work (PRDs, stories, decisions), not
 * something the framework owns.
 */
export async function uninstallFremiConfig(
  targetPath: string,
  opts: { purge?: boolean } = {},
): Promise<UninstallFremiConfigReport> {
  const fremiDir = resolve(targetPath, ".fremi");
  const settingsDir = join(fremiDir, "settings");
  const newPath = join(settingsDir, "config.user.yaml");
  const legacyPath = join(fremiDir, "config.yaml");

  const errors: string[] = [];
  let removedAny = false;

  if (opts.purge) {
    if (!existsSync(fremiDir)) {
      return { action: "not-found", kept: [], errors };
    }
    try {
      rmSync(fremiDir, { recursive: true, force: true });
      return { action: "purged", kept: [], errors };
    } catch (err) {
      errors.push(`Failed to purge ${fremiDir}: ${(err as Error).message}`);
      return { action: "kept-non-empty", kept: listFiles(fremiDir), errors };
    }
  }

  for (const p of [newPath, legacyPath]) {
    if (!existsSync(p)) continue;
    try {
      unlinkSync(p);
      removedAny = true;
    } catch (err) {
      errors.push(`Failed to remove ${p}: ${(err as Error).message}`);
    }
  }

  if (!removedAny) {
    return { action: "not-found", kept: [], errors };
  }

  // Try to clean up empty directories bottom-up.
  for (const dir of [settingsDir, fremiDir]) {
    try {
      if (existsSync(dir) && readdirSync(dir).length === 0) {
        rmdirSync(dir);
      }
    } catch {
      // ignore
    }
  }

  if (!existsSync(fremiDir)) {
    return { action: "removed", kept: [], errors };
  }
  return { action: "kept-non-empty", kept: listFiles(fremiDir), errors };
}

/** Every file remaining under a dir, as paths relative to it. */
function listFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else out.push(abs.slice(root.length + 1));
    }
  }
  return out.sort();
}
