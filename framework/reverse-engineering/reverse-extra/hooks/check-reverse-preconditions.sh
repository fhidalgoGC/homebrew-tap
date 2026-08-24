#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-preconditions — REVERSE-SKILL-EXTRA DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-reverse-extra".
# Verifica precondiciones ANTES de que el skill arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R14 (trabajo fuera flujo) → ~/.fremi/framework/rules/workflow.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   Este hook no hardcodea prefijos ni IDs. El slug del extra lo pasa el usuario
#   como argumento. El hook verifica instalación, git y existencia/creación de
#   docs/works/extra/ como destino.
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

# Detectar invocación del skill reverse-extra
[[ "$PROMPT" != *"/fremi-reverse-extra"* ]] && exit 0

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
# Destino para reverse-extra: docs/works/extra/
#   Si no existe → crear automáticamente (es la primera vez). El skill usará
#   esta carpeta para el EX-NN. No es un error — sólo un aviso informativo.
# --------------------------------------------------------------------------
if [[ ! -d "docs/works/extra" ]]; then
  echo ""
  echo "ℹ️  [reverse-preconditions/extra] La carpeta docs/works/extra/ no existe aún."
  echo "   El skill la creará al generar el primer doc extra."
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [reverse-preconditions/extra] Antes de invocar /fremi-reverse-extra:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo "   Ver: ~/.fremi/framework/rules/workflow.md → R14 (trabajo fuera del flujo)"
  echo ""
fi

exit 0
