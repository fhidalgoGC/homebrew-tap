#!/usr/bin/env bash
# ============================================================================
# Hook: audit-on-stop
# Tipo: Stop
# Matcher: n/a (Stop no usa matcher — se ejecuta al final de cada respuesta)
#
# Propósito:
#   Auditoría ligera al terminar una sesión de trabajo. Reporta:
#     1. Docs living sin changelog al pie.
#     2. Docs snapshot cerrados sin ancestor.version_at_closure.
#     3. Stories en implementación (`FW-09_checkwork.md` con % < 100).
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

# --- Bail out si no hay estructura de works ---------------------------------
[[ ! -d "docs/works" ]] && exit 0

warnings=0
outputs=()

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
done < <(find docs/works -type f \( -name "FW-10_closure.md" -o -name "EN-04_closure.md" \) 2>/dev/null)

# --- 3. Stories en implementación (checkwork < 100%) ------------------------
while IFS= read -r f; do
  [[ ! -f "$f" ]] && continue
  # Buscar "% progreso" o similar; heurística simple: buscar líneas con "%"
  PROGRESS=$(grep -oE "[0-9]+%" "$f" 2>/dev/null | head -1 || true)
  if [[ -n "$PROGRESS" && "$PROGRESS" != "100%" ]]; then
    outputs+=("  - Story en implementación ($PROGRESS): $(dirname "$f")")
  fi
done < <(find docs/works -name "FW-09_checkwork.md" -type f 2>/dev/null)

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
