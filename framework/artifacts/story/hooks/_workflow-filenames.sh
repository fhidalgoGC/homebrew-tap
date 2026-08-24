#!/usr/bin/env bash
# ============================================================================
# _workflow-filenames.sh — HELPER (source-only, not a hook itself)
# ============================================================================
#
# Resuelve filenames del workflow story leyendo la fuente de verdad:
#   ~/.fremi/framework/settings/methodology.core.yaml
#     → layers.story.files_in_order[]
#
# Regla del repo: NO hardcodear identificadores del framework.
# Ver: .claude/rules/no-hardcoded-identifiers.md
#
# Compatible con bash 3.2+ (no usa `declare -A` ni `mapfile`).
#
# Uso desde otro hook:
#     source "$(dirname "$0")/_workflow-filenames.sh"
#     wf_load_story_filenames
#     [[ "$WF_LOAD_OK" != "1" ]] && exit 0    # fail-safe
#
#     CHECKWORK="$STORY_DIR/$(wf_filename checkwork)"
#     if [[ "$(basename "$FILE_PATH")" == "$(wf_filename closure)" ]]; then ...
#
# El helper mapea cada filename a su step_id según el orden canónico:
#   0: explore, 1: definition, 2: proposal, 3: scope, 4: bdd,
#   5: sdd, 6: design, 7: tdd, 8: plan, 9: checkwork, 10: closure
#
# Si methodology.core.yaml no se puede leer o la extracción falla:
#   - WF_LOAD_OK=0
#   - Los callers deben chequear y salir con exit 0 (fail-safe, no bloquear).
# ============================================================================

# Orden canónico de step_ids del workflow story
# (ver ~/.fremi/framework/artifacts/story/workflow.yaml → steps[].order)
WF_STORY_STEP_ORDER=(explore definition proposal scope bdd sdd design tdd plan checkwork closure)

# Populated by wf_load_story_filenames (indexed array, alineado con WF_STORY_STEP_ORDER)
WF_STORY_FILENAMES=()
WF_LOAD_OK=0

wf_load_story_filenames() {
  local methodology="$HOME/.fremi/framework/settings/methodology.core.yaml"
  [[ ! -f "$methodology" ]] && { WF_LOAD_OK=0; return 1; }

  # Extraer files_in_order del bloque layers.story usando awk.
  # Estructura esperada:
  #   layers:
  #     story:
  #       ...
  #       files_in_order:
  #       - FW-00_explore.md
  #       - FW-01_definition.md
  #       ...
  local extracted
  extracted=$(awk '
    /^  story:/ { in_story=1; next }
    in_story && /^  [a-z]/ && !/^  story:/ { in_story=0 }
    in_story && /^    files_in_order:/ { in_list=1; next }
    in_list && /^    [a-z]/ && !/^    - / { in_list=0 }
    in_list && /^    - / { sub(/^    - /, ""); print; next }
  ' "$methodology" 2>/dev/null)

  [[ -z "$extracted" ]] && { WF_LOAD_OK=0; return 1; }

  # Poblar array (compat bash 3.2 — sin mapfile)
  WF_STORY_FILENAMES=()
  local line
  while IFS= read -r line; do
    [[ -n "$line" ]] && WF_STORY_FILENAMES+=("$line")
  done <<< "$extracted"

  [[ ${#WF_STORY_FILENAMES[@]} -eq 0 ]] && { WF_LOAD_OK=0; return 1; }

  WF_LOAD_OK=1
  return 0
}

# Dado un step_id (ej: "checkwork"), devuelve el filename real.
# Vacío si no cargó o step_id no existe.
wf_filename() {
  local step_id="$1"
  local i
  for (( i=0; i < ${#WF_STORY_STEP_ORDER[@]}; i++ )); do
    if [[ "${WF_STORY_STEP_ORDER[$i]}" == "$step_id" ]]; then
      # Guard: si la lista de methodology es más corta que step_order, devolvé vacío
      if (( i < ${#WF_STORY_FILENAMES[@]} )); then
        echo "${WF_STORY_FILENAMES[$i]}"
        return 0
      else
        return 1
      fi
    fi
  done
  return 1
}

# Dado un filename (ej: "FW-09_checkwork.md"), devuelve el step_id ("checkwork").
# Vacío si no matchea.
wf_step_id_from_filename() {
  local target="$1"
  local i
  for (( i=0; i < ${#WF_STORY_FILENAMES[@]}; i++ )); do
    if [[ "${WF_STORY_FILENAMES[$i]}" == "$target" ]]; then
      if (( i < ${#WF_STORY_STEP_ORDER[@]} )); then
        echo "${WF_STORY_STEP_ORDER[$i]}"
        return 0
      fi
    fi
  done
  return 1
}

# Dado un step_id, devuelve el order (0..N-1). Vacío si no matchea.
wf_step_order() {
  local target="$1"
  local i
  for (( i=0; i < ${#WF_STORY_STEP_ORDER[@]}; i++ )); do
    if [[ "${WF_STORY_STEP_ORDER[$i]}" == "$target" ]]; then
      echo "$i"
      return 0
    fi
  done
  return 1
}
