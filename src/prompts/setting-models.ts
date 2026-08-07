import { resolve, dirname, basename } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import * as YAML from "yaml";
import { askSelect, note } from "./_helpers";
import {
  loadYamlDoc,
  saveYamlDoc,
  getAtPath,
  setAtPath,
  listKeys,
} from "../core/yaml-edit";
import { getFrameworkContentRoot } from "../core/paths";

// Menu tree for editing model assignments.
//
// The CATALOG (list of concrete Claude models + alias mapping) is NOT
// in any YAML — it's fetched at `fremi install` time from GitHub and
// cached at .fremi/settings/catalog/<agent>.json. That way when
// Anthropic ships a new model, users pick it up on the next install
// without a fremi binary bump.
//
// The YAML files only carry:
//   models.core.yaml  → framework's alias-per-skill defaults
//   models.user.yaml  → per-project skill overrides
//   agents.user.yaml  → default_model (project-wide fallback)

const BACK = "__back__";
const USE_DEFAULT = "__use_default__";
const PICK_CONCRETE = "__pick_concrete__";

type MenuResult = "back";

// Only Claude wired end-to-end today. When we add Cursor, we'll read
// this per-project from a config knob instead of hardcoding.
const AGENT = "claude";

interface CatalogFile {
  updated: string;
  models: string[];
  aliases: Record<string, string>;
}

interface CoreDoc {
  skillDefaults: Record<string, string>;
}

// -------- Catalog loading (JSON — fetched at install time) --------

function catalogPathFor(userYamlPath: string): string {
  // User yaml lives at <project>/.fremi/settings/<something>.user.yaml
  // (or under a subfolder). Walk up to .fremi/settings/ and drop
  // catalog/<agent>.json there.
  const settingsDir = walkUpToSettingsDir(userYamlPath);
  return resolve(settingsDir, "catalog", `${AGENT}.json`);
}

function walkUpToSettingsDir(anyPathInSettings: string): string {
  let dir = dirname(anyPathInSettings);
  // We expect anyPathInSettings to be inside `.fremi/settings/`. Walk
  // up until we hit that folder.
  while (dir !== "/" && basename(dir) !== "settings") {
    dir = dirname(dir);
  }
  return dir;
}

function loadCatalog(userYamlPath: string): CatalogFile | null {
  const p = catalogPathFor(userYamlPath);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as CatalogFile;
  } catch {
    return null;
  }
}

// -------- Core (framework skill defaults) loading --------

function loadCoreDoc(): CoreDoc | null {
  const corePath = resolve(
    getFrameworkContentRoot(),
    "settings",
    "models.core.yaml",
  );
  if (!existsSync(corePath)) return null;
  const doc = loadYamlDoc(corePath);
  if (!doc) return null;
  return { skillDefaults: readMap(doc, "skills") };
}

function readMap(doc: YAML.Document.Parsed, path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of listKeys(doc, path)) {
    const v = getAtPath(doc, `${path}.${k}`);
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}

// -------- Shared UI: pick an alias, expandable to concrete model --------

// Builds the two-step "pick a model" flow. Shows aliases with a
// "✏  Choose specific model..." expansion instead of listing concrete
// models redundantly. Returns the selected value (alias or concrete
// model ID), or null if the user backed out.
async function pickModelValue(
  catalog: CatalogFile,
  currentValue: string,
  defaultAlias: string | undefined,
  message: string,
): Promise<string | null> {
  const aliases = Object.keys(catalog.aliases);

  const options: Array<{ value: string; label: string; hint?: string }> = [];
  for (const alias of aliases) {
    const concreteModel = catalog.aliases[alias];
    const marks: string[] = [];
    if (alias === currentValue) marks.push("current");
    if (alias === defaultAlias) marks.push("default");
    const hint =
      `→ ${concreteModel}` + (marks.length > 0 ? `  ·  ${marks.join(" · ")}` : "");
    options.push({ value: alias, label: alias, hint });
  }

  if (catalog.models.length > 0) {
    // Highlight if the current value is a pinned concrete model — the
    // user will want to know that from the top level.
    const pinnedHint = catalog.models.includes(currentValue)
      ? `current pin: ${currentValue}`
      : `pin to a specific model ID`;
    options.push({
      value: PICK_CONCRETE,
      label: "✏  Choose specific model...",
      hint: pinnedHint,
    });
  }

  options.push({ value: BACK, label: "↩  Back" });

  const choice = await askSelect({ message, options });
  if (choice === BACK) return null;

  if (choice === PICK_CONCRETE) {
    return pickConcreteModel(catalog, currentValue);
  }
  return choice;
}

