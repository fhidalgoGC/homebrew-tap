import { resolve } from "node:path";
import { existsSync } from "node:fs";
import * as YAML from "yaml";
import { askSelect, note } from "./_helpers";
import {
  loadYamlDoc,
  saveYamlDoc,
  getAtPath,
  setAtPath,
  listKeys,
} from "../core/yaml-edit";
import { readActive, toggleActive } from "../core/settings-edit";
import { getFrameworkContentRoot } from "../core/paths";

// Specialised menu for editing models.user.yaml — one entry per fremi
// skill declaring which alias (opus/sonnet/haiku) that skill should run
// under. The core file (framework/settings/models.core.yaml) provides
// the defaults, so the editor shows `current · default` for each skill
// and lets the user reset back to the framework choice.
//
// This is invoked from src/commands/setting.ts when the user picks the
// "models" section.

const BACK = "__back__";
const USE_DEFAULT = "__use_default__";

type MenuResult = "back";

// Framework agent alias — for now everything is Claude. When we add
// Cursor / Windsurf, this becomes selectable per-project.
const AGENT = "claude";

interface CoreDoc {
  catalog: Record<string, string[]>;
  aliases: Record<string, Record<string, string>>;
  skillDefaults: Record<string, string>;
}

// Load the framework's own models.core.yaml — the single source of
// truth for catalog + aliases + per-skill defaults.
function loadCoreDoc(): CoreDoc | null {
  const corePath = resolve(
    getFrameworkContentRoot(),
    "settings",
    "models.core.yaml",
  );
  if (!existsSync(corePath)) return null;
  const doc = loadYamlDoc(corePath);
  if (!doc) return null;
  const catalog = readMapOfLists(doc, "catalog");
  const aliases = readMapOfMaps(doc, "aliases");
  const skillDefaults = readMap(doc, "skills");
  return { catalog, aliases, skillDefaults };
}

function readMap(doc: YAML.Document.Parsed, path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of listKeys(doc, path)) {
    const v = getAtPath(doc, `${path}.${k}`);
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}

function readMapOfLists(
  doc: YAML.Document.Parsed,
  path: string,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const k of listKeys(doc, path)) {
    const v = getAtPath(doc, `${path}.${k}`);
    if (YAML.isSeq(v)) {
      out[k] = v.items
        .map((item) => (YAML.isScalar(item) ? String(item.value) : String(item)))
        .filter((s) => s.length > 0);
    } else {
      out[k] = [];
    }
  }
  return out;
}

function readMapOfMaps(
  doc: YAML.Document.Parsed,
  path: string,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const k of listKeys(doc, path)) {
    out[k] = readMap(doc, `${path}.${k}`);
  }
  return out;
}

// Merged view of catalog + aliases + skillDefaults. The user file
// takes precedence per-key; anything missing falls back to core. This
// is what the editor operates on.
function mergedCoreView(core: CoreDoc, userDoc: YAML.Document.Parsed | null): CoreDoc {
  if (!userDoc) return core;
  const userCatalog = readMapOfLists(userDoc, "catalog");
  const userAliases = readMapOfMaps(userDoc, "aliases");
  return {
    catalog: { ...core.catalog, ...userCatalog },
    aliases: { ...core.aliases, ...userAliases },
    skillDefaults: core.skillDefaults,
  };
}

export async function runModelsMenu(filePath: string): Promise<MenuResult> {
  const core = loadCoreDoc();
  if (!core) {
    note("Cannot load framework models.core.yaml", "error");
    return "back";
  }

  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) {
      note(`Cannot parse ${filePath}`, "error");
      return "back";
    }

    // User file can override catalog + aliases per key. This gives the
    // user local control if new models ship and they don't want to wait
    // for a `fremi update`.
    const effective = mergedCoreView(core, doc);

    const activeState = readActive(filePath);
    const activeLabel =
      activeState === "true" ? "true" : activeState === "false" ? "false" : "(missing)";

    const aliasOptions = Object.keys(effective.aliases[AGENT] ?? {});
    const catalog = effective.catalog[AGENT] ?? [];

    const choice = await askSelect({
      message: `models  ·  active: ${activeLabel}  ·  agent: ${AGENT}`,
      options: [
        {
          value: "toggle-active",
          label: `✏  Toggle active (currently: ${activeLabel})`,
          hint: "master switch — off falls back to core defaults",
        },
        {
          value: "edit-skills",
          label: "🎯  Edit skill → model map",
          hint: `${Object.keys(core.skillDefaults).length} skills · aliases: ${aliasOptions.join(" · ")}`,
        },
        {
          value: "view-catalog",
          label: "📚  View model catalog",
          hint: `${catalog.length} models available for ${AGENT}`,
        },
        { value: BACK, label: "↩  Back to sections" },
      ],
    });

    if (choice === BACK) return "back";

    if (choice === "toggle-active") {
      if (activeState === "true" || activeState === "false") {
        toggleActive(filePath);
      }
      continue;
    }

    if (choice === "edit-skills") {
      await editSkillMap(filePath, effective);
      continue;
    }

    if (choice === "view-catalog") {
      showCatalog(effective);
      continue;
    }
  }
}

