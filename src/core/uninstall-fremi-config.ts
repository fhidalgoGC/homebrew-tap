import { resolve, join } from "node:path";
import { existsSync, unlinkSync, rmdirSync, readdirSync } from "node:fs";

export interface UninstallFremiConfigReport {
  action: "removed" | "not-found" | "kept-non-empty";
  errors: string[];
}

/**
 * Removes the project's fremi config file. Since v0.4.11 it lives at
 * <target>/.fremi/settings/config.user.yaml; legacy installs kept it at
 * <target>/.fremi/config.yaml. Both paths are removed if present.
 *
 * If the .fremi/ tree ends up empty after removing the config, it is
 * also cleaned up. Any other files the user placed inside are
 * preserved.
 */
export async function uninstallFremiConfig(
  targetPath: string,
): Promise<UninstallFremiConfigReport> {
  const fremiDir = resolve(targetPath, ".fremi");
  const settingsDir = join(fremiDir, "settings");
  const newPath = join(settingsDir, "config.user.yaml");
  const legacyPath = join(fremiDir, "config.yaml");

  const errors: string[] = [];
  let removedAny = false;

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
    return { action: "not-found", errors };
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
    return { action: "removed", errors };
  }
  return { action: "kept-non-empty", errors };
}
