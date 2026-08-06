import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { discoverSettingSections, pickSection, pickSectionAction } from "../prompts/setting";
import { toggleActive, readActive } from "../core/settings-edit";

// `fremi setting [path]` — interactive TUI that lets the user toggle
// per-layer settings inside a project's .fremi/settings/. MVP scope
// (v0.3.5): toggle the top-level `active:` boolean for any discovered
// .user.yaml. Future iterations will grow richer per-section menus.

export async function runSetting(rawPath?: string): Promise<void> {
  const targetPath = resolve(rawPath ?? process.cwd());

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }
  if (!statSync(targetPath).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  const sections = discoverSettingSections(targetPath);
  if (sections.length === 0) {
    console.log("No .fremi/settings/ found in this project.");
    console.log("Run `fremi install` first to seed the settings folder.");
    return;
  }

  while (true) {
    console.clear();
    const section = await pickSection(sections);
    if (!section) break;

    while (true) {
      console.clear();
      const action = await pickSectionAction(section);
      if (action.type === "back") break;
      if (action.type === "toggle-active") {
        const current = readActive(section.file);
        if (current === "missing" || current === "malformed") {
          console.log(`Cannot toggle: ${section.file} has no top-level 'active: true|false' key.`);
          await sleep(1200);
          continue;
        }
        const next = toggleActive(section.file);
        console.log(`${section.name}: active -> ${next}`);
        await sleep(700);
      }
    }
  }

  console.log("✓ done editing settings.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
