#!/usr/bin/env bash
# ============================================================================
# Hook: check-strict-tdd
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "src/**/*.ts" (o el path de código del proyecto) }
#
# Propósito (Regla 7):
#   Si `config.yaml → testing.strict_tdd: true`, verificar que cuando se
#   escribe código de producción, existe (o coincide con) un test archivo
#   asociado.
#
# Heurística simple:
#   - Para src/<X>.ts, verifica que existe test/<X>.test.ts (o co-locado).
#   - No verifica que el test esté rojo/verde — sólo que exista.
#
# Salida:
#   stdout    → mensaje si detecta código sin test asociado.
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

# Sólo aplica a archivos de código src/
[[ "$FILE_PATH" != *"src/"* ]] && exit 0
# Excluir tests (evita chequearse a sí mismo)
[[ "$FILE_PATH" == *".test."* || "$FILE_PATH" == *".spec."* || "$FILE_PATH" == *"/test/"* ]] && exit 0
# Excluir index/exports puros
[[ "$(basename "$FILE_PATH")" == "index.ts" ]] && exit 0

# --- Verificar strict_tdd está activo ----------------------------------------
CONFIG_FILE="~/.fremi/framework/settings/config.core.yaml"
[[ ! -f "$CONFIG_FILE" ]] && exit 0

STRICT_TDD=$(grep -E "^[[:space:]]+strict_tdd:" "$CONFIG_FILE" | head -1 | awk '{print $2}' || true)
if [[ "$STRICT_TDD" != "true" ]]; then
  exit 0
fi

# --- Buscar test asociado ---------------------------------------------------
BASE=$(basename "$FILE_PATH" | sed -E 's/\.(ts|tsx|js|jsx)$//')
DIR=$(dirname "$FILE_PATH")

# Patterns de búsqueda:
# 1. Co-locado: src/foo.ts → src/foo.test.ts
# 2. Sibling test folder: src/foo.ts → src/test/foo.test.ts
# 3. Global test tree: src/foo/bar.ts → test/foo/bar.test.ts

CANDIDATES=(
  "$DIR/${BASE}.test.ts"
  "$DIR/${BASE}.spec.ts"
  "$DIR/test/${BASE}.test.ts"
  "$DIR/test/unit-test/${BASE}.test.ts"
  "$DIR/__tests__/${BASE}.test.ts"
)

FOUND=""
for c in "${CANDIDATES[@]}"; do
  if [[ -f "$c" ]]; then
    FOUND="$c"
    break
  fi
done

# Búsqueda amplia si los patrones directos no matchean
if [[ -z "$FOUND" ]]; then
  FOUND=$(find src test 2>/dev/null -name "${BASE}.test.*" -o -name "${BASE}.spec.*" | head -1 || true)
fi

if [[ -z "$FOUND" ]]; then
  echo "⚠️  [check-strict-tdd] $FILE_PATH — Regla 7 (strict_tdd activo): no encuentro test asociado."
  echo "   Buscá o creá: $DIR/${BASE}.test.ts (test rojo primero → implementación después)."
fi

exit 0
