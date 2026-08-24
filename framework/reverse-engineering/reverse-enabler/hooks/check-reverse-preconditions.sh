#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-preconditions — REVERSE-SKILL-ENABLER DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-reverse-enabler".
# Verifica precondiciones ANTES de que el skill arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R15 (scope variable)     → ~/.fremi/framework/rules/workflow.md
#
# Convención de identificadores:
#   Este hook NO hardcodea prefijos ni IDs de features/stories. El scope y los
#   IDs los pasa el usuario como argumentos. El hook extrae el scope del prompt
#   para verificar la upper-layer correcta (feature o story padre).
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

# UserPromptSubmit envía { "prompt": "..." } por stdin
command -v jq >/dev/null 2>&1 || exit 0
PROMPT=$(echo "$PAYLOAD" | jq -r '.prompt // empty' 2>/dev/null || true)
[[ -z "$PROMPT" ]] && exit 0

# Detectar invocación del skill reverse-enabler
[[ "$PROMPT" != *"/fremi-reverse-enabler"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# --------------------------------------------------------------------------
if [[ ! -L ".claude/skills/fremi-enabler" ]]; then
  problems+=("Framework no instalado — .claude/skills/fremi-enabler no es symlink. Corré \`fremi install\`.")
fi

if [[ ! -f "CLAUDE.md" ]]; then
  problems+=("CLAUDE.md no existe — corré \`fremi install\`.")
elif ! grep -q "~/.fremi/framework/rules/workflow.md" CLAUDE.md 2>/dev/null; then
  problems+=("CLAUDE.md no referencia ~/.fremi/framework/rules/workflow.md — reinstalá con \`fremi install\`.")
fi

# --------------------------------------------------------------------------
# R30: git history necesaria para timestamps inferidos
# --------------------------------------------------------------------------
if [[ ! -d ".git" ]]; then
  problems+=("No hay .git/ — reverse necesita git history para inferir timestamps (Regla 30). Los docs se generarán con reverse_engineered_confidence: 0.3.")
fi

# --------------------------------------------------------------------------
# Upper-layer preconditions para reverse-enabler (scope variable):
#   --scope global (default): ninguna upper-layer requerida.
#   --scope feature: la carpeta de la feature debe existir.
#   --scope story: la carpeta de la story debe existir.
#
# El hook extrae el scope del prompt para verificar la upper-layer correcta.
# Sólo emite warnings — la validación del ID específico la hace el skill.
# --------------------------------------------------------------------------

# Detectar si el prompt menciona --scope feature o --scope story
if echo "$PROMPT" | grep -q -- '--scope story'; then
  if [[ ! -d "docs/works/features" ]]; then
    problems+=("Scope story declarado pero docs/works/features/ no existe — la story padre debe existir. Verificá el path o corré /fremi-reverse-story primero.")
  fi
elif echo "$PROMPT" | grep -q -- '--scope feature'; then
  if [[ ! -d "docs/works/features" ]]; then
    problems+=("Scope feature declarado pero docs/works/features/ no existe — la feature padre debe existir. Verificá el path o corré /fremi-reverse-feature primero.")
  fi
fi
# --scope global (default): ninguna upper-layer verificada aquí.

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [reverse-preconditions/enabler] Antes de invocar /fremi-reverse-enabler:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo "   Ver: ~/.fremi/framework/rules/workflow.md → R15 (scope variable de enabler)"
  echo ""
fi

exit 0
