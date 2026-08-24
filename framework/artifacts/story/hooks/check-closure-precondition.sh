#!/usr/bin/env bash
# ============================================================================
# Hook: check-closure-precondition — STORY-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "**/user-stories/*/FW-*.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: story — sólo aplica al doc `closure` de una story.
#
# Reglas aplicadas:
#   Regla 11 (closure obligatorio) →
#     ~/.fremi/framework/artifacts/story/rules/closure.md
#   Regla 13 (checkwork al día) →
#     ~/.fremi/framework/artifacts/story/rules/checkwork.md
#
# Convención de identificadores:
#   Resuelve filenames desde methodology.core.yaml — NO hardcodea FW-XX.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Antes de firmar el `closure` de una story, verificar que:
#     1. El doc `checkwork` existe.
#     2. El doc `plan` no tiene tasks pendientes (`[ ]` ni `[/]`).
#   Si hay tasks abiertas → la story no puede cerrarse (Regla 11).
#
# Salida:
#   stdout → mensaje si hay tasks pendientes.
#   exit 0 → OK o warning no bloqueante.
#   exit 2 → (comentado) — bloquear el closure.
# ============================================================================

set -uo pipefail

# Cargar helper que resuelve filenames desde methodology.core.yaml
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_workflow-filenames.sh
source "$SCRIPT_DIR/_workflow-filenames.sh"
wf_load_story_filenames
[[ "$WF_LOAD_OK" != "1" ]] && exit 0

CLOSURE_FILENAME="$(wf_filename closure)"
CHECKWORK_FILENAME="$(wf_filename checkwork)"
PLAN_FILENAME="$(wf_filename plan)"
[[ -z "$CLOSURE_FILENAME" || -z "$CHECKWORK_FILENAME" || -z "$PLAN_FILENAME" ]] && exit 0

# Leer payload
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica al doc `closure` dentro de una story
[[ "$(basename "$FILE_PATH")" != "$CLOSURE_FILENAME" ]] && exit 0
[[ "$FILE_PATH" != *"/user-stories/"* ]] && exit 0

STORY_DIR=$(dirname "$FILE_PATH")
CHECKWORK="$STORY_DIR/$CHECKWORK_FILENAME"
PLAN="$STORY_DIR/$PLAN_FILENAME"

problems=()

# 1. Checkwork debe existir
if [[ ! -f "$CHECKWORK" ]]; then
  problems+=("$CHECKWORK_FILENAME no existe — la story no puede cerrar sin él (Regla 13).")
fi

# 2. Plan no debe tener tasks pendientes
if [[ -f "$PLAN" ]]; then
  PENDING=$(grep -cE "^[[:space:]]*-[[:space:]]*\[[[:space:]/]\]" "$PLAN" 2>/dev/null || echo 0)
  if [[ "$PENDING" -gt 0 ]]; then
    problems+=("$PLAN_FILENAME tiene $PENDING task(s) pendiente(s) o en curso (marcadas [ ] o [/]). Regla 11: no se cierra hasta 100%.")
  fi
else
  problems+=("$PLAN_FILENAME no existe — la story no puede cerrar sin él.")
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [check-closure-precondition] Intentando firmar $CLOSURE_FILENAME, pero:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo ""
  echo "   Regla 11: el checkwork debe estar al 100% ANTES del closure."
  echo "   Ver: ~/.fremi/framework/artifacts/story/rules/closure.md"
  # exit 2   # descomentar para BLOQUEAR
fi

exit 0
