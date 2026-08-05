#!/usr/bin/env bash
# ============================================================================
# Hook: check-frontmatter
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write", "file_path": "docs/works/**/*.md" }
#
# Propósito:
#   Verifica que todo doc del framework editado/creado tiene frontmatter YAML
#   con los campos obligatorios (Regla 17):
#     - version
#     - created
#     - last_updated
#     - doc_type   (living | snapshot)
#     - ancestor.*  (cuando aplique — no para raíces como product/iniciativas.md)
#
# Salida:
#   stdout    → mensaje informativo si detecta issue.
#   exit 0    → OK o no aplicable (siempre exit 0; NO bloquea).
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

if ! command -v jq >/dev/null 2>&1; then
  # sin jq no podemos parsear el payload — salir silencioso
  exit 0
fi

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)

# Sólo aplica a archivos .md dentro de docs/works/
if [[ -z "$FILE_PATH" ]]; then exit 0; fi
if [[ "$FILE_PATH" != *"docs/works/"*".md" ]]; then exit 0; fi
if [[ ! -f "$FILE_PATH" ]]; then exit 0; fi

# --- Extraer frontmatter YAML (entre --- ... ---) ----------------------------
FRONTMATTER=$(awk '/^---$/{c++; if(c==1){next} if(c==2){exit}} c==1' "$FILE_PATH" 2>/dev/null || true)

# Si no hay frontmatter, avisar (Regla 17)
if [[ -z "$FRONTMATTER" ]]; then
  echo "⚠️  [check-frontmatter] $FILE_PATH — falta frontmatter YAML (Regla 17)."
  echo "   Los docs del framework deben abrir con:"
  echo "   ---"
  echo "   version: 0.1.0"
  echo "   created: YYYY-MM-DD"
  echo "   last_updated: YYYY-MM-DD"
  echo "   doc_type: living|snapshot"
  echo "   ---"
  exit 0
fi

# --- Verificar campos obligatorios ------------------------------------------
missing=()
for field in version created last_updated doc_type; do
  if ! echo "$FRONTMATTER" | grep -qE "^${field}:"; then
    missing+=("$field")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-frontmatter] $FILE_PATH — faltan campos en frontmatter: ${missing[*]}"
  echo "   Ver Regla 17 en docs/frmwk/rules/workflow.md."
fi

# --- Verificar ancestor.* si el doc no es raíz de producto ------------------
# Raíces (no requieren ancestor.id != product): product/iniciativas.md
if [[ "$FILE_PATH" != *"product/iniciativas.md" ]]; then
  if ! echo "$FRONTMATTER" | grep -qE "^ancestor:"; then
    echo "⚠️  [check-frontmatter] $FILE_PATH — falta bloque `ancestor:` en frontmatter (docs no-raíz deben declarar padre)."
  fi
fi

exit 0
