import { resolve } from "node:path";
import { existsSync } from "node:fs";
import * as YAML from "yaml";
import { askSelect, askText, note } from "./_helpers";
import {
  loadYamlDoc,
  saveYamlDoc,
  getAtPath,
  setAtPath,
  listKeys,
} from "../core/yaml-edit";
import { readActive, toggleActive } from "../core/settings-edit";
import { getFrameworkContentRoot } from "../core/paths";

// Specialised menus for editing methodology.user.yaml. The generic
// setting menu delegates here when the section is "methodology".
// Structure of the file:
//   active: bool
//   paths.*         string values (docs/works/features, ...)
//   slug.*          case, regex, max_length, transforms
//   identifiers.*   feature/user_story/enabler/... each with prefix +
//                   id_format + scope + regex + examples
//
// The framework ships its own methodology.user.yaml (the "default")
// under <framework>/settings/. We load it alongside the project file
// so we can show `current · default: X` in every prompt and pre-fill
// with the default when the project has no override yet.

const BACK = "__back__";
const CHANGE = "__change__";
const USE_DEFAULT = "__use_default__";

// Framework-internal paths — pointers to where fremi itself lives on
// disk. These are NOT project-configurable and should never appear in
// the interactive editor, since editing them just breaks the tooling.
const HIDDEN_PATHS = new Set(["frmwk_dir", "flows_doc", "rules_doc"]);

// Ordered display of paths — top-level dirs first, then subdirs, then
// misc / extras at the end. Keys not listed here are appended in file
// order. This is the single source of truth for how the paths menu is
// laid out (and how effective-path previews are rendered).
const PATHS_ORDER: string[] = [
  // Top-level folders
  "product_dir",
  "features_dir",
  "enablers_dir_global",
  // Subdirs (relative to a parent path)
  "user_stories_subdir",
  "enablers_subdir",
  "bugs_subdir",
  // Extras / misc
  "extras_dir",
  "project_dir",
];

// For each subdir, the template of its effective path. `{feature}` and
// `{story}` are placeholders that stand for the concrete folder name
// at runtime. Rendered next to the value so the user sees, at a glance,
// that `user-stories` actually resolves to `<features>/{feature}/user-stories`.
function effectivePathTemplate(key: string, value: string): string | null {
  if (!value) return null;
  switch (key) {
    case "user_stories_subdir":
      return `{features_dir}/{feature}/${value}`;
    case "enablers_subdir":
      return `{features_dir}/{feature}[/{story}]/${value}`;
    case "bugs_subdir":
      return `{features_dir}/{feature}/user-stories/{story}/${value}`;
    default:
      return null;
  }
}

// Human-readable hint for each path key. Keeps the intent visible next
// to the value even after we already render the effective template.
const PATH_HINTS: Record<string, string> = {
  product_dir: "product-layer folder",
  features_dir: "features-layer folder",
  enablers_dir_global: "global enablers folder",
  user_stories_subdir: "subdir inside each feature folder",
  enablers_subdir: "subdir inside feature/story folders",
  bugs_subdir: "subdir inside each story folder",
  extras_dir: "extra / tooling docs",
  project_dir: "project-owned docs",
};

// Field-kind registry — declares how each scalar field should be
// edited. Selects present a menu of known options; numbers validate
// input as integer; text is freeform. This is the single source of
// truth for "what kind of value does this field accept".
type FieldKind =
  | { type: "text" }
  | { type: "number" }
  | { type: "select"; options: string[] };

const SLUG_CASE_OPTIONS = [
  "kebab-case",
  "snake_case",
  "camelCase",
  "PascalCase",
];

const IDENTIFIER_SCOPE_OPTIONS = [
  "global",
  "feature",
  "story",
  "enabler",
  "story_or_feature",
];

function resolveFieldKind(dottedPath: string): FieldKind {
  if (dottedPath === "slug.case") {
    return { type: "select", options: SLUG_CASE_OPTIONS };
  }
  if (dottedPath === "slug.max_length") {
    return { type: "number" };
  }
  if (dottedPath.startsWith("identifiers.") && dottedPath.endsWith(".scope")) {
    return { type: "select", options: IDENTIFIER_SCOPE_OPTIONS };
  }
  return { type: "text" };
}

// id_format is a template like "{prefix}-{number:02d}". Exposing that
// raw to users is unfriendly, so we parse it into (digits, separator)
// and rebuild the template after asking those two questions in plain
// language. Only recognizes the common shape `{prefix}<sep>{number[:0Nd]}`.
interface ParsedIdFormat {
  separator: string;
  digits: number; // 0 = no padding
}

