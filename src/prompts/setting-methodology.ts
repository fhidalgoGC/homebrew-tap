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

// Hints explaining that certain keys are subdir names relative to a
// parent path, not full paths. Helps the user understand why the value
// looks like `user-stories` instead of `docs/works/features/.../user-stories`.
const PATH_HINTS: Record<string, string> = {
  user_stories_subdir: "subdir inside each feature folder",
  enablers_subdir: "subdir inside feature/story folders",
  bugs_subdir: "subdir inside each story folder",
};

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
    // Filter out framework-internal paths (frmwk_dir, flows_doc, rules_doc).
    if (mapKey === "paths") {
      keys = keys.filter((k) => !HIDDEN_PATHS.has(k));
    }
    if (keys.length === 0) {
      note(`No editable keys under ${mapKey}.`, "empty");
      return;
    }

    const options = keys.map((k) => {
      const current = getAtPath(doc, `${mapKey}.${k}`);
      const defaultValue = defaults ? getAtPath(defaults, `${mapKey}.${k}`) : undefined;
      return {
        value: k,
        label: `✏  ${padRight(k, 22)}  ${valuePreviewWithDefault(current, defaultValue)}`,
        hint: mapKey === "paths" ? PATH_HINTS[k] : undefined,
      };
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

  // CHANGE — open the text prompt, pre-filled with current (or default
  // when there's no current yet).
  const prefill = currentStr || defaultStr;
  const next = await askText({
    message: `${dottedPath} — new value`,
    defaultValue: prefill,
    placeholder: defaultStr ? `default: ${defaultStr}` : undefined,
    validate: (value) => {
      if (value.length === 0) return "value cannot be empty";
      return undefined;
    },
  });

  if (next === currentStr) return; // no change

  setAtPath(doc, dottedPath, next);
  saveYamlDoc(filePath, doc);
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