async function pickConcreteModel(
  catalog: CatalogFile,
  currentValue: string,
): Promise<string | null> {
  const options = catalog.models.map((m) => ({
    value: m,
    label: m,
    hint: m === currentValue ? "current" : undefined,
  }));
  options.push({ value: BACK, label: "↩  Back" });

  const choice = await askSelect({
    message: `pick a specific model (${catalog.models.length} available for ${AGENT})`,
    options,
  });
  if (choice === BACK) return null;
  return choice;
}

// -------- Entry points --------

// Invoked from `fremi setting → agents → 🎯 Edit default model`. Edits
// agents.user.yaml → default_model — the project-wide fallback used by
// ANY fremi skill that doesn't have an explicit override.
export async function runDefaultModelMenu(
  agentsFilePath: string,
): Promise<MenuResult> {
  const catalog = loadCatalog(agentsFilePath);
  if (!catalog || catalog.models.length === 0) {
    note(
      "No model catalog available. Run `fremi install` (needs network) " +
        "to fetch the live catalog from GitHub.",
      "no-catalog",
    );
    return "back";
  }

  const doc = loadYamlDoc(agentsFilePath);
  if (!doc) {
    note(`Cannot parse ${agentsFilePath}`, "error");
    return "back";
  }

  const current = getAtPath(doc, "default_model");
  const currentStr =
    current === undefined || current === null ? "" : String(current);

  const message = `agents.default_model  ·  ${currentStr ? `current: ${currentStr}` : "no value set"}`;
  const next = await pickModelValue(catalog, currentStr, undefined, message);
  if (next === null) return "back";
  if (next === currentStr) return "back";

  setAtPath(doc, "default_model", next);
  saveYamlDoc(agentsFilePath, doc);
  return "back";
}

// Invoked from `fremi setting → <layer> → 🤖 Edit models for this layer`.
// Only shows skills whose name starts with `fremi-<layer>`.
export async function runLayerModelsMenu(
  modelsFilePath: string,
  layerName: string,
): Promise<MenuResult> {
  const core = loadCoreDoc();
  if (!core) {
    note("Cannot load framework models.core.yaml", "error");
    return "back";
  }
  const catalog = loadCatalog(modelsFilePath);
  if (!catalog || catalog.models.length === 0) {
    note(
      "No model catalog available. Run `fremi install` (needs network) " +
        "to fetch the live catalog from GitHub.",
      "no-catalog",
    );
    return "back";
  }

  const layerPrefix = `fremi-${layerName}`;
  const belongsToLayer = (s: string): boolean =>
    s === layerPrefix || s.startsWith(`${layerPrefix}-`);

  await editSkillMap(modelsFilePath, core, catalog, belongsToLayer);
  return "back";
}

// Kept for the (now-hidden) flat top-level `models` section — some
// projects may still surface it. Not linked from the default menu.
export async function runModelsMenu(filePath: string): Promise<MenuResult> {
  const core = loadCoreDoc();
  if (!core) {
    note("Cannot load framework models.core.yaml", "error");
    return "back";
  }
  const catalog = loadCatalog(filePath);
  if (!catalog || catalog.models.length === 0) {
    note(
      "No model catalog available. Run `fremi install` (needs network) " +
        "to fetch the live catalog from GitHub.",
      "no-catalog",
    );
    return "back";
  }
  await editSkillMap(filePath, core, catalog);
  return "back";
}

// -------- Skill list editor (shared between top-level + layer views) --------

