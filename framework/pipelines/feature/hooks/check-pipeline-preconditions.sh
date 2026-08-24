#!/usr/bin/env bash
# ============================================================================
# Hook: check-pipeline-preconditions — PIPELINE-FEATURE DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-pipeline-feature".
# Verifica precondiciones ANTES de que el pipeline arranque.
#
# Reglas:
#   R24 (framework install) → ~/.fremi/framework/rules/framework-mechanics.md
#   R1 (no salta etapas)    → ~/.fremi/framework/rules/hierarchy.md
#
# Upper-layer para feature:
#   - docs/works/product/definition.md debe existir con contenido real.
#   - docs/works/product/plan.md debe existir con contenido real.
#
# Convención de identificadores:
#   Este hook no hardcodea prefijos de feature (como "FT-") ni nombres de
#   archivos del workflow. Los paths product/* son fijos en la jerarquía.
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

# Detectar invocación del pipeline feature
[[ "$PROMPT" != *"/fremi-pipeline-feature"* ]] && exit 0

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
# Upper-layer: capa producto lista (Regla 1)
# --------------------------------------------------------------------------
PRODUCT_DEFINITION="docs/works/product/definition.md"
PRODUCT_PLAN="docs/works/product/plan.md"

if [[ ! -f "$PRODUCT_DEFINITION" ]]; then
  problems+=("$PRODUCT_DEFINITION no existe. Sin capa producto no se puede crear una feature (Regla 1). Corré /fremi-pipeline-product primero.")
elif [[ $(wc -c <"$PRODUCT_DEFINITION") -lt 100 ]]; then
  problems+=("$PRODUCT_DEFINITION parece vacío (< 100 bytes). Completá la capa producto antes de crear una feature.")
fi

if [[ ! -f "$PRODUCT_PLAN" ]]; then
  problems+=("$PRODUCT_PLAN no existe. Necesario para ancestor.version_at_creation (Regla 17). Corré /fremi-pipeline-product o /fremi-product-plan primero.")
elif [[ $(wc -c <"$PRODUCT_PLAN") -lt 50 ]]; then
  problems+=("$PRODUCT_PLAN parece vacío (< 50 bytes — sin frontmatter usable).")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [pipeline-preconditions/feature] Antes de invocar /fremi-pipeline-feature:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo "        ~/.fremi/framework/rules/hierarchy.md → R1"
  echo ""
fi

exit 0
