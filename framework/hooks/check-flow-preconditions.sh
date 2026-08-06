#!/usr/bin/env bash
# ============================================================================
# Hook: check-flow-preconditions
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "**/user-stories/*/FW-*.md" }
#
# Propósito (Regla 1 + config.story.yaml → flow.sequence):
#   Antes de crear un doc FW-XX de story, verificar que los docs previos
#   OBLIGATORIOS de la cadena ya existen y tienen contenido.
#
# Ej: si se intenta crear FW-05_sdd-spec.md, verifica que existen (con
# contenido) FW-01_definition.md, FW-03_scope.md y FW-04_bdd-userstories.md.
# FW-00 y FW-02 son condicionales — si no existen, no bloquea.
#
# Salida:
#   stdout    → mensaje con qué falta.
#   exit 0    → OK.
#   exit 2    → (comentado) — bloquear la creación. Por default sólo avisa.
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica a FW-XX_*.md de story
if [[ "$FILE_PATH" != *"/user-stories/"*"/FW-"*".md" ]]; then
  exit 0
fi

STORY_DIR=$(dirname "$FILE_PATH")
FW_FILE=$(basename "$FILE_PATH")

# Extraer número FW-XX
FW_NUM=$(echo "$FW_FILE" | grep -oE "^FW-[0-9]+" | grep -oE "[0-9]+" || true)
[[ -z "$FW_NUM" ]] && exit 0
FW_NUM=$((10#$FW_NUM))  # normalizar a decimal

# Orden canónico de la cadena de story (según config.story.yaml)
# 0: explore (condicional)
# 1: definition
# 2: proposal (condicional)
# 3: scope
# 4: bdd-userstories
# 5: sdd-spec
# 6: design
# 7: tdd-plan
# 8: plan
# 9: checkwork
# 10: closure

# Docs OBLIGATORIOS previos (excluye 0 y 2 que son condicionales)
declare -A REQUIRED_PREV
REQUIRED_PREV[3]="FW-01_definition.md"
REQUIRED_PREV[4]="FW-01_definition.md FW-03_scope.md"
REQUIRED_PREV[5]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md"
REQUIRED_PREV[6]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md FW-05_sdd-spec.md"
REQUIRED_PREV[7]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md FW-05_sdd-spec.md FW-06_design.md"
REQUIRED_PREV[8]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md FW-05_sdd-spec.md FW-06_design.md FW-07_tdd-plan.md"
REQUIRED_PREV[9]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md FW-05_sdd-spec.md FW-06_design.md FW-07_tdd-plan.md FW-08_plan.md"
REQUIRED_PREV[10]="FW-01_definition.md FW-03_scope.md FW-04_bdd-userstories.md FW-05_sdd-spec.md FW-06_design.md FW-07_tdd-plan.md FW-08_plan.md FW-09_checkwork.md"

REQ="${REQUIRED_PREV[$FW_NUM]:-}"
[[ -z "$REQ" ]] && exit 0  # FW-00, FW-01, FW-02 → sin precondiciones duras

# --- Verificar cada previo obligatorio --------------------------------------
missing=()
for prev in $REQ; do
  if [[ ! -f "$STORY_DIR/$prev" ]]; then
    missing+=("$prev (no existe)")
  elif [[ $(wc -c <"$STORY_DIR/$prev") -lt 100 ]]; then
    missing+=("$prev (< 100 bytes — probablemente esqueleto vacío)")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-flow-preconditions] Intentando crear/editar $FW_FILE pero faltan docs previos obligatorios (Regla 1):"
  for m in "${missing[@]}"; do
    echo "   - $m"
  done
  echo "   Completá los docs previos antes de avanzar."
  # exit 2   # descomentar para BLOQUEAR (por default sólo avisa)
fi

exit 0
