import { resolve, join, basename } from "node:path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";

export interface InitConfigReport {
  action: "created" | "already-exists";
  errors: string[];
}

/**
 * Creates .fremi/config.yaml at the project root with per-project overrides.
 * Non-destructive — never overwrites an existing config.
 */
export async function initFremiConfig(
  targetPath: string,
  frameworkRoot: string,
): Promise<InitConfigReport> {
  const fremiDir = resolve(targetPath, ".fremi");
  const configPath = join(fremiDir, "config.yaml");

  if (existsSync(configPath)) {
    return { action: "already-exists", errors: [] };
  }

  mkdirSync(fremiDir, { recursive: true });

  const version = readVersion(frameworkRoot);
  const projectName = basename(targetPath);
  const today = new Date().toISOString().slice(0, 10);

  const yaml = `# .fremi/config.yaml
# Per-project overrides of the fremi-framework defaults.
# The framework master config lives at ~/.fremi/framework/framework/settings/config.yaml.
# Only put here what YOU want to override at the project level.

schema: fremi-project-config
schema_version: 1
generated_by: fremi-framework@${version}
generated_at: ${today}

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

  writeFileSync(configPath, yaml);
  return { action: "created", errors: [] };
}

function readVersion(frameworkRoot: string): string {
  try {
    return readFileSync(join(frameworkRoot, "VERSION"), "utf8").trim();
  } catch {
    return "0.1.0";
  }
}
