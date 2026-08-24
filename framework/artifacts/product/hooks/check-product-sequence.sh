#!/usr/bin/env bash
# ============================================================================
# Hook: check-product-sequence — PRODUCT-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "docs/works/product/*.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: product — este hook aplica sólo cuando se crea/edita un doc del
#                    workflow product (7 docs: iniciativas → ... → plan).
#
# Fuente de verdad de la secuencia:
#   ~/.fremi/framework/settings/methodology.core.yaml
#     → layers.product.stages_order[].files[]
#
# Reglas aplicadas:
#   Regla 1 (no salta etapas) → ~/.fremi/framework/rules/hierarchy.md
#   Regla 4 (discovery antes de formalización) →
#     ~/.fremi/framework/artifacts/product/rules/discovery.md
#
# Convención de identificadores:
#   Resuelve filenames desde methodology.core.yaml — NO hardcodea.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Antes de crear un doc del workflow product, verificar que los docs previos
#   OBLIGATORIOS de la cadena ya existen y tienen contenido.
#
#   Ej: si se intenta crear `definition.md`, verifica que existan
#       `iniciativas.md`, `ideas.md`, `planteamiento.md` (Regla 4).
#
# Salida:
#   stdout    → mensaje con qué falta.
#   exit 0    → OK o warning no bloqueante.
#   exit 2    → (comentado) — bloquear la creación.
# ============================================================================

set -uo pipefail

# Cargar helper cross-domain de methodology (framework/hooks/_methodology.sh)
METH_HELPER="$HOME/.fremi/framework/hooks/_methodology.sh"
[[ ! -f "$METH_HELPER" ]] && exit 0
# shellcheck source=../../../hooks/_methodology.sh
source "$METH_HELPER"

# Cargar la lista ordenada de docs del product
meth_load_layer product
[[ "$METH_LOAD_OK" != "1" ]] && exit 0

# Leer payload
PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica si está dentro de docs/works/product/
[[ "$FILE_PATH" != *"/docs/works/product/"* ]] && exit 0

TARGET_FILE=$(basename "$FILE_PATH")
PRODUCT_DIR=$(dirname "$FILE_PATH")

# Encontrar la posición del archivo objetivo en la lista de methodology
TARGET_ORDER=-1
i=0
for f in "${METH_LAYER_FILES[@]}"; do
  if [[ "$f" == "$TARGET_FILE" ]]; then
    TARGET_ORDER=$i
    break
  fi
  i=$((i+1))
done

# Si el archivo NO es un doc conocido del workflow product → nada que verificar
[[ $TARGET_ORDER -lt 0 ]] && exit 0

# El primer doc (order 0, `iniciativas`) no tiene precondiciones
[[ $TARGET_ORDER -eq 0 ]] && exit 0

# Verificar que todos los docs previos existen con contenido
missing=()
i=0
while (( i < TARGET_ORDER )); do
  prev_file="${METH_LAYER_FILES[$i]}"
  if [[ ! -f "$PRODUCT_DIR/$prev_file" ]]; then
    missing+=("$prev_file (no existe)")
  elif [[ $(wc -c <"$PRODUCT_DIR/$prev_file") -lt 100 ]]; then
    missing+=("$prev_file (< 100 bytes — probablemente esqueleto vacío)")
  fi
  i=$((i+1))
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-product-sequence] Intentando crear/editar $TARGET_FILE pero faltan docs previos del workflow product (Regla 1 + R4):"
  for m in "${missing[@]}"; do
    echo "   - $m"
  done
  echo "   Regla 4: discovery (iniciativas → ideas → planteamiento) debe completarse ANTES de formalización (definition → strategies → decisions → plan)."
  echo "   Ver: ~/.fremi/framework/artifacts/product/rules/discovery.md"
  echo "   Fuente de la cadena: ~/.fremi/framework/settings/methodology.core.yaml → layers.product"
  # exit 2   # descomentar para BLOQUEAR
fi

exit 0
