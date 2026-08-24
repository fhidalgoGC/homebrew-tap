#!/usr/bin/env bash
# ============================================================================
# Hook: check-pipeline-preconditions — PIPELINE-PRODUCT DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-pipeline-product".
# Verifica precondiciones ANTES de que el pipeline arranque.
#
# Reglas:
#   R24 (framework install) → ~/.fremi/framework/rules/framework-mechanics.md
#   R1 (no salta etapas)    → ~/.fremi/framework/rules/hierarchy.md
#
# Convención de identificadores:
#   Este hook no hardcodea prefijos ni nombres de archivos del workflow.
#   El pipeline product opera sobre docs de capa raíz (no tiene upper-layer).
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

# Detectar invocación del pipeline product
[[ "$PROMPT" != *"/fremi-pipeline-product"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# Chequear dos condiciones:
#   1. Symlink fremi-story (orquestador de story) existe — señal de install.
#      (pipeline-product comparte la verificación R24 con todos los pipelines)
#   2. CLAUDE.md referencia framework/rules/workflow.md.
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
# Upper-layer preconditions para pipeline-product:
#   Ninguna — product es la capa raíz del framework.
#   El pipeline product puede correr sin docs previos (los crea desde cero).
# --------------------------------------------------------------------------

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [pipeline-preconditions/product] Antes de invocar /fremi-pipeline-product:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