function parseIdFormat(template: string): ParsedIdFormat | null {
  const match = template.match(/^\{prefix\}([^{}]*)\{number(?::0(\d+)d)?\}$/);
  if (!match) return null;
  const separator = match[1] ?? "";
  const digits = match[2] ? parseInt(match[2], 10) : 0;
  return { separator, digits };
}

function buildIdFormat(parsed: ParsedIdFormat): string {
  const numberPart = parsed.digits > 0 ? `{number:0${parsed.digits}d}` : "{number}";
  return `{prefix}${parsed.separator}${numberPart}`;
}

type MenuResult = "back";

// Locate the framework's own methodology.user.yaml — that's the source
// of defaults for every project. Returns null if the framework clone is
// missing that file (rare) or if it happens to resolve to the same path
// as the project file (dev mode from the framework repo itself).
function loadDefaultsDoc(projectFilePath: string): YAML.Document.Parsed | null {
  const defaultsPath = resolve(
    getFrameworkContentRoot(),
    "settings",
    "methodology.user.yaml",
  );
  if (!existsSync(defaultsPath)) return null;
  if (resolve(projectFilePath) === defaultsPath) return null;
  return loadYamlDoc(defaultsPath);
}

export async function runMethodologyMenu(filePath: string): Promise<MenuResult> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) {
      note(`Cannot parse ${filePath}`, "error");
      return "back";
    }

    const activeState = readActive(filePath);
    const activeLabel =
      activeState === "true" ? "true" : activeState === "false" ? "false" : "(missing)";

    const choice = await askSelect({
      message: `methodology  ·  active: ${activeLabel}`,
      options: [
        {
          value: "toggle-active",
          label: `✏  Toggle active (currently: ${activeLabel})`,
          hint: "master switch for the whole file",
        },
        { value: "paths", label: "📁  Edit paths",             hint: "docs/works/... and framework refs" },
        { value: "slug",  label: "🔤  Edit slug rules",         hint: "case, regex, max_length" },
        { value: "identifiers", label: "🔢  Edit identifiers",  hint: "prefix + id_format per artifact type" },
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

    if (choice === "paths") {
      await editMapValues(filePath, "paths");
      continue;
    }

    if (choice === "slug") {
      await editMapValues(filePath, "slug");
      continue;
    }

    if (choice === "identifiers") {
      await editIdentifiers(filePath);
      continue;
    }
  }
}

// -------- Path / slug editing (flat maps of scalars) --------

async function editMapValues(filePath: string, mapKey: string): Promise<void> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) return;
    const defaults = loadDefaultsDoc(filePath);
    let keys = listKeys(doc, mapKey);
    // Merge keys from defaults so users see fields they haven't set yet.
    if (defaults) {
      for (const k of listKeys(defaults, mapKey)) {
        if (!keys.includes(k)) keys.push(k);
      }
    }
    // Filter out framework-internal paths (frmwk_dir, flows_doc, rules_doc)
    // and apply the curated PATHS_ORDER so folders come first, subdirs
    // second, and extras last.
    if (mapKey === "paths") {
      keys = keys.filter((k) => !HIDDEN_PATHS.has(k));
      keys.sort((a, b) => orderIndex(a) - orderIndex(b));
    }
    if (keys.length === 0) {
      note(`No editable keys under ${mapKey}.`, "empty");
      return;
    }

    const options = keys.map((k) => {
      const current = getAtPath(doc, `${mapKey}.${k}`);
      const defaultValue = defaults ? getAtPath(defaults, `${mapKey}.${k}`) : undefined;
      const label = `✏  ${padRight(k, 22)}  ${valuePreviewWithDefault(current, defaultValue)}`;
      const hint =
        mapKey === "paths" ? buildPathHint(k, current, defaultValue) : undefined;
      return { value: k, label, hint };
    });
    options.push({ value: BACK, label: "↩  Back" });

    const picked = await askSelect({
      message: `${mapKey} — pick a key to edit:`,
      options,
    });
    if (picked === BACK) return;

    await editScalar(filePath, `${mapKey}.${picked}`);
  }
}

// Rank helper for sorting the paths menu. Keys listed in PATHS_ORDER
// keep their declared order; unknown keys go to the end (preserving
// their original position among themselves via a stable sort).
function orderIndex(key: string): number {
  const idx = PATHS_ORDER.indexOf(key);
  return idx === -1 ? PATHS_ORDER.length : idx;
}

// Builds the hint text for a paths entry. For subdirs, we prefix the
// human description with the effective template so the user sees the
// resolved path (e.g. `{features_dir}/{feature}/user-stories`) rather
// than just the bare subdir name.
function buildPathHint(
  key: string,
  current: unknown,
  defaultValue: unknown,
): string | undefined {
  const description = PATH_HINTS[key];
  const effectiveValue = String(current ?? defaultValue ?? "");
  const template = effectivePathTemplate(key, effectiveValue);
  if (template && description) return `${description}  ·  ${template}`;
  if (template) return template;
  return description;
}

