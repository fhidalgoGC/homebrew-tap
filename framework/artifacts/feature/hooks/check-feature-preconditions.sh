#!/usr/bin/env bash
# ============================================================================
# Hook: check-feature-preconditions — FEATURE-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "docs/works/features/*/definition.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: feature — aplica cuando se crea `definition.md` de una feature.
#
# Reglas aplicadas:
#   Regla 1 (no salta etapas) → ~/.fremi/framework/rules/hierarchy.md
#   Regla 17 (versionado + ancestor.version_at_creation) → ~/.fremi/framework/rules/versioning.md
#
# Convención de identificadores:
#   Feature filenames son fijos (`definition.md`, `decisions.md`) — no dependen
#   de methodology para nombres. Pero el prefijo de la carpeta (`FT-` default)
#   y sus scopes vienen de methodology.core.yaml. Ver:
#   .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Antes de crear el `definition.md` de una feature, verificar que la capa
#   PRODUCT está lista:
#     1. `docs/works/product/definition.md` existe con contenido.
#     2. `docs/works/product/plan.md` existe con contenido (necesario para
#        capturar `ancestor.version_at_creation` — Regla 17).
#
#   Sin capa producto, no se puede crear una feature (Regla 1).
#
# Salida:
#   stdout    → mensaje con qué falta.
#   exit 0    → OK o warning no bloqueante.
#   exit 2    → (comentado) — bloquear la creación.
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica al `definition.md` de una feature (no product/definition ni story/definition)
[[ "$FILE_PATH" != *"/docs/works/features/"*"/definition.md" ]] && exit 0
# Excluir stories anidadas
[[ "$FILE_PATH" == *"/user-stories/"* ]] && exit 0

# Verificar capa producto
PRODUCT_DEFINITION="docs/works/product/definition.md"
PRODUCT_PLAN="docs/works/product/plan.md"

missing=()

if [[ ! -f "$PRODUCT_DEFINITION" ]]; then
  missing+=("$PRODUCT_DEFINITION (no existe)")
elif [[ $(wc -c <"$PRODUCT_DEFINITION") -lt 100 ]]; then
  missing+=("$PRODUCT_DEFINITION (< 100 bytes — capacidades no declaradas)")
fi

if [[ ! -f "$PRODUCT_PLAN" ]]; then
  missing+=("$PRODUCT_PLAN (no existe — necesario para ancestor.version_at_creation)")
elif [[ $(wc -c <"$PRODUCT_PLAN") -lt 50 ]]; then
  missing+=("$PRODUCT_PLAN (< 50 bytes — sin frontmatter usable)")
fi

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-feature-preconditions] Intentando crear una feature pero la capa PRODUCT no está lista (Regla 1):"
  for m in "${missing[@]}"; do
    echo "   - $m"
  done
  echo "   Regla 1: no se salta etapas. Sin producto, no hay feature."
  echo "   Regla 17: sin producto/plan.md con frontmatter, no se puede capturar ancestor.version_at_creation."
  echo "   Ver: ~/.fremi/framework/rules/hierarchy.md"
  # exit 2   # descomentar para BLOQUEAR
fi

exit 0