async function editSkillMap(filePath: string, core: CoreDoc): Promise<void> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) return;

    // Merge overrides (from user file) with defaults (from core). The
    // defaults dictate WHICH skills appear; the user file dictates
    // whether each is overridden.
    const overrides = readMap(doc, "skills");
    const allSkills = Object.keys(core.skillDefaults).sort((a, b) => {
      // Put `default` on top, then group by prefix (fremi-product, fremi-feature, ...)
      if (a === "default") return -1;
      if (b === "default") return 1;
      return a.localeCompare(b);
    });

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
      message: "models.skills — pick a skill to edit:",
      options,
    });
    if (picked === BACK) return;

    await editSkillValue(filePath, core, picked);
  }
}

async function editSkillValue(
  filePath: string,
  core: CoreDoc,
  skill: string,
): Promise<void> {
  const doc = loadYamlDoc(filePath);
  if (!doc) return;

  const overrides = readMap(doc, "skills");
  const current = overrides[skill];
  const defaultAlias = core.skillDefaults[skill];
  const aliases = Object.keys(core.aliases[AGENT] ?? {});
  const concreteModels = core.catalog[AGENT] ?? [];

  // Show aliases first (portable across agents), then concrete models
  // from the catalog (agent-specific pin). Users can pick whichever.
  const options: Array<{ value: string; label: string; hint?: string }> = [];

  // Aliases section
  for (const alias of aliases) {
    const concreteModel = core.aliases[AGENT]?.[alias] ?? "?";
    const marks: string[] = [];
    if (alias === current) marks.push("current");
    if (alias === defaultAlias) marks.push("default");
    const hint =
      `→ ${concreteModel}` + (marks.length > 0 ? `  ·  ${marks.join(" · ")}` : "");
    options.push({
      value: alias,
      label: `alias  ${padRight(alias, 8)}`,
      hint,
    });
  }

  // Concrete models section
  for (const model of concreteModels) {
    const marks: string[] = [];
    if (model === current) marks.push("current");
    const hint = marks.length > 0 ? marks.join(" · ") : "specific model (agent-locked)";
    options.push({
      value: model,
      label: `model  ${model}`,
      hint,
    });
  }

  // Actions
  options.push({
    value: USE_DEFAULT,
    label: `↺  Use framework default`,
    hint: current ? `remove override, fall back to ${defaultAlias}` : "already at default",
  });
  options.push({ value: BACK, label: "↩  Back" });

  const messageParts = [`models.skills.${skill}`];
  if (current) {
    messageParts.push(`current: ${current}`);
    messageParts.push(`default: ${defaultAlias}`);
  } else {
    messageParts.push(`default: ${defaultAlias} (not overridden yet)`);
  }

  const choice = await askSelect({
    message: messageParts.join("  ·  "),
    options,
  });

  if (choice === BACK) return;

  if (choice === USE_DEFAULT) {
    if (!current) return; // already at default, no-op
    // Remove the override by deleting the key from skills map.
    const parts = ["skills", skill];
    // yaml Document has deleteIn method.
    (doc as unknown as { deleteIn: (path: string[]) => boolean }).deleteIn(parts);
    saveYamlDoc(filePath, doc);
    return;
  }

  // choice is either an alias or a concrete model — both stored as-is.
  if (choice === current) return; // no change

  setAtPath(doc, `skills.${skill}`, choice);
  saveYamlDoc(filePath, doc);
}

function showCatalog(core: CoreDoc): void {
  const lines: string[] = [];
  for (const agent of Object.keys(core.catalog)) {
    lines.push(`${agent}:`);
    const models = core.catalog[agent];
    if (models.length === 0) {
      lines.push(`  (empty — support pending)`);
    } else {
      for (const m of models) lines.push(`  - ${m}`);
    }
  }
  lines.push("");
  lines.push("Aliases:");
  for (const agent of Object.keys(core.aliases)) {
    lines.push(`  ${agent}:`);
    for (const [alias, model] of Object.entries(core.aliases[agent])) {
      lines.push(`    ${alias} → ${model}`);
    }
  }
  note(lines.join("\n"), "catalog");
}

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