// -------- Identifier editing (nested — identifiers.<type>.<field>) --------

const IDENTIFIER_EDITABLE_FIELDS = ["prefix", "id_format", "scope"] as const;

async function editIdentifiers(filePath: string): Promise<void> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) return;
    const defaults = loadDefaultsDoc(filePath);
    const types = listKeys(doc, "identifiers");
    if (defaults) {
      for (const t of listKeys(defaults, "identifiers")) {
        if (!types.includes(t)) types.push(t);
      }
    }
    if (types.length === 0) {
      note("No identifiers defined.", "empty");
      return;
    }

    const options = types.map((t) => {
      const prefix = getAtPath(doc, `identifiers.${t}.prefix`) ??
        (defaults ? getAtPath(defaults, `identifiers.${t}.prefix`) : undefined);
      const format = getAtPath(doc, `identifiers.${t}.id_format`) ??
        (defaults ? getAtPath(defaults, `identifiers.${t}.id_format`) : undefined);
      return {
        value: t,
        label: `⚙  ${padRight(t, 20)}  ${String(prefix ?? "")} · ${String(format ?? "")}`,
      };
    });
    options.push({ value: BACK, label: "↩  Back" });

    const picked = await askSelect({
      message: "identifiers — pick a type to edit:",
      options,
    });
    if (picked === BACK) return;

    await editIdentifierType(filePath, picked);
  }
}

async function editIdentifierType(filePath: string, identifier: string): Promise<void> {
  while (true) {
    const doc = loadYamlDoc(filePath);
    if (!doc) return;
    const defaults = loadDefaultsDoc(filePath);

    const options = [
      ...IDENTIFIER_EDITABLE_FIELDS.map((field) => {
        const current = getAtPath(doc, `identifiers.${identifier}.${field}`);
        const defaultValue = defaults
          ? getAtPath(defaults, `identifiers.${identifier}.${field}`)
          : undefined;
        return {
          value: field as string,
          label: `✏  ${padRight(field, 12)}  ${valuePreviewWithDefault(current, defaultValue)}`,
        };
      }),
      { value: BACK, label: "↩  Back" },
    ];

    const picked = await askSelect({
      message: `identifiers.${identifier} — pick a field:`,
      options,
    });
    if (picked === BACK) return;

    await editScalar(filePath, `identifiers.${identifier}.${picked}`);
  }
}

// -------- Scalar edit primitive --------

async function editScalar(filePath: string, dottedPath: string): Promise<void> {
  const doc = loadYamlDoc(filePath);
  if (!doc) return;
  const defaults = loadDefaultsDoc(filePath);

  const current = getAtPath(doc, dottedPath);
  const currentStr = current === undefined || current === null ? "" : String(current);
  const defaultValue = defaults ? getAtPath(defaults, dottedPath) : undefined;
  const defaultStr =
    defaultValue === undefined || defaultValue === null ? "" : String(defaultValue);

  const options = [];
  options.push({
    value: CHANGE,
    label: `✏  Change value`,
    hint: currentStr ? `current: ${currentStr}` : "no current value",
  });
  if (defaultStr) {
    const alreadyDefault = currentStr === defaultStr;
    options.push({
      value: USE_DEFAULT,
      label: `↺  Use default`,
      hint: alreadyDefault
        ? `already at default (${defaultStr})`
        : `reset to: ${defaultStr}`,
    });
  }
  options.push({ value: BACK, label: "↩  Back" });

  const messageParts = [dottedPath];
  if (currentStr && defaultStr && currentStr !== defaultStr) {
    messageParts.push(`current: ${currentStr}`);
    messageParts.push(`default: ${defaultStr}`);
  } else if (currentStr) {
    messageParts.push(`current: ${currentStr}`);
  } else if (defaultStr) {
    messageParts.push(`default: ${defaultStr} (not overridden yet)`);
  } else {
    messageParts.push("no current, no default");
  }

  const choice = await askSelect({
    message: messageParts.join("  ·  "),
    options,
  });

  if (choice === BACK) return;

  if (choice === USE_DEFAULT) {
    if (currentStr === defaultStr) return; // already at default, no-op
    setAtPath(doc, dottedPath, defaultStr);
    saveYamlDoc(filePath, doc);
    return;
  }

  // CHANGE — special-cased UIs first (id_format has a guided wizard),
  // then fall through to the generic field-kind registry.
  const prefill = currentStr || defaultStr;
  if (
    dottedPath.startsWith("identifiers.") &&
    dottedPath.endsWith(".id_format")
  ) {
    const next = await promptIdFormat(dottedPath, currentStr, defaultStr);
    if (next === null) return;
    if (next === currentStr) return;
    setAtPath(doc, dottedPath, next);
    saveYamlDoc(filePath, doc);
    return;
  }

  const kind = resolveFieldKind(dottedPath);
  const next = await promptForValue(kind, dottedPath, prefill, defaultStr);
  if (next === null) return;
  if (next === currentStr) return; // no change

  setAtPath(doc, dottedPath, kind.type === "number" ? Number(next) : next);
  saveYamlDoc(filePath, doc);
}

