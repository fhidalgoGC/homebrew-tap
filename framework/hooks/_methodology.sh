#!/usr/bin/env bash
# ============================================================================
# _methodology.sh — HELPER CROSS-DOMAIN (source-only, not a hook)
# ============================================================================
#
# Resuelve filenames por capa leyendo la fuente de verdad:
#   ~/.fremi/framework/settings/methodology.core.yaml
#
# Regla del repo: NO hardcodear identificadores del framework.
# Ver: .claude/rules/no-hardcoded-identifiers.md
#
# Compatible con bash 3.2+ (no usa `declare -A` ni `mapfile`).
#
# ────────────────────────────────────────────────────────────────────────────
# Uso desde un hook cross-domain:
#     source "$(dirname "$0")/_methodology.sh"
#     meth_load_layer story
#     [[ "$METH_LOAD_OK" != "1" ]] && exit 0    # fail-safe
#
#     # Ahora tenemos METH_LAYER_FILES[] con los filenames en orden
#     CLOSURE=$(meth_layer_last_file)              # último doc (típicamente closure)
#     CHECKWORK=$(meth_layer_file_by_name checkwork)
#     DEFINITION=$(meth_layer_file_by_name definition)
#
#     # O iterar
#     for f in "${METH_LAYER_FILES[@]}"; do ...; done
#
# También expone:
#     meth_is_closure_file <path>     → 0 si el path termina en el closure
#                                        de story o enabler
#     meth_is_workflow_file <path>    → 0 si el path es un doc del workflow
#                                        de story (matcheando files_in_order)
# ────────────────────────────────────────────────────────────────────────────
#
# Fallback: si methodology.core.yaml no se puede leer o awk falla,
# METH_LOAD_OK=0 y los hooks callers deben exit 0 (fail-safe).
# ============================================================================

METH_LOAD_OK=0
METH_LAYER=""                # capa actualmente cargada
METH_LAYER_FILES=()          # array indexado — filenames de la capa

# Carga los filenames de una capa (story / enabler / feature / product / extra / bug).
#
# Estructura esperada en methodology.core.yaml:
#     layers:
#       <layer>:
#         files_in_order:              # o `required_files` para feature/product/extra
#         - <filename1>
#         - <filename2>
meth_load_layer() {
  local layer="$1"
  local methodology="$HOME/.fremi/framework/settings/methodology.core.yaml"

  [[ ! -f "$methodology" ]] && { METH_LOAD_OK=0; return 1; }
  [[ -z "$layer" ]] && { METH_LOAD_OK=0; return 1; }

  # Extraer los filenames del bloque de la capa. Aceptar tanto `files_in_order`
  # como `required_files` (según cómo lo declara methodology para cada capa).
  local extracted
  extracted=$(awk -v target_layer="$layer" '
    $0 ~ "^  " target_layer ":" { in_layer=1; next }
    in_layer && /^  [a-z]/ && $0 !~ "^  " target_layer ":" { in_layer=0 }
    in_layer && /^    files_in_order:/ { in_list=1; next }
    in_layer && /^    required_files:/ { in_list=1; next }
    in_list && /^    [a-z]/ && !/^    - / { in_list=0 }
    in_list && /^    - / { sub(/^    - /, ""); print; next }
  ' "$methodology" 2>/dev/null)

  [[ -z "$extracted" ]] && { METH_LOAD_OK=0; return 1; }

  METH_LAYER_FILES=()
  local line
  while IFS= read -r line; do
    [[ -n "$line" ]] && METH_LAYER_FILES+=("$line")
  done <<< "$extracted"

  [[ ${#METH_LAYER_FILES[@]} -eq 0 ]] && { METH_LOAD_OK=0; return 1; }

  METH_LAYER="$layer"
  METH_LOAD_OK=1
  return 0
}

# Devuelve el último filename de la capa cargada (típicamente el `closure`).
meth_layer_last_file() {
  [[ "$METH_LOAD_OK" != "1" ]] && return 1
  local last_idx=$((${#METH_LAYER_FILES[@]} - 1))
  (( last_idx < 0 )) && return 1
  echo "${METH_LAYER_FILES[$last_idx]}"
}

# Devuelve el primer filename de la capa cargada (típicamente el `definition`
# — o `explore` si es story y la capa lo tiene primero).
meth_layer_first_file() {
  [[ "$METH_LOAD_OK" != "1" ]] && return 1
  (( ${#METH_LAYER_FILES[@]} == 0 )) && return 1
  echo "${METH_LAYER_FILES[0]}"
}

# Busca un filename por keyword (case-insensitive substring match).
# Útil cuando querés "el archivo cuyo nombre contiene 'checkwork'" sin
# preocuparte por el prefijo/número.
meth_layer_file_by_name() {
  [[ "$METH_LOAD_OK" != "1" ]] && return 1
  local needle="$1"
  local f
  for f in "${METH_LAYER_FILES[@]}"; do
    if [[ "$(echo "$f" | tr '[:upper:]' '[:lower:]')" == *"$(echo "$needle" | tr '[:upper:]' '[:lower:]')"* ]]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

# Retorna 0 si `path` es el filename del closure de story O de enabler.
# Carga ambas capas si no están ya cargadas. Preserva la capa previa.
meth_is_closure_file() {
  local path="$1"
  local basename_path
  basename_path=$(basename "$path")

  # Guardar estado actual
  local saved_layer="$METH_LAYER"
  local saved_files=("${METH_LAYER_FILES[@]}")
  local saved_ok="$METH_LOAD_OK"

  local match=1  # 1 = false por default

  local layer
  for layer in story enabler; do
    if meth_load_layer "$layer"; then
      local closure
      closure=$(meth_layer_last_file)
      if [[ -n "$closure" && "$basename_path" == "$closure" ]]; then
        match=0
        break
      fi
    fi
  done

  # Restaurar estado
  METH_LAYER="$saved_layer"
  METH_LAYER_FILES=("${saved_files[@]}")
  METH_LOAD_OK="$saved_ok"

  return $match
}

# Retorna 0 si `path` es un doc del workflow story (cualquiera de los
# files_in_order). Preserva estado.
meth_is_story_workflow_file() {
  local path="$1"
  local basename_path
  basename_path=$(basename "$path")

  local saved_layer="$METH_LAYER"
  local saved_files=("${METH_LAYER_FILES[@]}")
  local saved_ok="$METH_LOAD_OK"

  local match=1
  if meth_load_layer story; then
    local f
    for f in "${METH_LAYER_FILES[@]}"; do
      if [[ "$basename_path" == "$f" ]]; then
        match=0
        break
      fi
    done
  fi

  METH_LAYER="$saved_layer"
  METH_LAYER_FILES=("${saved_files[@]}")
  METH_LOAD_OK="$saved_ok"

  return $match
}
