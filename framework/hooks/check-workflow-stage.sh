#!/usr/bin/env bash
# ============================================================================
# Hook: check-workflow-stage — CROSS-DOMAIN
# Tipo recomendado: UserPromptSubmit
#
# ────────────────────────────────────────────────────────────────────────────
# Convención de identificadores:
#   Resuelve filenames por capa desde methodology.core.yaml — NO hardcodea.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ────────────────────────────────────────────────────────────────────────────
#
# Verifica el estado del flujo de trabajo del proyecto y emite un aviso
# (NO bloquea) cuando detecta condiciones que violarían las reglas.
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
# ============================================================================

set -uo pipefail

# Cargar helper cross-domain de methodology
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_methodology.sh
source "$SCRIPT_DIR/_methodology.sh"

PRODUCT_DIR="docs/works/product"
FEATURES_DIR="docs/works/features"

# Resolver filenames obligatorios del workflow story (excluye condicionales
# como explore/proposal, que se manejan en check-conditional-docs).
STORY_REQUIRED_FILES=()
if meth_load_layer story; then
  # Cargar lista de condicionales
  CONDITIONALS=$(awk '
    /^  story:/ { in_story=1; next }
    in_story && /^  [a-z]/ && !/^  story:/ { in_story=0 }
    in_story && /^    conditional_files:/ { in_list=1; next }
    in_list && /^    [a-z]/ && !/^    - / { in_list=0 }
    in_list && /^    - / { sub(/^    - /, ""); print; next }
  ' "$HOME/.fremi/framework/settings/methodology.core.yaml" 2>/dev/null)

  for f in "${METH_LAYER_FILES[@]}"; do
    # Excluir el checkwork (living, no requerido para "story lista para código")
    # y el closure (post-implementación).
    case "$f" in
      *checkwork*|*closure*) continue ;;
    esac
    # Excluir condicionales
    if echo "$CONDITIONALS" | grep -qFx "$f"; then
      continue
    fi
    STORY_REQUIRED_FILES+=("$f")
  done
fi

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
# Chequea que TODOS los docs obligatorios del workflow story existan con
# contenido. Los filenames se resolvieron dinámicamente desde methodology
# en STORY_REQUIRED_FILES.
any_story_ready() {
  if [[ ! -d "$FEATURES_DIR" ]]; then return 1; fi
  if [[ ${#STORY_REQUIRED_FILES[@]} -eq 0 ]]; then return 1; fi
  while IFS= read -r story_dir; do
    local ok=1
    for f in "${STORY_REQUIRED_FILES[@]}"; do
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
      echo "Reglas relevantes: Reglas 1, 4 (~/.fremi/framework/rules/hierarchy.md), Regla 2 (~/.fremi/framework/artifacts/story/rules/bug-fix-and-refactor.md). Ver índice en ~/.fremi/framework/rules/workflow.md."
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
