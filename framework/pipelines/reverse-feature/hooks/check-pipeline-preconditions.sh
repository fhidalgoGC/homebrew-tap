#!/usr/bin/env bash
# ============================================================================
# Hook: check-pipeline-preconditions — PIPELINE-REVERSE-FEATURE DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-pipeline-reverse-feature".
# Verifica precondiciones ANTES de que el pipeline arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   Este hook NO hardcodea prefijos ni IDs de features — el feature ID lo
#   pasa el usuario como argumento al invocar el pipeline. El hook sólo
#   verifica que la capa producto padre exista como precondición upper-layer.
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

# Detectar invocación del pipeline reverse-feature
[[ "$PROMPT" != *"/fremi-pipeline-reverse-feature"* ]] && exit 0

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
# Upper-layer preconditions para pipeline-reverse-feature:
#   El pipeline puede correr sin capa producto (la reconstruirá o la deja sin
#   vincular). Pero sí advierte si la carpeta docs/works/features/ no existe,
#   ya que indica un proyecto sin estructura de framework.
# --------------------------------------------------------------------------
if [[ ! -d "docs/works" ]]; then
  problems+=("Carpeta docs/works/ no existe — el proyecto no parece tener estructura de framework. Verificá el path del proyecto o corré \`fremi install\`.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [pipeline-reverse-preconditions/feature] Antes de invocar /fremi-pipeline-reverse-feature:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
