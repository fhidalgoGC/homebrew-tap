#!/usr/bin/env bash
# ============================================================================
# Hook: check-pipeline-preconditions — PIPELINE-REVERSE-PRODUCT DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-pipeline-reverse-product".
# Verifica precondiciones ANTES de que el pipeline arranque.
#
# Reglas:
#   R24 (framework install)  → ~/.fremi/framework/rules/framework-mechanics.md
#   R25 (trabajo en prod.)   → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#   R30 (git history needed) → ~/.fremi/framework/reverse-engineering/rules/reverse.md
#
# Convención de identificadores:
#   Este hook NO hardcodea prefijos ni nombres de archivos del workflow.
#   reverse-product opera sobre docs de la capa raíz — no tiene upper-layer
#   cuya presencia verificar. Pausa sólo si no hay features identificables.
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

# Detectar invocación del pipeline reverse-product
[[ "$PROMPT" != *"/fremi-pipeline-reverse-product"* ]] && exit 0

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
  problems+=("No hay .git/ — reverse necesita git history para inferir timestamps (Regla 30). Considerá correr con --from-git-history desactivado y confidence: 0.3.")
fi

# --------------------------------------------------------------------------
# Upper-layer preconditions para pipeline-reverse-product:
#   Ninguna — product es la capa raíz del framework.
#   Sí verificamos que haya materia prima para reconstruir (al menos 1 feature
#   identificable). Sin features no hay base para inferir producto (R25).
# --------------------------------------------------------------------------
if [[ -d "docs/works/features" ]]; then
  feature_count=$(find docs/works/features -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$feature_count" -eq 0 ]]; then
    problems+=("No se encontraron features en docs/works/features/ — reverse-product necesita al menos 1 feature como materia prima (R25). Corré primero /fremi-pipeline-reverse-feature para una feature existente.")
  fi
else
  problems+=("Carpeta docs/works/features/ no existe — reverse-product no tiene materia prima para reconstruir el producto. Verificá que el proyecto tenga features identificables.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [pipeline-reverse-preconditions/product] Antes de invocar /fremi-pipeline-reverse-product:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/reverse-engineering/rules/reverse.md → R25, R30"
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo ""
fi

exit 0
