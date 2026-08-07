import { resolve, join } from "node:path";
import { existsSync, statSync } from "node:fs";
import { discoverSettingSections, pickSection, pickSectionAction } from "../prompts/setting";
import { runMethodologyMenu } from "../prompts/setting-methodology";
import {
  runModelsMenu,
  runLayerModelsMenu,
  runDefaultModelMenu,
} from "../prompts/setting-models";
import { runLayerStepAgentsMenu } from "../prompts/setting-step-agents";
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

    // Methodology gets a specialised editor (paths / slug / identifiers).
    if (section.name === "methodology") {
      console.clear();
      await runMethodologyMenu(section.file);
      continue;
    }

    // Models gets a specialised editor (per-skill alias mapping).
    if (section.name === "models") {
      console.clear();
      await runModelsMenu(section.file);
      continue;
    }

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
      if (action.type === "edit-models") {
        const modelsFile = join(targetPath, ".fremi", "settings", "models.user.yaml");
        if (!existsSync(modelsFile)) {
          console.log(`Cannot edit models: ${modelsFile} not found. Run 'fremi install' to seed it.`);
          await sleep(1500);
          continue;
        }
        console.clear();
        await runLayerModelsMenu(modelsFile, section.name);
      }
      if (action.type === "edit-default-model") {
        console.clear();
        await runDefaultModelMenu(section.file);
      }
      if (action.type === "edit-step-agents") {
        // section.file is .fremi/settings/<layer>/config.user.yaml — the
        // step agents map lives there. Layer name is the section name.
        console.clear();
        await runLayerStepAgentsMenu(section.file, section.name);
      }
    }
  }

  console.log("✓ done editing settings.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
