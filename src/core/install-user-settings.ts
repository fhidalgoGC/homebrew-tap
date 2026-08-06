import { resolve, join, relative, dirname } from "node:path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  statSync,
} from "node:fs";

export interface InstallUserSettingsReport {
  copied: number;
  skipped: number;
  errors: string[];
}

/**
 * Copies every `*.user.yaml` file from the framework content tree into the
 * project's `.fremi/settings/` directory, mirroring the "meaningful" path:
 *
 *   framework/settings/X.user.yaml        → .fremi/settings/X.user.yaml
 *   framework/skills/<layer>/X.user.yaml  → .fremi/settings/<layer>/X.user.yaml
 *
 * The framework/settings/ prefix and framework/skills/ prefix are both
 * stripped so top-level settings live "afuera" and per-layer configs live
 * inside a folder named after the layer.
 *
 * Idempotent: existing destination files are NEVER overwritten. Users own
 * their per-project settings once installed; framework changes to defaults
 * do not clobber their edits. To adopt new defaults for a specific file,
 * delete the local copy and re-run `fremi install`.
 */
export async function installUserSettings(
  targetPath: string,
  frameworkContent: string,
): Promise<InstallUserSettingsReport> {
  const report: InstallUserSettingsReport = { copied: 0, skipped: 0, errors: [] };

  const settingsRoot = resolve(targetPath, ".fremi", "settings");

  const sources: Array<{ absPath: string; relPath: string }> = [];
  walkForUserYaml(frameworkContent, frameworkContent, sources);

  for (const { absPath, relPath } of sources) {
    const dstRel = mapToDestination(relPath);
    if (!dstRel) {
      report.errors.push(`Could not map source to destination: ${relPath}`);
      continue;
    }
    const dstAbs = join(settingsRoot, dstRel);

    if (existsSync(dstAbs)) {
      report.skipped++;
      continue;
    }

    try {
      mkdirSync(dirname(dstAbs), { recursive: true });
      copyFileSync(absPath, dstAbs);
      report.copied++;
    } catch (err) {
      report.errors.push(`Failed to copy ${relPath}: ${(err as Error).message}`);
    }
  }

  return report;
}

function walkForUserYaml(
  root: string,
  dir: string,
  out: Array<{ absPath: string; relPath: string }>,
): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkForUserYaml(root, abs, out);
    } else if (entry.isFile() && entry.name.endsWith(".user.yaml")) {
      out.push({ absPath: abs, relPath: relative(root, abs) });
    }
  }
}

/**
 * Map a framework-relative source path to its destination path inside
 * `.fremi/settings/`. Returns null if the source is not under a recognized
 * prefix (settings/ or skills/).
 */
function mapToDestination(relPath: string): string | null {
  if (relPath.startsWith("settings/")) {
    return relPath.slice("settings/".length);
  }
  if (relPath.startsWith("skills/")) {
    return relPath.slice("skills/".length);
  }
  return null;
}
