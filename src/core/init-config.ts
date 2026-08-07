import { resolve, join, basename } from "node:path";
import { existsSync, mkdirSync, writeFileSync, readFileSync, renameSync } from "node:fs";

export interface InitConfigReport {
  action: "created" | "already-exists" | "migrated-legacy";
  errors: string[];
}

/**
 * Creates .fremi/settings/config.user.yaml with per-project overrides.
 *
 * Layout convention (v0.4.11+): all user-editable YAMLs live under
 * .fremi/settings/*.user.yaml. Older installs put this file at
 * .fremi/config.yaml — if that legacy file exists it is moved to the
 * new location so the migration is transparent.
 *
 * Non-destructive — never overwrites an existing user file.
 */
export async function initFremiConfig(
  targetPath: string,
  frameworkRoot: string,
): Promise<InitConfigReport> {
  const fremiDir = resolve(targetPath, ".fremi");
  const settingsDir = join(fremiDir, "settings");
  const newPath = join(settingsDir, "config.user.yaml");
  const legacyPath = join(fremiDir, "config.yaml");

  // Migration path: legacy file exists and the new one doesn't.
  if (existsSync(legacyPath) && !existsSync(newPath)) {
    mkdirSync(settingsDir, { recursive: true });
    renameSync(legacyPath, newPath);
    return { action: "migrated-legacy", errors: [] };
  }

  if (existsSync(newPath)) {
    return { action: "already-exists", errors: [] };
  }

  mkdirSync(settingsDir, { recursive: true });

  const version = readVersion(frameworkRoot);
  const projectName = basename(targetPath);
  const today = new Date().toISOString().slice(0, 10);

  const yaml = `# .fremi/settings/config.user.yaml
# Per-project overrides of the fremi-framework defaults.
# The framework master config lives at
#   ~/.fremi/framework/settings/config.core.yaml
# Only put here what YOU want to override at the project level.

schema: fremi-project-user
schema_version: 3
generated_by: fremi-framework@${version}
generated_at: ${today}

# ------------------------------------------------------------------------
# Master switch — fremi skills only run when BOTH:
#   - this file exists at .fremi/settings/config.user.yaml, AND
#   - enabled: true
# Set enabled: false to keep the config but temporarily disable the
# framework in this project (skills will be ignored by the SessionStart
# hook and by Claude).
# ------------------------------------------------------------------------
enabled: true

project:
  name: ${projectName}
  description: >
    (Edit this — describe the project in 1-2 sentences.)

# ------------------------------------------------------------------------
# Stack — set actual values. Framework skills that need to know the stack
# (e.g. testing runner, IaC tool) will look here first.
# ------------------------------------------------------------------------
stack:
  language: null           # e.g. typescript, python, go
  runtime: null            # e.g. nodejs24.x, python3.12
  package_manager: null    # e.g. npm, pnpm, bun, poetry
  bundler: null            # e.g. esbuild, vite, webpack (or null)
  iac: null                # e.g. serverless-framework, cdk, terraform (or null)
  cloud: null              # e.g. aws, gcp, azure (or null)

# ------------------------------------------------------------------------
# Testing — declares what the project actually supports. Used by
# /fremi-story-tdd, /fremi-story-verify, hooks like check-strict-tdd.sh
# ------------------------------------------------------------------------
testing:
  strict_tdd: false         # true = Regla 7 enforced (red-first)
  test_runner: null         # e.g. "npm test"
  type_checker: null        # e.g. "npm run typecheck"
  unit:
    enabled: false
    framework: null         # e.g. vitest, jest, pytest
    command: null
  integration:
    enabled: false
    framework: null
    command: null
  e2e:
    enabled: false
    framework: null
    command: null

# ------------------------------------------------------------------------
# Preferences — user-facing knobs.
# ------------------------------------------------------------------------
preferences:
  language_conversation: es    # es, en
  language_artifacts: en       # docs are written in this language
`;

  writeFileSync(newPath, yaml);
  return { action: "created", errors: [] };
}

function readVersion(frameworkRoot: string): string {
  try {
    return readFileSync(join(frameworkRoot, "VERSION"), "utf8").trim();
  } catch {
    return "0.1.0";
  }
}
