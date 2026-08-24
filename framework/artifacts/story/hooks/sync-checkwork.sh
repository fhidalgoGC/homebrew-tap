#!/usr/bin/env bash
# ============================================================================
# Hook: sync-checkwork — STORY-DOMAIN
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write",
#                       "file_path": "**/user-stories/*/FW-*.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: story — este hook aplica sólo cuando se edita el doc `plan` de
#                 una story. El doc `checkwork` es living y exclusivo de story.
#
# Regla aplicada:
#   Regla 13 (checkwork al día) →
#     ~/.fremi/framework/artifacts/story/rules/checkwork.md
#
# Convención de identificadores:
#   Resuelve filenames desde methodology.core.yaml — NO hardcodea FW-XX.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Recordatorio cuando se edita el doc `plan` de una story — sugiere
#   actualizar el `checkwork` hermano de la misma story (Regla 13).
#
# Salidas:
#   stdout    → mensaje recordatorio (la IA lo lee como contexto).
#   exit 0    → siempre (avisa, no bloquea).
# ============================================================================

set -uo pipefail

# Cargar helper que resuelve filenames desde methodology.core.yaml
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_workflow-filenames.sh
source "$SCRIPT_DIR/_workflow-filenames.sh"
wf_load_story_filenames
[[ "$WF_LOAD_OK" != "1" ]] && exit 0

PLAN_FILENAME="$(wf_filename plan)"
CHECKWORK_FILENAME="$(wf_filename checkwork)"
[[ -z "$PLAN_FILENAME" || -z "$CHECKWORK_FILENAME" ]] && exit 0

# Leer payload del hook
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

FILE_PATH=""
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
fi
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo nos interesa si tocó el doc `plan` de una story
[[ "$FILE_PATH" != *"/$PLAN_FILENAME" ]] && exit 0

# Calcular path del hermano `checkwork`
STORY_DIR=$(dirname "$FILE_PATH")
CHECKWORK="$STORY_DIR/$CHECKWORK_FILENAME"

if [[ -f "$CHECKWORK" ]]; then
  cat <<EOF

[sync-checkwork] Acabás de editar:
  $FILE_PATH

⚠️ Recordatorio Regla 13 — Si cerraste o arrancaste una task, actualizá también:
  $CHECKWORK

Pasos típicos en checkwork:
  - Mover task de '⬜ Pendiente' a '✅ Listo' (con fecha de cierre) o a '🚧 En curso'.
  - Actualizar el % progreso.
  - Marcar el archivo/test agregado en sus secciones.
  - Actualizar la línea 'Última actualización: ...' arriba del documento.

EOF
else
  cat <<EOF

[sync-checkwork] Acabás de editar:
  $FILE_PATH

⚠️ Esta story NO tiene doc \`checkwork\`. Según Regla 13 debería existir.
Crear:
  $CHECKWORK
con el template del skill /fremi-story-checkwork.

EOF
fi

exit 0

# -----------------------------------------------------------------------------
# FUTURO (auto-sync, no implementado):
#
# Para auto-actualizar checkwork sin pedirle a la IA que lo haga:
#   1. Parsear el doc plan y extraer las tasks con su estado (- [x] task-XXX — title).
#   2. Parsear el doc checkwork y extraer las tasks en cada sección (✅ / 🚧 / ⬜).
#   3. Detectar tasks cuyo estado cambió en el plan (ej: [ ] → [x]).
#   4. Reescribir las secciones de checkwork moviendo las tasks correspondientes.
#   5. Actualizar el % progreso (count(✅) / count(total)).
#   6. Actualizar la línea "Última actualización".
#
# Riesgos:
#   - Auto-edición de un archivo que también edita la IA → race conditions, corrupción.
#   - Pérdida de información cualitativa (notas, contexto) escrita en checkwork si la
#     regex no es estricta con la estructura.
#
# Por eso este hook arranca como RECORDATORIO, no como SYNC. La IA actualiza
# checkwork conscientemente.
# -----------------------------------------------------------------------------
