import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type SymlinkAction = "installed" | "skipped" | "recreated";

/**
 * Idempotent symlink. An existing link pointing elsewhere is repointed
 * ("recreated"); an existing real file is left alone ("skipped") so a
 * user's own file is never clobbered.
 */
export function ensureSymlink(linkPath: string, target: string): SymlinkAction {
  if (existsSync(linkPath) || isBrokenSymlink(linkPath)) {
    const stat = lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = readlinkSync(linkPath);
      if (resolve(dirname(linkPath), current) === resolve(target)) return "skipped";
      unlinkSync(linkPath);
      symlinkSync(target, linkPath);
      return "recreated";
    }
    return "skipped";
  }
  mkdirSync(dirname(linkPath), { recursive: true });
  symlinkSync(target, linkPath);
  return "installed";
}

function isBrokenSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}
