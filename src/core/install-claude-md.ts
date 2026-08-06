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
- \`.fremi/settings/\` — YAMLs \`.user.yaml\` copiados del framework. Gobiernan \`execution_mode\`, \`step_agents\` (main / subagent / agent), overrides.
  - \`agents.user.yaml\` — override de subagents (model, effort, claude_code_agent).
  - \`<capa>/config.user.yaml\` — config por capa (product, feature, story, enabler).
- \`.fremi/config.yaml\` — config global del proyecto (stack, testing, preferences).

**Precedencia de config — REGLA DURA (obligatoria para skills y hooks)**:

**Dónde vive cada tipo de archivo (nunca mezclar):**

| Ubicación | Archivos permitidos | Editable |
|---|---|---|
| \`~/.fremi/framework/framework/**/\` | \`.core.yaml\` (estructura + defaults) | ❌ NO — se sobreescribe con \`fremi update\` |
| \`.fremi/settings/**/\` | \`.user.yaml\` (overrides del proyecto) | ✅ SÍ — el user edita acá |

**Los \`.core.yaml\` NUNCA se copian al proyecto**. Viven exclusivamente en el framework global. Los \`.user.yaml\` NUNCA viven en el framework como fuente activa — se copian al proyecto en \`fremi install\` y ahí se editan.

**Al resolver un valor de config, un skill debe:**

1. **Leer primero \`.fremi/settings/**.user.yaml\`** (proyecto) — si el key existe con valor, gana.
2. **Fallback a \`~/.fremi/framework/framework/**.core.yaml\`** (framework) — si el key no está en user, usar el default del core.
3. **Si el user pone un valor fuera del \`options\` declarado en core** → ERROR (validación estructural).

**Ejemplo concreto:**
- Core (framework):  \`~/.fremi/framework/framework/settings/agents.core.yaml\` → \`fremi-apply: { model: sonnet }\`
- User (proyecto):   \`.fremi/settings/agents.user.yaml\` → \`subagent_overrides.fremi-apply.model: opus\`
- Efectivo:           **\`opus\`** (user gana)

Aplica igual a per-layer: \`.fremi/settings/story/config.user.yaml\` extiende \`~/.fremi/framework/framework/skills/story/config.core.yaml\`.

**Registry canónico de agents** (no editable, del framework):
- \`~/.fremi/framework/framework/settings/agents.core.yaml\` — options válidas de subagent + mapping a Claude Code native agent + defaults de model/effort.

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
