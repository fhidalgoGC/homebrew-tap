import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface InstallClaudeMdReport {
  action: "created" | "updated" | "already-configured";
  errors: string[];
}

const CLAUDE_MD_HEADER = `# Project — powered by fremi-framework

Este proyecto usa **fremi-framework** para su flujo Product Discovery + SDD + BDD + TDD.

**Reglas duras del framework** (obligatorias antes de cualquier acción no trivial):
- \`~/.fremi/framework/framework/rules/workflow.md\` — Reglas 1-24 (flow forward).
- \`~/.fremi/framework/framework/rules/reverse.md\` — Reglas 25-32 (reverse-engineering).

**Descripción del flujo**:
- \`~/.fremi/framework/framework/flows/\` — flow.<capa>.md por cada capa.

**Skills invocables**: prefijo \`/fremi-*\`. Ver \`~/.fremi/framework/framework/skills/\`.

**Framework instalado**:
- Ubicación: \`~/.fremi/framework/\`.
- CLI: \`fremi version\`, \`fremi install [path]\`.
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
