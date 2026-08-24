#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-preconditions — REVERSE-SKILL-STORY DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-reverse-story".
# Verifica precondiciones ANTES de que el skill arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   Este hook NO hardcodea prefijos ni IDs de features/stories — el feature ID
#   y story ID los pasa el usuario como argumentos al invocar el skill. El hook
#   verifica que la carpeta docs/works/features/ exista como upper-layer mínima.
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

# Detectar invocación del skill reverse-story
[[ "$PROMPT" != *"/fremi-reverse-story"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# --------------------------------------------------------------------------
if [[ ! -L ".claude/skills/fremi-story" ]]; then
  problems+=("Framework no instalado — .claude/skills/fremi-story no es symlink. Corré \`fremi install\`.")
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
# Upper-layer preconditions para reverse-story:
#   La feature padre debe existir (aunque sea reverse-engineerada previamente).
#   El feature ID lo pasa el usuario — el hook verifica que la carpeta de features
#   exista; la validación del ID específico la hace el skill en su paso 0.
# --------------------------------------------------------------------------
if [[ ! -d "docs/works/features" ]]; then
  problems+=("Carpeta docs/works/features/ no existe — reverse-story requiere que la feature padre exista. Corré /fremi-reverse-feature primero para la feature correspondiente.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [reverse-preconditions/story] Antes de invocar /fremi-reverse-story:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
