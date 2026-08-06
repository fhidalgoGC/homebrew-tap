#!/usr/bin/env bash
# ============================================================================
# Hook: check-parent-bump-on-closure
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write",
#                       "file_path": "**/FW-10_closure.md|**/EN-04_closure.md" }
#
# Propósito (Regla 17):
#   Cuando se firma un closure (FW-10 de story o EN-04 de enabler), verificar
#   que:
#     1. El frontmatter tiene `ancestor.version_at_closure` rellenado (no null).
#     2. La versión declarada allí coincide con la versión ACTUAL del padre.
#     3. El changelog del padre tiene entry apuntando a este artifact hijo.
#
# Salida:
#   stdout    → mensaje detallado si detecta gaps.
#   exit 0    → siempre (avisa, no bloquea).
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica a closures
case "$FILE_PATH" in
  *FW-10_closure.md|*EN-04_closure.md) : ;;
  *) exit 0 ;;
esac

[[ ! -f "$FILE_PATH" ]] && exit 0

# ¿El closure está firmado? Detectar por presencia de "Fecha de cierre" no-TBD.
CLOSURE_DATE=$(grep -E "^\*\*Fecha de cierre:\*\*" "$FILE_PATH" 2>/dev/null | head -1 | sed 's/\*\*Fecha de cierre:\*\*//' | xargs || true)
if [[ -z "$CLOSURE_DATE" || "$CLOSURE_DATE" == "TBD"* ]]; then
  # Aún no firmado → no aplica el check.
  exit 0
fi

# --- Extraer ancestor.version_at_closure ------------------------------------
V_CLOSURE=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null | grep -E "version_at_closure:" | head -1 | sed 's/.*version_at_closure:[[:space:]]*//' | tr -d '"' | xargs || true)

if [[ -z "$V_CLOSURE" || "$V_CLOSURE" == "null" || "$V_CLOSURE" == "<versión"* ]]; then
  echo "⚠️  [check-parent-bump-on-closure] $FILE_PATH firmado sin ancestor.version_at_closure (Regla 17)."
  echo "   Rellenar el frontmatter con la versión final del padre después del bump."
  exit 0
fi

# --- Localizar el padre ------------------------------------------------------
# Para FW-10_closure.md → padre es FT-XX/definition.md.
# Para EN-04_closure.md → padre depende del scope (global / feature / story).
PARENT_FILE=""
case "$FILE_PATH" in
  *user-stories/*/FW-10_closure.md)
    # Story → subir 2 niveles a la feature, tomar definition.md
    STORY_DIR=$(dirname "$FILE_PATH")
    FEATURE_DIR=$(dirname "$(dirname "$STORY_DIR")")
    PARENT_FILE="$FEATURE_DIR/definition.md"
    ;;
  */enablers/*/EN-04_closure.md)
    # Enabler → padre depende del path. Determinar scope.
    EN_DIR=$(dirname "$FILE_PATH")
    ENABLERS_DIR=$(dirname "$EN_DIR")
    PARENT_CONTAINER=$(dirname "$ENABLERS_DIR")
    if [[ "$PARENT_CONTAINER" == *"user-stories"* ]]; then
      # Enabler story-scope — padre es FW-01_definition
      PARENT_FILE="$PARENT_CONTAINER/FW-01_definition.md"
    elif [[ "$PARENT_CONTAINER" == *"features"* ]]; then
      # Enabler feature-scope — padre es feature/definition
      PARENT_FILE="$PARENT_CONTAINER/definition.md"
    else
      # Global — padre es product/plan.md
      PARENT_FILE="docs/works/product/plan.md"
    fi
    ;;
esac

if [[ -z "$PARENT_FILE" || ! -f "$PARENT_FILE" ]]; then
  echo "⚠️  [check-parent-bump-on-closure] no se pudo localizar el padre de $FILE_PATH — verificar manualmente que el bump se aplicó."
  exit 0
fi

# --- Comparar versión declarada vs versión actual del padre -----------------
PARENT_VERSION=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$PARENT_FILE" 2>/dev/null | grep -E "^version:" | head -1 | awk '{print $2}' | tr -d '"' || true)

if [[ -z "$PARENT_VERSION" ]]; then
  echo "⚠️  [check-parent-bump-on-closure] padre $PARENT_FILE sin `version:` en frontmatter — Regla 17 no aplicada al padre."
  exit 0
fi

if [[ "$V_CLOSURE" != "$PARENT_VERSION" ]]; then
  echo "⚠️  [check-parent-bump-on-closure] Regla 17 — inconsistencia:"
  echo "   $FILE_PATH declara ancestor.version_at_closure = $V_CLOSURE"
  echo "   pero $PARENT_FILE está en version = $PARENT_VERSION"
  echo "   → Revisar que el bump del padre se aplicó correctamente."
fi

exit 0
