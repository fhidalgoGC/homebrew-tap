#!/usr/bin/env bash
# Hook: sync-checkwork
# Tipo: PostToolUse (recomendado wirear con matcher para Edit/Write sobre FW-08_plan.md)
# Propósito: Recordatorio cuando se edita un FW-08_plan.md — sugiere actualizar el FW-09_checkwork.md hermano.
#
# STATUS: **STUB / DETECCIÓN MANUAL** — no modifica archivos. Sólo detecta el cambio y
# emite un mensaje recordando la Regla 13. La auto-sincronización (parsear el plan,
# detectar tasks que pasaron de [ ] o [/] a [x] y actualizar el checkwork) es un
# segundo paso opcional documentado al final del script — no implementado todavía.
#
# Salidas:
#   stdout    → mensaje recordatorio (la IA lo lee como contexto).
#   exit 0    → siempre (avisa, no bloquea).

set -uo pipefail

# Leer payload del hook (PostToolUse típicamente envía JSON con tool_input por stdin)
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

# Detectar si la herramienta editó/escribió un FW-08_plan.md
FILE_PATH=""
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
fi

# Sin payload o sin file_path → no aplicar
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Sólo nos interesa si tocó un FW-08_plan.md
if [[ "$FILE_PATH" != *"/FW-08_plan.md" ]]; then
  exit 0
fi

# Calcular path del hermano FW-09_checkwork.md
STORY_DIR=$(dirname "$FILE_PATH")
CHECKWORK="$STORY_DIR/FW-09_checkwork.md"

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

⚠️ Esta story NO tiene FW-09_checkwork.md. Según Regla 13 debería existir.
Crear:
  $CHECKWORK
con el template de docs/frmwk/flows/workflow.md § "Estado en vivo — FW-09_checkwork.md".

EOF
fi

exit 0

# -----------------------------------------------------------------------------
# FUTURO (auto-sync, no implementado):
#
# Para auto-actualizar checkwork sin pedirle a la IA que lo haga:
#   1. Parsear FW-08_plan.md y extraer las tasks con su estado (- [x] task-XXX — title).
#   2. Parsear FW-09_checkwork.md y extraer las tasks en cada sección (✅ / 🚧 / ⬜).
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
# checkwork conscientemente. Si en el futuro probamos el auto-sync, mover este
# bloque arriba y mantenerlo opt-in via env var (ej: SYNC_CHECKWORK_AUTO=1).
