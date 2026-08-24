#!/usr/bin/env bash
# ============================================================================
# Hook: check-conditional-docs — STORY-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "**/user-stories/*/FW-*.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: story — sólo aplica a docs condicionales de la cadena workflow.
#
# Regla aplicada:
#   Regla 16 (docs condicionales) →
#     ~/.fremi/framework/artifacts/story/rules/conditional-docs.md
#
# Fuente de verdad del criterio de obligatoriedad:
#   config.user.yaml → conditional_rules
#     runtime del proyecto: .fremi/settings/story/config.user.yaml
#     framework template:   ~/.fremi/framework/artifacts/story/config.user.yaml
#
# Convención de identificadores:
#   Resuelve filenames desde methodology.core.yaml — NO hardcodea FW-XX.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Cuando se crea un doc condicional (`explore` o `proposal`), recordar que
#   la creación implica que se evaluó al menos un criterio de
#   `obligatory_if_any` en config.user.yaml. Si el usuario está creando el
#   doc "por completitud" sin necesidad real → anti-patrón (Regla 16).
#
# Salida:
#   stdout → recordatorio para revisar los criterios.
#   exit 0 → siempre.
# ============================================================================

set -uo pipefail

# Cargar helper que resuelve filenames desde methodology.core.yaml
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_workflow-filenames.sh
source "$SCRIPT_DIR/_workflow-filenames.sh"
wf_load_story_filenames
[[ "$WF_LOAD_OK" != "1" ]] && exit 0

# Los dos docs condicionales del workflow story
EXPLORE_FILENAME="$(wf_filename explore)"
PROPOSAL_FILENAME="$(wf_filename proposal)"
[[ -z "$EXPLORE_FILENAME" || -z "$PROPOSAL_FILENAME" ]] && exit 0

# Leer payload
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

FW_FILE=$(basename "$FILE_PATH")

# Detectar cuál condicional se está creando (por filename real desde methodology)
COND_NAME=""
COND_REF=""
if [[ "$FW_FILE" == "$EXPLORE_FILENAME" ]]; then
  COND_NAME="explore"
  COND_REF="explore_when"
elif [[ "$FW_FILE" == "$PROPOSAL_FILENAME" ]]; then
  COND_NAME="proposal"
  COND_REF="proposal_when"
else
  exit 0
fi

# Verificar que estamos dentro de una story
[[ "$FILE_PATH" != *"/user-stories/"* ]] && exit 0

# Resolver path del config.user.yaml — preferir el del proyecto, fallback al framework
PROJECT_CONFIG=".fremi/settings/story/config.user.yaml"
FRAMEWORK_CONFIG="$HOME/.fremi/framework/artifacts/story/config.user.yaml"

CONFIG_FILE=""
if [[ -f "$PROJECT_CONFIG" ]]; then
  CONFIG_FILE="$PROJECT_CONFIG"
elif [[ -f "$FRAMEWORK_CONFIG" ]]; then
  CONFIG_FILE="$FRAMEWORK_CONFIG"
fi

cat <<EOF

⚠️  [check-conditional-docs] Estás creando $FW_FILE (step \`$COND_NAME\`).

Regla 16: este doc es CONDICIONAL — sólo se crea si aplica al menos UN criterio
de conditional_rules.$COND_REF.obligatory_if_any en:
  $CONFIG_FILE

Antes de continuar, confirmá que aplica al menos uno de los criterios. Si no
aplica, NO crees el archivo — un doc ausente es señal legítima de "no aplica"
(anti-patrón: crear por completitud).

Regla 16 completa: ~/.fremi/framework/artifacts/story/rules/conditional-docs.md
EOF

exit 0
