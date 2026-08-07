import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { askSelect, note } from "./_helpers";
import {
  loadYamlDoc,
  saveYamlDoc,
  getAtPath,
  setAtPath,
  listKeys,
} from "../core/yaml-edit";
import { getFrameworkContentRoot } from "../core/paths";

// Editor for the `step_agents:` field of each layer's config.user.yaml.
//
// Each step in a layer's `step_matrix` declares which agent types are
// STRUCTURALLY viable — `agent.options: [main, subagent, agent]` — plus
// a framework `default` and a reasoning per type. This editor loads the
// core file to know the valid options and lets the user pick one per
// step, writing to config.user.yaml → step_agents.<step>.
//
// Invoked from `fremi setting → <layer> → 🎭 Edit step agents`.

const BACK = "__back__";
const USE_DEFAULT = "__use_default__";

type MenuResult = "back";

interface StepAgentInfo {
  options: string[];
  default: string;
  reasoning: Record<string, string>;
}

interface LayerCore {
  steps: string[]; // ordered
  info: Record<string, StepAgentInfo>;
}

// Load the core file's step_matrix and extract each step's agent info.
// Layer name comes from the section name (story / feature / product /
// enabler). Returns null when the core file is missing or malformed.
function loadLayerCore(layerName: string): LayerCore | null {
  const corePath = resolve(
    getFrameworkContentRoot(),
    "skills",
    layerName,
    "config.core.yaml",
  );
  if (!existsSync(corePath)) return null;
  const doc = loadYamlDoc(corePath);
  if (!doc) return null;

  const steps = listKeys(doc, "step_matrix");
  const info: Record<string, StepAgentInfo> = {};
  for (const step of steps) {
    const optionsRaw = getAtPath(doc, `step_matrix.${step}.agent.options`);
    const defaultRaw = getAtPath(doc, `step_matrix.${step}.agent.default`);
    // options may be a YAML sequence node — normalize to string[]
    let options: string[] = [];
    if (Array.isArray(optionsRaw)) {
      options = optionsRaw.map((x) => String(x));
    } else if (optionsRaw && typeof optionsRaw === "object" && "items" in optionsRaw) {
      // yaml Seq node — extract items
      const items = (optionsRaw as { items: Array<{ value?: unknown }> }).items;
      options = items.map((it) => String(it.value ?? it));
    }
    const defaultAlias = defaultRaw === undefined || defaultRaw === null
      ? ""
      : String(defaultRaw);

    // reasoning is a map — read whichever options the step declares
    const reasoning: Record<string, string> = {};
    for (const opt of options) {
      const rv = getAtPath(doc, `step_matrix.${step}.agent.reasoning.${opt}`);
      if (rv !== undefined && rv !== null) reasoning[opt] = String(rv).trim();
    }

    info[step] = { options, default: defaultAlias, reasoning };
  }
  return { steps, info };
}

export async function runLayerStepAgentsMenu(
  userFilePath: string,
  layerName: string,
): Promise<MenuResult> {
  const core = loadLayerCore(layerName);
  if (!core) {
    note(`Cannot load framework config.core.yaml for layer '${layerName}'`, "error");
    return "back";
  }

  while (true) {
    const doc = loadYamlDoc(userFilePath);
    if (!doc) {
      note(`Cannot parse ${userFilePath}`, "error");
      return "back";
    }

    const overrides = readMap(doc, "step_agents");

    const options = core.steps.map((step) => {
      const stepInfo = core.info[step];
      const current = overrides[step] ?? stepInfo.default;
      const editable = stepInfo.options.length > 1;
      const marks: string[] = [];
      if (current === stepInfo.default) marks.push("default");
      const hint = editable
        ? `options: [${stepInfo.options.join(", ")}]` +
          (marks.length ? `  ·  ${marks.join(" · ")}` : "")
        : `options: [${stepInfo.options.join(", ")}]  ·  (no overridable)`;
      return {
        value: step,
        label: `${padRight(step, 24)}  ${padRight(current, 10)}`,
        hint,
      };
    });
    options.push({ value: BACK, label: "↩  Back", hint: undefined });

    const picked = await askSelect({
      message: `${layerName}.step_agents — pick a step:`,
      options,
    });
    if (picked === BACK) return "back";

    await editStepAgent(userFilePath, core, picked);
  }
}

async function editStepAgent(
  userFilePath: string,
  core: LayerCore,
  step: string,
): Promise<void> {
  const doc = loadYamlDoc(userFilePath);
  if (!doc) return;

  const stepInfo = core.info[step];
  const overrides = readMap(doc, "step_agents");
  const current = overrides[step] ?? stepInfo.default;

  // Steps with a single option cannot be changed — surface a note.
  if (stepInfo.options.length <= 1) {
    note(
      `step_agents.${step} = ${stepInfo.default}\n` +
        `  Only one option available in core: [${stepInfo.options.join(", ")}]\n` +
        `  (no overridable — the framework locked this step to ${stepInfo.default})`,
      "read-only",
    );
    return;
  }

  const options: Array<{ value: string; label: string; hint?: string }> = [];
  for (const opt of stepInfo.options) {
    const marks: string[] = [];
    if (opt === current) marks.push("current");
    if (opt === stepInfo.default) marks.push("default");
    const reasoning = stepInfo.reasoning[opt];
    const suffix = marks.length > 0 ? `  ·  ${marks.join(" · ")}` : "";
    const hint = reasoning ? `${truncate(reasoning)}${suffix}` : suffix.trim();
    options.push({ value: opt, label: opt, hint: hint || undefined });
  }

  const currentOverride = overrides[step];
  options.push({
    value: USE_DEFAULT,
    label: "↺  Use framework default",
    hint: currentOverride
      ? `remove override, fall back to ${stepInfo.default}`
      : `already at default (${stepInfo.default})`,
  });
  options.push({ value: BACK, label: "↩  Back" });

  const messageParts = [`step_agents.${step}`];
  if (currentOverride) {
    messageParts.push(`current: ${current}`);
    messageParts.push(`default: ${stepInfo.default}`);
  } else {
    messageParts.push(`default: ${stepInfo.default} (not overridden yet)`);
  }

  const choice = await askSelect({
    message: messageParts.join("  ·  "),
    options,
  });

  if (choice === BACK) return;

  if (choice === USE_DEFAULT) {
    if (!currentOverride) return;
    (doc as unknown as { deleteIn: (path: string[]) => boolean }).deleteIn([
      "step_agents",
      step,
    ]);
    saveYamlDoc(userFilePath, doc);
    return;
  }

  if (choice === current && currentOverride) return; // no change

  setAtPath(doc, `step_agents.${step}`, choice);
  saveYamlDoc(userFilePath, doc);
}

function readMap(
  doc: ReturnType<typeof loadYamlDoc>,
  path: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!doc) return out;
  for (const k of listKeys(doc, path)) {
    const v = getAtPath(doc, `${path}.${k}`);
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}

function padRight(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}

function truncate(s: string): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  if (oneLine.length <= 60) return oneLine;
  return oneLine.slice(0, 57) + "...";
}
