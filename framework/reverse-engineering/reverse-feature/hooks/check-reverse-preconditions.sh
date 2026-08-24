#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-preconditions — REVERSE-SKILL-FEATURE DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-reverse-feature".
# Verifica precondiciones ANTES de que el skill arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   Este hook NO hardcodea prefijos ni IDs de features — el feature ID lo
#   pasa el usuario como argumento al invocar el skill. El hook sólo verifica
#   que la estructura mínima de docs/works/ exista.
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

# Detectar invocación del skill reverse-feature
[[ "$PROMPT" != *"/fremi-reverse-feature"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# --------------------------------------------------------------------------
if [[ ! -L ".claude/skills/fremi-feature" ]]; then
  problems+=("Framework no instalado — .claude/skills/fremi-feature no es symlink. Corré \`fremi install\`.")
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
# Upper-layer preconditions para reverse-feature:
#   El skill puede correr aunque no exista capa producto (la deja sin vincular
#   y advierte). Pero sí verifica que docs/works/ exista mínimamente.
# --------------------------------------------------------------------------
if [[ ! -d "docs/works" ]]; then
  problems+=("Carpeta docs/works/ no existe — el proyecto no parece tener estructura de framework. Verificá el path del proyecto o corré \`fremi install\`.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [reverse-preconditions/feature] Antes de invocar /fremi-reverse-feature:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
