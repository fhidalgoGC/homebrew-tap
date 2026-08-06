import { askSelect, askText, note } from "./_helpers";
import {
  loadYamlDoc,
  saveYamlDoc,
  getAtPath,
  setAtPath,
  listKeys,
} from "../core/yaml-edit";
import { readActive, toggleActive } from "../core/settings-edit";

// Specialised menus for editing methodology.user.yaml. The generic
// setting menu delegates here when the section is "methodology".
// Structure of the file:
//   active: bool
//   paths.*         string values (docs/works/features, ...)
//   slug.*          case, regex, max_length, transforms
//   identifiers.*   feature/user_story/enabler/... each with prefix +
//                   id_format + scope + regex + examples

const BACK = "__back__";

type MenuResult = "back";

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
    const keys = listKeys(doc, mapKey);
    if (keys.length === 0) {
      note(`No editable keys under ${mapKey}.`, "empty");
      return;
    }

    const options = keys.map((k) => {
      const value = getAtPath(doc, `${mapKey}.${k}`);
      return {
        value: k,
        label: `✏  ${padRight(k, 22)}  ${valuePreview(value)}`,
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
    const types = listKeys(doc, "identifiers");
    if (types.length === 0) {
      note("No identifiers defined.", "empty");
      return;
    }

    const options = types.map((t) => {
      const prefix = getAtPath(doc, `identifiers.${t}.prefix`);
      const format = getAtPath(doc, `identifiers.${t}.id_format`);
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

    const options = [
      ...IDENTIFIER_EDITABLE_FIELDS.map((field) => {
        const v = getAtPath(doc, `identifiers.${identifier}.${field}`);
        return {
          value: field as string,
          label: `✏  ${padRight(field, 12)}  ${valuePreview(v)}`,
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

  const current = getAtPath(doc, dottedPath);
  const currentStr = current === undefined || current === null ? "" : String(current);

  const next = await askText({
    message: `${dottedPath}  (current: ${currentStr || "empty"})`,
    defaultValue: currentStr,
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

function valuePreview(value: unknown): string {
  if (value === undefined || value === null) return "(empty)";
  const s = String(value);
  if (s.length <= 45) return s;
  return s.slice(0, 42) + "...";
}
