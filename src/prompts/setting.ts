import { resolve, join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { askSelect, note } from "./_helpers";
import { readActive } from "../core/settings-edit";

// Discovery + interactive selection for `fremi setting`. Reads the
// project's .fremi/settings/ folder to know which sections exist (so
// this scales as we add more .user.yaml files without touching this
// module).

const DONE_TOKEN = "__done__";
const BACK_TOKEN = "__back__";

export interface SettingSection {
  name: string;      // "story", "feature", "agents", ...
  file: string;      // absolute path to the .user.yaml
}

export function discoverSettingSections(targetPath: string): SettingSection[] {
  const root = resolve(targetPath, ".fremi", "settings");
  if (!existsSync(root)) return [];

  const sections: SettingSection[] = [];

  // Top-level *.user.yaml (e.g. agents.user.yaml)
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".user.yaml")) {
      sections.push({
        name: entry.name.replace(/\.user\.yaml$/, ""),
        file: join(root, entry.name),
      });
    }
    if (entry.isDirectory()) {
      // Nested layer/<file>.user.yaml — one section per subdir.
      const layerRoot = join(root, entry.name);
      for (const sub of readdirSync(layerRoot, { withFileTypes: true })) {
        if (sub.isFile() && sub.name.endsWith(".user.yaml")) {
          sections.push({
            name: entry.name,
            file: join(layerRoot, sub.name),
          });
          break; // one .user.yaml per layer is the convention
        }
      }
    }
  }

  sections.sort((a, b) => a.name.localeCompare(b.name));
  return sections;
}

export interface SectionAction {
  type: "toggle-active" | "back";
}

/**
 * Top-level menu: pick a section or Done. Returns null when the user
 * picks Done or cancels.
 */
export async function pickSection(sections: SettingSection[]): Promise<SettingSection | null> {
  const options = sections.map((s) => {
    const state = readActive(s.file);
    const label = padRight(s.name, 12);
    return {
      value: s.name,
      label: `⚙  ${label}  active: ${labelForActive(state)}`,
      hint: pathRelativeToCwd(s.file),
    };
  });

  options.push({
    value: DONE_TOKEN,
    label: "✓  Done",
    hint: "close the settings editor",
  });

  const choice = await askSelect({
    message: "fremi settings — pick a section:",
    options,
  });

  if (choice === DONE_TOKEN) return null;
  return sections.find((s) => s.name === choice) ?? null;
}

/**
 * Section menu: shows current state and offers the actions this MVP
 * supports (currently: toggle active + back).
 */
export async function pickSectionAction(section: SettingSection): Promise<SectionAction> {
  const state = readActive(section.file);

  const options = [
    {
      value: "toggle-active",
      label: `✏  Toggle active (currently: ${labelForActive(state)})`,
      hint: state === "missing" ? "no top-level `active:` key in file" : undefined,
    },
    {
      value: BACK_TOKEN,
      label: "↩  Back to sections",
    },
  ];

  const choice = await askSelect({
    message: `${section.name}  ·  ${pathRelativeToCwd(section.file)}`,
    options,
  });

  if (choice === BACK_TOKEN) return { type: "back" };
  return { type: "toggle-active" };
}

function labelForActive(state: ReturnType<typeof readActive>): string {
  switch (state) {
    case "true":
      return "true";
    case "false":
      return "false";
    case "missing":
      return "(no active key)";
    case "malformed":
      return "(malformed)";
  }
}

function padRight(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}

function pathRelativeToCwd(absPath: string): string {
  const cwd = process.cwd();
  return absPath.startsWith(cwd) ? "." + absPath.slice(cwd.length) : absPath;
}

export { note };
