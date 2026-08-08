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
 *   framework/settings/X.user.yaml               → .fremi/settings/X.user.yaml
 *   framework/artifacts/<layer>/X.user.yaml      → .fremi/settings/<layer>/X.user.yaml
 *   framework/artifacts/<layer>/skills/<cat>/... → .fremi/settings/config.<cat>.<layer>.user.yaml
 *
 * See mapToDestination() for the exact rules. Top-level settings live
 * "afuera" and per-layer configs live inside a folder named after the
 * layer; deep-nested sub-skill configs get flattened to composite names
 * so the project's settings folder stays discoverable.
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
 *
 * Nested sub-skill configs like `artifacts/story/skills/bug/config.user.yaml`
 * are FLATTENED to a composite name at the top-level of `.fremi/settings/`
 * (config.bug.story.user.yaml) so they stay grouped with the rest of the
 * user files and remain discoverable by `fremi setting`. The framework
 * organizes them by category near their SKILL.md; the project keeps a
 * flat settings folder.
 */
function mapToDestination(relPath: string): string | null {
  if (relPath.startsWith("settings/")) {
    return relPath.slice("settings/".length);
  }
  // artifacts/ prefix — SAFe-style layers (product, feature, story,
  // enabler, extra). Uses the same mapping rules the legacy skills/
  // prefix used to have; skills/ under here now only holds utility
  // skills (tools, sync-check) which don't produce copyable user files.
  if (relPath.startsWith("artifacts/")) {
    // Deep-nested sub-skill configs: artifacts/<layer>/skills/<category>/config.user.yaml
    const nested = relPath.match(
      /^artifacts\/([^/]+)\/skills\/([^/]+)\/config\.user\.yaml$/,
    );
    if (nested) {
      const [, layer, category] = nested;
      return `config.${category}.${layer}.user.yaml`;
    }
    // Standalone-category layers (extra) — no orchestrator sub-skills.
    // Flatten to top-level composite name to keep the project's
    // .fremi/settings/ folder flat + discoverable.
    //   artifacts/extra/config.user.yaml → config.extra.user.yaml
    const standalone = relPath.match(
      /^artifacts\/(extra)\/config\.user\.yaml$/,
    );
    if (standalone) {
      const [, category] = standalone;
      return `config.${category}.user.yaml`;
    }
    return relPath.slice("artifacts/".length);
  }
  // Legacy skills/ prefix — no artifact configs live here anymore
  // (tools/ and sync-check/ don't have user.yaml files), but keep the
  // fall-through in case a user file lands here in future.
  if (relPath.startsWith("skills/")) {
    return relPath.slice("skills/".length);
  }
  return null;
}
