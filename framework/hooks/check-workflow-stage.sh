#!/usr/bin/env bash
# Hook: check-workflow-stage
# Tipo recomendado: UserPromptSubmit
#
# Verifica el estado del flujo de trabajo del proyecto y emite un aviso
# (NO bloquea) cuando detecta condiciones que violarían las reglas de
# docs/agents/rules/workflow.md.
#
# Trabaja con la estructura por capas:
#   docs/works/product/             ← capa PRODUCTO
#   docs/works/features/<feat>/     ← capa FEATURE
#   docs/works/features/<feat>/user-stories/<story>/  ← capa USER STORY
#
# Wireado en .claude/settings.json — ver ejemplo al final del archivo.
#
# Salidas:
#   stdout    → mensaje informativo (Claude/usuario lo lee).
#   exit 0    → continuar normalmente.
#   exit 2    → bloquear (comentado por defecto; sólo avisa).

set -euo pipefail

PRODUCT_DIR="docs/works/product"
FEATURES_DIR="docs/works/features"

# ---- Estado de la capa PRODUCTO ------------------------------------------
# Discovery: iniciativas → ideas → planteamiento
# Formalización: definition → strategies → decisions → plan
product_stage_status() {
  local missing=()
  for f in iniciativas.md ideas.md planteamiento.md definition.md strategies.md decisions.md plan.md; do
    [[ -s "$PRODUCT_DIR/$f" ]] || missing+=("$f")
  done
  echo "${missing[*]:-OK}"
}

# ---- Cantidad de features y stories --------------------------------------
count_features() {
  if [[ -d "$FEATURES_DIR" ]]; then
    find "$FEATURES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' '
  else
    echo 0
  fi
}

count_stories() {
  if [[ -d "$FEATURES_DIR" ]]; then
    find "$FEATURES_DIR" -mindepth 3 -maxdepth 3 -type d -path "*/user-stories/*" 2>/dev/null | wc -l | tr -d ' '
  else
    echo 0
  fi
}

# ---- ¿Hay alguna story lista para código? --------------------------------
any_story_ready() {
  if [[ ! -d "$FEATURES_DIR" ]]; then return 1; fi
  while IFS= read -r story_dir; do
    local ok=1
    for f in FW-01_definition.md FW-02_scope.md FW-05_design.md FW-03_bdd-userstories.md FW-04_sdd-spec.md FW-06_tdd-plan.md; do
      [[ -s "$story_dir/$f" ]] || { ok=0; break; }
    done
    [[ $ok -eq 1 ]] && return 0
  done < <(find "$FEATURES_DIR" -mindepth 3 -maxdepth 3 -type d -path "*/user-stories/*" 2>/dev/null)
  return 1
}

# ---- Leer input del usuario ----------------------------------------------
USER_INPUT=""
if [[ ! -t 0 ]]; then
  USER_INPUT="$(cat || true)"
fi

# Heurística: ¿el usuario pide implementación/código?
CODE_INTENT_REGEX='(implement(a|ar|emos)?|cod(e|ear|ifica)|escrib(í|e|amos)? código|crea(r|mos)? (el|la|los|las)?\s*(endpoint|función|funcion|módulo|modulo|servicio|api|test|tests|resolver|mutation|query))'

if [[ -n "$USER_INPUT" ]] && echo "$USER_INPUT" | grep -iqE "$CODE_INTENT_REGEX"; then
  PRODUCT_STATUS="$(product_stage_status)"
  N_FEATURES="$(count_features)"
  N_STORIES="$(count_stories)"

  needs_warning=0
  reasons=()

  if [[ "$PRODUCT_STATUS" != "OK" ]]; then
    needs_warning=1
    reasons+=("- Falta(n) en capa PRODUCTO: $PRODUCT_STATUS")
  fi

  if [[ "$N_FEATURES" == "0" ]]; then
    needs_warning=1
    reasons+=("- No hay features en docs/works/features/")
  fi

  if [[ "$N_STORIES" == "0" ]]; then
    needs_warning=1
    reasons+=("- No hay user stories creadas")
  elif ! any_story_ready; then
    needs_warning=1
    reasons+=("- Ninguna user story está completa (faltan definition/bdd/sdd/tdd)")
  fi

  if [[ $needs_warning -eq 1 ]]; then
    {
      echo "[workflow-hook] Aviso: parece que pedís implementación/código."
      echo "Estado del flujo:"
      printf '%s\n' "${reasons[@]}"
      echo "Reglas relevantes en docs/agents/rules/workflow.md (Reglas 1, 2, 4)."
      echo "Sugerencia: ejecutá /workflow-guide para ver qué falta."
    }
    # Para bloquear en vez de sólo avisar, descomentar:
    # exit 2
  fi
fi

exit 0

# -----------------------------------------------------------------------------
# Ejemplo de wireado en .claude/settings.json:
#
# {
#   "hooks": {
#     "UserPromptSubmit": [
#       {
#         "matcher": "",
#         "hooks": [
#           { "type": "command", "command": "bash .claude/hooks/check-workflow-stage.sh" }
#         ]
#       }
#     ]
#   }
# }
# -----------------------------------------------------------------------------
