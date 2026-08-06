import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// MCP tool implementations. Each function receives the project cwd and
// returns structured JSON. Kept side-effect-free (read-only walks of
// docs/works/ and .fremi/config.yaml) so they're safe to call
// repeatedly without contention.

export interface ProjectStatus {
  cwd: string;
  hasConfig: boolean;
  enabled: boolean;
  configPath: string | null;
  reason: string;
}

export function toolProjectStatus(cwd: string): ProjectStatus {
  const configPath = join(cwd, ".fremi", "config.yaml");
  if (!existsSync(configPath)) {
    return {
      cwd,
      hasConfig: false,
      enabled: false,
      configPath: null,
      reason: "no .fremi/config.yaml at project root",
    };
  }
  const content = safeRead(configPath);
  const enabled = /(?:^|\n)enabled:\s*true\b/.test(content);
  return {
    cwd,
    hasConfig: true,
    enabled,
    configPath,
    reason: enabled ? "fremi is active" : "config exists but enabled: true is not set",
  };
}

export interface FeatureSummary {
  slug: string;              // "FT-01_login"
  path: string;              // "docs/works/features/FT-01_login"
  hasDefinition: boolean;    // definition.md present?
  hasDecisions: boolean;
  storiesCount: number;
  enablersCount: number;
}

export function toolListFeatures(cwd: string): FeatureSummary[] {
  const root = join(cwd, "docs", "works", "features");
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => summariseFeature(root, e.name))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function summariseFeature(root: string, name: string): FeatureSummary {
  const dir = join(root, name);
  const storiesDir = join(dir, "user-stories");
  const enablersDir = join(dir, "enablers");
  return {
    slug: name,
    path: `docs/works/features/${name}`,
    hasDefinition: existsSync(join(dir, "definition.md")),
    hasDecisions: existsSync(join(dir, "decisions.md")),
    storiesCount: countDirs(storiesDir),
    enablersCount: countDirs(enablersDir),
  };
}

export interface StorySummary {
  slug: string;              // "HU-01_slug"
  feature: string;           // "FT-01_login"
  path: string;              // "docs/works/features/FT-01/user-stories/HU-01"
  phase: string;             // "FW-00" through "FW-10" or "empty"
  artifacts: string[];       // ["FW-00_explore.md", "FW-01_definition.md", ...]
}

export function toolListStories(cwd: string, featureSlug?: string): StorySummary[] {
  const featuresRoot = join(cwd, "docs", "works", "features");
  if (!existsSync(featuresRoot)) return [];

  const targetFeatures = featureSlug
    ? [featureSlug]
    : readdirSync(featuresRoot, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

  const stories: StorySummary[] = [];
  for (const feat of targetFeatures) {
    const storiesRoot = join(featuresRoot, feat, "user-stories");
    if (!existsSync(storiesRoot)) continue;
    for (const entry of readdirSync(storiesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const storyDir = join(storiesRoot, entry.name);
      stories.push(summariseStory(feat, entry.name, storyDir, cwd));
    }
  }

  return stories.sort((a, b) =>
    a.feature.localeCompare(b.feature) || a.slug.localeCompare(b.slug),
  );
}

function summariseStory(feature: string, slug: string, storyDir: string, cwd: string): StorySummary {
  const files = existsSync(storyDir)
    ? readdirSync(storyDir).filter((f) => /^FW-\d+/.test(f))
    : [];
  files.sort();
  const latest = files[files.length - 1] ?? "";
  const phase = latest ? latest.match(/^FW-\d+/)?.[0] ?? "empty" : "empty";
  return {
    slug,
    feature,
    path: storyDir.startsWith(cwd) ? "." + storyDir.slice(cwd.length) : storyDir,
    phase,
    artifacts: files,
  };
}

export interface EnablerSummary {
  slug: string;              // "EN-01_slug"
  scope: "global" | "feature";
  parentFeature: string | null;
  path: string;
  hasDefinition: boolean;
  hasDesign: boolean;
  hasPlan: boolean;
  hasClosure: boolean;
}

export function toolListEnablers(cwd: string): EnablerSummary[] {
  const enablers: EnablerSummary[] = [];

  const globalRoot = join(cwd, "docs", "works", "enablers");
  if (existsSync(globalRoot)) {
    for (const entry of readdirSync(globalRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      enablers.push(summariseEnabler(entry.name, "global", null, join(globalRoot, entry.name), cwd));
    }
  }

  const featuresRoot = join(cwd, "docs", "works", "features");
  if (existsSync(featuresRoot)) {
    for (const feat of readdirSync(featuresRoot, { withFileTypes: true })) {
      if (!feat.isDirectory()) continue;
      const featEnablersRoot = join(featuresRoot, feat.name, "enablers");
      if (!existsSync(featEnablersRoot)) continue;
      for (const entry of readdirSync(featEnablersRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        enablers.push(
          summariseEnabler(entry.name, "feature", feat.name, join(featEnablersRoot, entry.name), cwd),
        );
      }
    }
  }

  return enablers.sort((a, b) => a.slug.localeCompare(b.slug));
}

function summariseEnabler(
  slug: string,
  scope: "global" | "feature",
  parentFeature: string | null,
  dir: string,
  cwd: string,
): EnablerSummary {
  return {
    slug,
    scope,
    parentFeature,
    path: dir.startsWith(cwd) ? "." + dir.slice(cwd.length) : dir,
    hasDefinition: existsSync(join(dir, "EN-01_definition.md")),
    hasDesign: existsSync(join(dir, "EN-02_design.md")),
    hasPlan: existsSync(join(dir, "EN-03_plan.md")),
    hasClosure: existsSync(join(dir, "EN-04_closure.md")),
  };
}

function countDirs(dir: string): number {
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
  } catch {
    return 0;
  }
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}
