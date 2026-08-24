#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-preconditions — REVERSE-SKILL-PRODUCT DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-reverse-product".
# Verifica precondiciones ANTES de que el skill arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   reverse-product no recibe IDs como argumentos — opera sobre la capa producto
#   completa. El hook sólo verifica instalación, git y existencia de docs/works/.
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

# Detectar invocación del skill reverse-product
[[ "$PROMPT" != *"/fremi-reverse-product"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# --------------------------------------------------------------------------
if [[ ! -L ".claude/skills/fremi-story" ]] && [[ ! -L ".claude/skills/fremi-feature" ]]; then
  problems+=("Framework no instalado — ningún orquestador fremi-story/fremi-feature es symlink. Corré \`fremi install\`.")
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
# Upper-layer preconditions para reverse-product:
#   reverse-product es la capa raíz — no hay upper-layer. Sólo verifica que
#   docs/works/ exista con al menos una feature para poder reconstruir producto.
# --------------------------------------------------------------------------
if [[ ! -d "docs/works" ]]; then
  problems+=("Carpeta docs/works/ no existe — el proyecto no parece tener estructura de framework. Verificá el path del proyecto o corré \`fremi install\`.")
elif [[ ! -d "docs/works/features" ]]; then
  problems+=("Carpeta docs/works/features/ no existe — reverse-product necesita al menos una feature existente para reconstruir la capa producto. Verificá el path del proyecto.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [reverse-preconditions/product] Antes de invocar /fremi-reverse-product:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
