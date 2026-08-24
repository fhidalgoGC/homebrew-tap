#!/usr/bin/env bash
# ============================================================================
# Hook: audit-on-stop — CROSS-DOMAIN
# Tipo: Stop
# Matcher: n/a (Stop no usa matcher — se ejecuta al final de cada respuesta)
#
# ────────────────────────────────────────────────────────────────────────────
# Convención de identificadores:
#   Resuelve filenames por capa desde methodology.core.yaml — NO hardcodea.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Auditoría ligera al terminar una sesión de trabajo. Reporta:
#     1. Docs living sin changelog al pie.
#     2. Docs snapshot cerrados sin ancestor.version_at_closure.
#     3. Stories en implementación (doc `checkwork` con % < 100).
#     4. Warnings de Regla 17 fáciles de detectar.
#
#   NO corre `/sync-check` completo (eso es explícito). Sólo un chequeo
#   rápido para dar visibilidad.
#
# Salida:
#   stdout    → resumen breve si hay cosas que reportar.
#   exit 0    → siempre.
# ============================================================================

set -uo pipefail

# Cargar helper cross-domain de methodology
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_methodology.sh
source "$SCRIPT_DIR/_methodology.sh"

# --- Bail out si no hay estructura de works ---------------------------------
[[ ! -d "docs/works" ]] && exit 0

warnings=0
outputs=()

# Resolver dinámicamente los filenames de closure (story y enabler) y de
# checkwork (story). Si methodology no está disponible, saltamos las
# secciones que dependen de esos filenames.
STORY_CHECKWORK=""
STORY_CLOSURE=""
ENABLER_CLOSURE=""
if meth_load_layer story; then
  STORY_CHECKWORK=$(meth_layer_file_by_name checkwork || true)
  STORY_CLOSURE=$(meth_layer_file_by_name closure || true)
fi
if meth_load_layer enabler; then
  ENABLER_CLOSURE=$(meth_layer_file_by_name closure || true)
fi

# --- 1. Docs living sin changelog -------------------------------------------
while IFS= read -r f; do
  [[ ! -f "$f" ]] && continue
  DT=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$f" 2>/dev/null | grep -E "^doc_type:" | head -1 | awk '{print $2}' | tr -d '"')
  if [[ "$DT" == "living" ]] && ! grep -qE "^##[[:space:]]+Changelog" "$f" 2>/dev/null; then
    outputs+=("  - Living sin changelog: $f")
    warnings=$((warnings+1))
  fi
done < <(find docs/works -name "*.md" -type f 2>/dev/null | head -100)

# --- 2. Closures firmados sin version_at_closure ----------------------------
while IFS= read -r f; do
  [[ ! -f "$f" ]] && continue
  # Firmado si "Fecha de cierre" no es TBD
  CLOSED=$(grep -E "^\*\*Fecha de cierre:\*\*" "$f" 2>/dev/null | head -1 | grep -v "TBD" || true)
  [[ -z "$CLOSED" ]] && continue
  # ¿version_at_closure vacío/null?
  V=$(awk '/^---$/{c++; if(c==2)exit} c==1' "$f" 2>/dev/null | grep "version_at_closure:" | head -1 | sed 's/.*version_at_closure:[[:space:]]*//' | tr -d '"' | xargs)
  if [[ -z "$V" || "$V" == "null" || "$V" == "<"* ]]; then
    outputs+=("  - Closure firmado sin version_at_closure: $f")
    warnings=$((warnings+1))
  fi
done < <(
  # Build find expression dinámicamente con los closures resueltos desde methodology
  find_args=()
  [[ -n "$STORY_CLOSURE" ]] && find_args+=(-name "$STORY_CLOSURE")
  if [[ -n "$ENABLER_CLOSURE" ]]; then
    [[ ${#find_args[@]} -gt 0 ]] && find_args+=(-o)
    find_args+=(-name "$ENABLER_CLOSURE")
  fi
  if [[ ${#find_args[@]} -gt 0 ]]; then
    find docs/works -type f \( "${find_args[@]}" \) 2>/dev/null
  fi
)

# --- 3. Stories en implementación (checkwork < 100%) ------------------------
if [[ -n "$STORY_CHECKWORK" ]]; then
  while IFS= read -r f; do
    [[ ! -f "$f" ]] && continue
    # Buscar "% progreso" o similar; heurística simple: buscar líneas con "%"
    PROGRESS=$(grep -oE "[0-9]+%" "$f" 2>/dev/null | head -1 || true)
    if [[ -n "$PROGRESS" && "$PROGRESS" != "100%" ]]; then
      outputs+=("  - Story en implementación ($PROGRESS): $(dirname "$f")")
    fi
  done < <(find docs/works -name "$STORY_CHECKWORK" -type f 2>/dev/null)
fi

# --- Reportar --------------------------------------------------------------
if [[ ${#outputs[@]} -gt 0 ]]; then
  echo ""
  echo "🔍 [audit-on-stop] Auditoría ligera de fin de sesión:"
  for line in "${outputs[@]}"; do
    echo "$line"
  done
  echo ""
  if [[ $warnings -gt 0 ]]; then
    echo "   Warnings de Regla 17: $warnings. Considerá correr /sync-check para más detalle."
  fi
fi

exit 0
