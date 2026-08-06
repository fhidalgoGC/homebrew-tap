#!/usr/bin/env bash
# ============================================================================
# Hook: check-changelog-entry
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write", "file_path": "docs/works/**/*.md" }
#
# Propósito (Regla 17):
#   Cuando se edita un doc LIVING, verificar que hay entry nueva en la sección
#   `## Changelog` correspondiente a la versión actual. Formato esperado:
#     - **v<version>** — <YYYY-MM-DD> — <descripción>. [origen: <artifact>]
#
# Salida:
#   stdout    → mensaje si no hay entry con la version actual.
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

# Doc type
DOC_TYPE=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null | grep -E "^doc_type:" | head -1 | awk '{print $2}' | tr -d '"' || true)
CUR_VERSION=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null | grep -E "^version:" | head -1 | awk '{print $2}' | tr -d '"' || true)

if [[ "$DOC_TYPE" != "living" ]]; then
  exit 0
fi

if [[ -z "$CUR_VERSION" ]]; then
  exit 0
fi

# ¿Tiene sección ## Changelog?
if ! grep -qE "^##[[:space:]]+Changelog" "$FILE_PATH"; then
  echo "⚠️  [check-changelog-entry] $FILE_PATH — doc living sin sección '## Changelog' al pie (Regla 17)."
  exit 0
fi

# ¿La versión actual está referenciada en el changelog?
# Busca patrón: - **v<version>** o - **<version>**
if ! grep -qE "^-[[:space:]]+\*\*v?${CUR_VERSION}\*\*" "$FILE_PATH"; then
  echo "⚠️  [check-changelog-entry] $FILE_PATH — no encuentro entry para v${CUR_VERSION} en ## Changelog (Regla 17)."
  echo "   Agregá:  - **v${CUR_VERSION}** — $(date +%Y-%m-%d) — <descripción>. [origen: <artifact>]"
fi

exit 0