// Guided prompt for id_format: asks digits + separator in plain
// language and composes the template. Falls back to a raw text prompt
// only when the user picks "custom" or the current value doesn't match
// the simple `{prefix}<sep>{number[:0Nd]}` pattern.
async function promptIdFormat(
  dottedPath: string,
  currentStr: string,
  defaultStr: string,
): Promise<string | null> {
  const parsed = parseIdFormat(currentStr) ?? parseIdFormat(defaultStr);

  const digitsChoice = await askSelect({
    message: `${dottedPath} — how many digits should the number have?`,
    options: [
      { value: "0", label: "no padding    · FT-1, FT-2, ..., FT-42" },
      { value: "2", label: "2 digits      · FT-01, FT-02, ..., FT-99" },
      { value: "3", label: "3 digits      · FT-001, FT-002, ..., FT-999" },
      { value: "4", label: "4 digits      · FT-0001, ..." },
      { value: "custom", label: "✏  custom template..." },
    ],
    defaultValue: parsed ? String(parsed.digits) : "2",
  });

  if (digitsChoice === "custom") {
    return askText({
      message: `${dottedPath} — raw template`,
      defaultValue: currentStr || defaultStr,
      placeholder: defaultStr ? `default: ${defaultStr}` : undefined,
      validate: (value) => {
        if (value.length === 0) return "value cannot be empty";
        if (!value.includes("{number")) return "must include {number} or {number:0Nd}";
        return undefined;
      },
    });
  }

  const separator = await askText({
    message: `${dottedPath} — separator between prefix and number`,
    defaultValue: parsed ? parsed.separator : "-",
    placeholder: "-  ·  _  ·  leave empty for none",
    validate: () => undefined,
  });

  return buildIdFormat({
    separator: separator ?? "",
    digits: parseInt(digitsChoice, 10),
  });
}

// Prompts the user for a new value using the input kind that matches
// the field. Returns null when the user cancels (esc / ctrl+c).
async function promptForValue(
  kind: FieldKind,
  dottedPath: string,
  prefill: string,
  defaultStr: string,
): Promise<string | null> {
  if (kind.type === "select") {
    const options = kind.options.map((opt) => ({
      value: opt,
      label: opt === defaultStr ? `${opt}  (default)` : opt,
    }));
    const picked = await askSelect({
      message: `${dottedPath} — pick a value`,
      options,
      defaultValue: prefill && kind.options.includes(prefill) ? prefill : undefined,
    });
    return picked;
  }

  if (kind.type === "number") {
    return askText({
      message: `${dottedPath} — new value (integer)`,
      defaultValue: prefill,
      placeholder: defaultStr ? `default: ${defaultStr}` : undefined,
      validate: (value) => {
        if (value.length === 0) return "value cannot be empty";
        if (!/^-?\d+$/.test(value)) return "must be an integer";
        return undefined;
      },
    });
  }

  return askText({
    message: `${dottedPath} — new value`,
    defaultValue: prefill,
    placeholder: defaultStr ? `default: ${defaultStr}` : undefined,
    validate: (value) => {
      if (value.length === 0) return "value cannot be empty";
      return undefined;
    },
  });
}

function padRight(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}

// Same as a plain preview but appends the default value when it exists and
// differs from the current one. Shows "(default: X)" when the user has
// no override yet, and "· default: X" when they've overridden it.
function valuePreviewWithDefault(current: unknown, defaultValue: unknown): string {
  const hasCurrent = !(current === undefined || current === null);
  const hasDefault = !(defaultValue === undefined || defaultValue === null);

  if (!hasCurrent && !hasDefault) return "(empty)";
  if (!hasCurrent && hasDefault) return `(default: ${truncate(String(defaultValue))})`;
  if (hasCurrent && !hasDefault) return truncate(String(current));

  const currentStr = String(current);
  const defaultStr = String(defaultValue);
  if (currentStr === defaultStr) return truncate(currentStr);
  return `${truncate(currentStr)}  · default: ${truncate(defaultStr)}`;
}

function truncate(s: string): string {
  if (s.length <= 30) return s;
  return s.slice(0, 27) + "...";
}
