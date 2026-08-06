#!/usr/bin/env bash
# ============================================================================
# Hook: check-reverse-alignment
# Tipo: PostToolUse
# Matcher (sugerido): { "tool_name": "Edit|Write", "file_path": "docs/works/**/*.md" }
#
# Propósito:
#   Valida coherencia de docs producidos por reverse-engineering (Reglas 25-32):
#     1. Si el doc tiene frontmatter `reverse_engineered: true`, chequea que
#        también tenga `reverse_engineered_at`, `reverse_engineered_source`,
#        `reverse_engineered_confidence`.
#     2. Chequea que confidence >= 0.5 (min_threshold declarado en
#        config.reverse.yaml). Bajo esto → sugiere marcar needs_review.
#     3. Al firmar closure reverse (FW-10 o EN-04 con reverse_engineered:true),
#        recuerda al usuario aplicar parent_bump_triggers (Regla 30 = Regla 17).
#     4. Reporta el ratio reverse/forward acumulado del proyecto (Regla 32) —
#        warning si >15%, critical si >30%.
#
# Salida:
#   stdout → mensaje informativo si detecta issue.
#   exit 0 → siempre (no bloquea; es advertencia).
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)

# Sólo aplica a archivos .md dentro de docs/works/
[[ -z "$FILE_PATH" ]] && exit 0
[[ "$FILE_PATH" != *"docs/works/"*".md" ]] && exit 0
[[ ! -f "$FILE_PATH" ]] && exit 0

# --- Extraer frontmatter YAML ------------------------------------------------
FRONTMATTER=$(awk '/^---$/{c++; if(c==1){next} if(c==2){exit}} c==1' "$FILE_PATH" 2>/dev/null || true)
[[ -z "$FRONTMATTER" ]] && exit 0

# --- 1. Chequear si es doc reverse ------------------------------------------
IS_REVERSE=$(echo "$FRONTMATTER" | grep -E "^reverse_engineered:\s*true" || true)
[[ -z "$IS_REVERSE" ]] && exit 0   # No es reverse — nada que validar

# --- 2. Chequear campos obligatorios en modo transparent --------------------
missing=()
for field in reverse_engineered_at reverse_engineered_source reverse_engineered_confidence; do
  if ! echo "$FRONTMATTER" | grep -qE "^${field}:"; then
    missing+=("$field")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "⚠️  [check-reverse-alignment] $FILE_PATH — es reverse-engineered pero faltan campos: ${missing[*]}"
  echo "   Ver Regla 26 en ~/.fremi/framework/rules/reverse.md."
fi

# --- 3. Chequear confidence >= 0.5 ------------------------------------------
CONFIDENCE=$(echo "$FRONTMATTER" | grep -E "^reverse_engineered_confidence:" | sed -E 's/.*:\s*([0-9.]+).*/\1/' || echo "")

if [[ -n "$CONFIDENCE" ]]; then
  # Compare con awk (bash no soporta floats)
  BELOW_THRESHOLD=$(awk -v c="$CONFIDENCE" 'BEGIN{ print (c < 0.5) ? 1 : 0 }')
  if [[ "$BELOW_THRESHOLD" == "1" ]]; then
    echo "⚠️  [check-reverse-alignment] $FILE_PATH — reverse_engineered_confidence=$CONFIDENCE < 0.5"
    echo "   Considerá marcar el frontmatter con needs_review: true."
    echo "   Ver config.reverse.yaml → policies.confidence.min_threshold."
  fi
fi

# --- 4. Si es closure firmado, recordar bump del padre ----------------------
if [[ "$FILE_PATH" == *"FW-10_closure.md" || "$FILE_PATH" == *"EN-04_closure.md" ]]; then
  # Verificar si tiene sign-off (heurística: contiene la palabra "Sign-off" o "Firmado")
  if grep -qE "Sign-off|Firmado" "$FILE_PATH" 2>/dev/null; then
    echo "ℹ️  [check-reverse-alignment] $FILE_PATH — closure reverse firmado."
    echo "   Recordá aplicar parent_bump_triggers (Regla 30 + 17)."
    echo "   Padres a bumpear según config.yaml → versioning.parent_bump_triggers."
  fi
fi

# --- 5. Ratio reverse/forward del proyecto (Regla 32) -----------------------
# Contar docs reverse vs total en docs/works/
# (opt-in: sólo reporta si se puede calcular rápido — no bloquea)
if [[ -d "docs/works" ]]; then
  TOTAL=$(find docs/works -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  REVERSE_COUNT=$(grep -rlE "^reverse_engineered:\s*true" docs/works --include="*.md" 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$TOTAL" -gt 0 ]]; then
    RATIO=$(awk -v r="$REVERSE_COUNT" -v t="$TOTAL" 'BEGIN{ printf "%.3f", r/t }')
    WARN=$(awk -v r="$RATIO" 'BEGIN{ print (r > 0.15) ? 1 : 0 }')
    CRIT=$(awk -v r="$RATIO" 'BEGIN{ print (r > 0.30) ? 1 : 0 }')

    if [[ "$CRIT" == "1" ]]; then
      echo "🚨 [check-reverse-alignment] Ratio reverse/forward: $RATIO (${REVERSE_COUNT}/${TOTAL})"
      echo "   CRÍTICO — >30% del proyecto es reverse-engineered."
      echo "   Regla 32: el framework no está siendo respetado en el flow forward."
      echo "   Revisar por qué las stories arrancan sin ciclo y corregir la disciplina."
    elif [[ "$WARN" == "1" ]]; then
      echo "⚠️  [check-reverse-alignment] Ratio reverse/forward: $RATIO (${REVERSE_COUNT}/${TOTAL})"
      echo "   WARNING — >15% del proyecto es reverse-engineered (Regla 32)."
    fi
  fi
fi

exit 0
