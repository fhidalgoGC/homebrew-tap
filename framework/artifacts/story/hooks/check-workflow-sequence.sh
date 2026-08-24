#!/usr/bin/env bash
# ============================================================================
# Hook: check-workflow-sequence — STORY-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "**/user-stories/*/FW-*.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: story — este hook aplica sólo cuando se crea/edita un doc del
#                 workflow story (cadena de N docs definidos en methodology).
#
# Fuente de verdad de la secuencia:
#   ~/.fremi/framework/settings/methodology.core.yaml
#     → layers.story.files_in_order[] (orden canónico)
#     → layers.story.conditional_files[] (docs condicionales)
#
# Reglas aplicadas:
#   Regla 1 (no salta etapas) → ~/.fremi/framework/rules/hierarchy.md
#   Regla 16 (docs condicionales) →
#     ~/.fremi/framework/artifacts/story/rules/conditional-docs.md
#
# Convención de identificadores:
#   Resuelve filenames desde methodology.core.yaml — NO hardcodea FW-XX.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Antes de crear un doc del workflow story, verificar que los docs previos
#   OBLIGATORIOS (todos los `files_in_order` que NO estén en `conditional_files`)
#   ya existen y tienen contenido.
#
# Salida:
#   stdout    → mensaje con qué falta.
#   exit 0    → OK (o warning no bloqueante — default).
#   exit 2    → (comentado) — bloquear la creación.
# ============================================================================

set -uo pipefail

# Cargar helper que resuelve filenames desde methodology.core.yaml
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_workflow-filenames.sh
source "$SCRIPT_DIR/_workflow-filenames.sh"
wf_load_story_filenames
[[ "$WF_LOAD_OK" != "1" ]] && exit 0

# Leer payload
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica si está dentro de una story
[[ "$FILE_PATH" != *"/user-stories/"* ]] && exit 0

STORY_DIR=$(dirname "$FILE_PATH")
FW_FILE=$(basename "$FILE_PATH")

# Resolver el step_id del filename que se está creando
TARGET_STEP=$(wf_step_id_from_filename "$FW_FILE")
[[ -z "$TARGET_STEP" ]] && exit 0   # No es un doc del workflow story

TARGET_ORDER=$(wf_step_order "$TARGET_STEP")
[[ -z "$TARGET_ORDER" ]] && exit 0

# Cargar la lista de docs condicionales desde methodology.core.yaml
# Estos NO son precondición dura — si no existen, no bloquean.
METHODOLOGY="$HOME/.fremi/framework/settings/methodology.core.yaml"
CONDITIONAL_FILENAMES=$(awk '
  /^  story:/ { in_story=1; next }
  in_story && /^  [a-z]/ && !/^  story:/ { in_story=0 }
  in_story && /^    conditional_files:/ { in_list=1; next }
  in_list && /^    [a-z]/ && !/^    - / { in_list=0 }
  in_list && /^    - / { sub(/^    - /, ""); print; next }
' "$METHODOLOGY" 2>/dev/null)

is_conditional() {
  local candidate="$1"
  local cf
  while IFS= read -r cf; do
    [[ "$cf" == "$candidate" ]] && return 0
  done <<< "$CONDITIONAL_FILENAMES"
  return 1
}

# Construir lista de docs OBLIGATORIOS que deben existir con contenido
# (todos los steps con order < TARGET_ORDER, excepto los condicionales).
missing=()
i=0
while (( i < TARGET_ORDER )); do
  prev_filename="${WF_STORY_FILENAMES[$i]:-}"
  if [[ -z "$prev_filename" ]]; then
    i=$((i+1))
    continue
  fi

  # Saltear docs condicionales
  if is_conditional "$prev_filename"; then
    i=$((i+1))
    continue
  fi

  if [[ ! -f "$STORY_DIR/$prev_filename" ]]; then
    missing+=("$prev_filename (no existe)")
  elif [[ $(wc -c <"$STORY_DIR/$prev_filename") -lt 100 ]]; then
    missing+=("$prev_filename (< 100 bytes — probablemente esqueleto vacío)")
  fi
  i=$((i+1))
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-workflow-sequence] Intentando crear/editar $FW_FILE (step \`$TARGET_STEP\`) pero faltan docs previos obligatorios (Regla 1):"
  for m in "${missing[@]}"; do
    echo "   - $m"
  done
  echo "   Completá los docs previos antes de avanzar."
  echo "   Fuente: ~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order"
  # exit 2   # descomentar para BLOQUEAR (por default sólo avisa)
fi

exit 0