async function editSkillMap(
  filePath: string,
  core: CoreDoc,
  catalog: CatalogFile,
  filter?: (skillName: string) => boolean,
): Promise<void> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) return;

    const overrides = readMap(doc, "skills");
    const allSkills = Object.keys(core.skillDefaults)
      .filter((s) => s !== "default")
      .filter((s) => (filter ? filter(s) : true))
      .sort((a, b) => a.localeCompare(b));

    const options = allSkills.map((s) => {
      const override = overrides[s];
      const defaultAlias = core.skillDefaults[s];
      const preview = valuePreviewWithDefault(override, defaultAlias);
      return {
        value: s,
        label: `${padRight(s, 32)}  ${preview}`,
      };
    });
    options.push({ value: BACK, label: "↩  Back" });

    const picked = await askSelect({
      message: "pick a skill to edit:",
      options,
    });
    if (picked === BACK) return;

    await editSkillValue(filePath, core, catalog, picked);
  }
}

async function editSkillValue(
  filePath: string,
  core: CoreDoc,
  catalog: CatalogFile,
  skill: string,
): Promise<void> {
  const doc = loadYamlDoc(filePath);
  if (!doc) return;

  const overrides = readMap(doc, "skills");
  const current = overrides[skill];
  const defaultAlias = core.skillDefaults[skill];

  // Extend the shared picker with a "use framework default" action.
  const messageParts = [`models.skills.${skill}`];
  if (current) {
    messageParts.push(`current: ${current}`);
    messageParts.push(`default: ${defaultAlias}`);
  } else {
    messageParts.push(`default: ${defaultAlias} (not overridden yet)`);
  }
  const message = messageParts.join("  ·  ");

  // Custom picker with the "use default" extra option baked in.
  const aliases = Object.keys(catalog.aliases);
  const options: Array<{ value: string; label: string; hint?: string }> = [];
  for (const alias of aliases) {
    const concreteModel = catalog.aliases[alias];
    const marks: string[] = [];
    if (alias === current) marks.push("current");
    if (alias === defaultAlias) marks.push("default");
    const hint =
      `→ ${concreteModel}` + (marks.length > 0 ? `  ·  ${marks.join(" · ")}` : "");
    options.push({ value: alias, label: alias, hint });
  }
  if (catalog.models.length > 0) {
    const pinnedHint = current && catalog.models.includes(current)
      ? `current pin: ${current}`
      : `pin to a specific model ID`;
    options.push({
      value: PICK_CONCRETE,
      label: "✏  Choose specific model...",
      hint: pinnedHint,
    });
  }
  options.push({
    value: USE_DEFAULT,
    label: "↺  Use framework default",
    hint: current ? `remove override, fall back to ${defaultAlias}` : "already at default",
  });
  options.push({ value: BACK, label: "↩  Back" });

  const choice = await askSelect({ message, options });

  if (choice === BACK) return;

  if (choice === USE_DEFAULT) {
    if (!current) return;
    const parts = ["skills", skill];
    (doc as unknown as { deleteIn: (path: string[]) => boolean }).deleteIn(parts);
    saveYamlDoc(filePath, doc);
    return;
  }

  let value = choice;
  if (choice === PICK_CONCRETE) {
    const picked = await pickConcreteModel(catalog, current ?? "");
    if (picked === null) return;
    value = picked;
  }

  if (value === current) return;

  setAtPath(doc, `skills.${skill}`, value);
  saveYamlDoc(filePath, doc);
}

// -------- Helpers --------

function padRight(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}

function valuePreviewWithDefault(
  current: string | undefined,
  defaultValue: string | undefined,
): string {
  const hasCurrent = current !== undefined && current !== "";
  const hasDefault = defaultValue !== undefined && defaultValue !== "";

  if (!hasCurrent && !hasDefault) return "(empty)";
  if (!hasCurrent && hasDefault) return `(default: ${defaultValue})`;
  if (hasCurrent && !hasDefault) return current!;

  if (current === defaultValue) return `${current}  · default`;
  return `${current}  · default: ${defaultValue}`;
}
