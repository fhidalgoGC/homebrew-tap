#!/usr/bin/env bash
# ============================================================================
# Hook: check-ancestor-coherence
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write", "file_path": "docs/works/**/*.md" }
#
# Propósito (Regla 17):
#   Verifica que `ancestor.version_at_creation` de un doc apunta a una versión
#   que EXISTE (o existió) en el padre. Es una guardia contra frontmatters
#   inventados o inconsistentes.
#
# Estrategia:
#   1. Extraer ancestor.id y ancestor.version_at_creation del doc actual.
#   2. Localizar el archivo del padre según la relación estructural del path.
#   3. Verificar que version_at_creation aparece en el changelog del padre
#      (para docs living: el changelog es histórico; para snapshots: verificar
#      contra la versión actual del padre — el snapshot no puede referenciar
#      una versión futura).
#
# Salida:
#   stdout    → mensaje si hay incoherencia.
#   exit 0    → siempre.
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0
[[ "$FILE_PATH" != *"docs/works/"*".md" ]] && exit 0
[[ ! -f "$FILE_PATH" ]] && exit 0

# --- Extraer ancestor del frontmatter ---------------------------------------
FRONTMATTER=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null || true)
A_ID=$(echo "$FRONTMATTER" | grep -A5 "^ancestor:" | grep "id:" | head -1 | sed 's/.*id:[[:space:]]*//' | tr -d '"' | xargs || true)
V_CREATION=$(echo "$FRONTMATTER" | grep -A5 "^ancestor:" | grep "version_at_creation:" | head -1 | sed 's/.*version_at_creation:[[:space:]]*//' | tr -d '"' | xargs || true)

[[ -z "$A_ID" || "$A_ID" == "product" && "$V_CREATION" == "null" ]] && exit 0
[[ -z "$V_CREATION" || "$V_CREATION" == "null" || "$V_CREATION" == "<"* ]] && exit 0

# --- Localizar archivo del padre según ancestor.id --------------------------
PARENT_FILE=""
case "$A_ID" in
  product)
    # Raíces de producto no tienen padre real
    exit 0
    ;;
  FT-*)
    # Buscar la feature en docs/works/features/
    PARENT_FILE=$(find docs/works/features -maxdepth 2 -name "definition.md" -path "*${A_ID}*" 2>/dev/null | head -1)
    ;;
  HU-*)
    # Buscar la story — necesitamos el ID compuesto (padre = FT-XX/HU-YY)
    # Usar el path del archivo actual para inferir la feature
    if [[ "$FILE_PATH" == *"user-stories/"* ]]; then
      STORY_DIR=$(dirname "$FILE_PATH")
      # Si estamos dentro de la story misma, definition es en el mismo dir
      if [[ "$(basename "$STORY_DIR")" == "$A_ID"* ]]; then
        PARENT_FILE="$STORY_DIR/FW-01_definition.md"
      fi
    fi
    ;;
esac

if [[ -z "$PARENT_FILE" || ! -f "$PARENT_FILE" ]]; then
  echo "⚠️  [check-ancestor-coherence] $FILE_PATH declara ancestor.id=$A_ID pero no se encuentra el padre."
  exit 0
fi

# --- Verificar que la versión existe en el padre ----------------------------
PARENT_VERSION=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$PARENT_FILE" 2>/dev/null | grep -E "^version:" | head -1 | awk '{print $2}' | tr -d '"' || true)

# Buscar V_CREATION en changelog del padre (para living)
FOUND_IN_CHANGELOG=""
if grep -qE "^##[[:space:]]+Changelog" "$PARENT_FILE"; then
  if grep -qE "^-[[:space:]]+\*\*v?${V_CREATION}\*\*" "$PARENT_FILE"; then
    FOUND_IN_CHANGELOG="yes"
  fi
fi

# Si la versión no aparece en changelog Y es mayor a la versión actual → futuro impossible
if [[ "$FOUND_IN_CHANGELOG" != "yes" ]] && [[ "$V_CREATION" != "$PARENT_VERSION" ]]; then
  # Comparación semver simplificada: mayor si primera componente es mayor
  echo "⚠️  [check-ancestor-coherence] $FILE_PATH declara version_at_creation=$V_CREATION"
  echo "   pero $PARENT_FILE está en $PARENT_VERSION y esa versión no aparece en su ## Changelog."
  echo "   Verificá que la versión ancestral es real (Regla 17 — Tipo V-1)."
fi

exit 0
