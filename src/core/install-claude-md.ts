import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface InstallClaudeMdReport {
  action: "created" | "updated" | "already-configured";
  errors: string[];
}

const CLAUDE_MD_HEADER = `# Project — powered by fremi-framework

Este proyecto usa **fremi-framework** para su flujo Product Discovery + SDD + BDD + TDD.

**Reglas duras del framework** (obligatorias antes de cualquier acción no trivial):
- \`.claude/rules/workflow.md\` — Reglas 1-24 (flow forward).
- \`.claude/rules/reverse.md\` — Reglas 25-32 (reverse-engineering).

**Skills invocables**: prefijo \`/fremi-*\`. Ver \`.claude/skills/\`.

**Config del proyecto** (OBEDECER antes de decidir cómo ejecutar un step):
- \`.fremi/settings/\` — YAMLs \`.user.yaml\` copiados del framework. Estos gobiernan \`execution_mode\`, \`step_agents\` (main / subagent / agent), overrides, etc.
  - \`agents.user.yaml\` — override de subagents (model, effort, claude_code_agent).
  - \`<capa>/config.user.yaml\` — config por capa (product, feature, story, enabler).
- \`.fremi/config.yaml\` — config global del proyecto (stack, testing, preferences).

**Registry canónico de agents** (no editable, viene del framework):
- \`~/.fremi/framework/framework/settings/agents.core.yaml\` — mapping subagent-alias → Claude Code native agent + model.

**Framework instalado**:
- Ubicación: \`~/.fremi/framework/\`.
- CLI: \`fremi version\`, \`fremi install\`, \`fremi uninstall\`, \`fremi update\`.
- Repo: https://github.com/fhidalgoGC/homebrew-tap

---

## Estructura del trabajo en este proyecto

\`\`\`
docs/works/
├── product/            ← capa PRODUCTO (iniciativas, ideas, definition, strategies, decisions, plan)
└── features/
    └── FT-XX_<slug>/   ← capa FEATURE
        └── user-stories/
            └── HU-XX_<slug>/   ← capa USER STORY (FW-00..FW-10)
\`\`\`

`;

const FREMI_MARKER_START = "<!-- fremi-framework:start -->";
const FREMI_MARKER_END = "<!-- fremi-framework:end -->";

/**
 * Creates or updates CLAUDE.md at the project root with a fremi-framework
 * block delimited by markers. Everything outside the markers is preserved.
 */
export async function installClaudeMd(
  targetPath: string,
  _frameworkContent: string,
): Promise<InstallClaudeMdReport> {
  const claudeMdPath = resolve(targetPath, "CLAUDE.md");
  const block = `${FREMI_MARKER_START}\n${CLAUDE_MD_HEADER}${FREMI_MARKER_END}\n`;

  if (!existsSync(claudeMdPath)) {
    writeFileSync(claudeMdPath, block);
    return { action: "created", errors: [] };
  }

  const current = readFileSync(claudeMdPath, "utf8");

  if (current.includes(FREMI_MARKER_START) && current.includes(FREMI_MARKER_END)) {
    // Replace existing block
    const updated = current.replace(
      new RegExp(`${FREMI_MARKER_START}[\\s\\S]*?${FREMI_MARKER_END}\\n?`),
      block,
    );
    if (updated === current) {
      return { action: "already-configured", errors: [] };
    }
    writeFileSync(claudeMdPath, updated);
    return { action: "updated", errors: [] };
  }

  // No markers — prepend the block
  writeFileSync(claudeMdPath, block + "\n" + current);
  return { action: "updated", errors: [] };
}
