#!/usr/bin/env bash
# ============================================================================
# Hook: check-version-bump
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write", "file_path": "docs/works/**/*.md" }
#
# Propósito (Regla 17):
#   Cuando se edita un doc LIVING, verificar que la versión (`version:` en
#   frontmatter) aumentó vs la versión previa en git HEAD. Los docs snapshot
#   normalmente no bumpean (quedan en 1.0.0); si cambia su version, avisar.
#
# Requisitos: repo git inicializado. Si no lo es, hook sale silencioso.
#
# Salida:
#   stdout    → mensaje si detecta versión NO bumpeada en un living.
#   exit 0    → siempre (avisa, no bloquea).
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0
command -v git >/dev/null 2>&1 || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0
[[ "$FILE_PATH" != *"docs/works/"*".md" ]] && exit 0
[[ ! -f "$FILE_PATH" ]] && exit 0

# Extraer doc_type del frontmatter actual
DOC_TYPE=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null | grep -E "^doc_type:" | head -1 | awk '{print $2}' | tr -d '"' || true)
CUR_VERSION=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$FILE_PATH" 2>/dev/null | grep -E "^version:" | head -1 | awk '{print $2}' | tr -d '"' || true)

# Sólo aplica a docs living (snapshot no debe bumpear normalmente)
if [[ "$DOC_TYPE" != "living" ]]; then
  exit 0
fi

# Versión anterior desde git HEAD
if ! git show HEAD:"$FILE_PATH" >/dev/null 2>&1; then
  # Archivo nuevo — no hay versión previa. OK.
  exit 0
fi

PREV_VERSION=$(git show HEAD:"$FILE_PATH" 2>/dev/null | awk '/^---$/{c++; if(c==2)exit} c==1' | grep -E "^version:" | head -1 | awk '{print $2}' | tr -d '"' || true)

if [[ -z "$PREV_VERSION" || -z "$CUR_VERSION" ]]; then
  exit 0
fi

if [[ "$PREV_VERSION" == "$CUR_VERSION" ]]; then
  # Verificar si el contenido cambió realmente (por si el edit fue no-material)
  if ! git diff --quiet HEAD "$FILE_PATH" 2>/dev/null; then
    echo "⚠️  [check-version-bump] $FILE_PATH — contenido cambió pero version sigue en $CUR_VERSION (living debe bumpear — Regla 17)."
    echo "   Actualizá version en frontmatter + agregá entry al ## Changelog."
  fi
fi

exit 0
