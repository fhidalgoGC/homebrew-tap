#!/usr/bin/env bash
# ============================================================================
# Hook: check-pipeline-preconditions — PIPELINE-STORY DOMAIN
# Tipo: UserPromptSubmit
#
# Fires when the user submits a prompt containing "/fremi-pipeline-story".
# Verifica precondiciones ANTES de que el pipeline arranque.
#
# Reglas:
#   R24 (framework install) → ~/.fremi/framework/rules/framework-mechanics.md
#   R1 (no salta etapas)    → ~/.fremi/framework/rules/hierarchy.md
#   R17 (versionado)        → ~/.fremi/framework/rules/versioning.md
#
# Upper-layer para story:
#   - docs/works/product/definition.md debe existir con contenido real.
#   - docs/works/product/plan.md debe existir con contenido real.
#   - La feature referenciada en el prompt debe tener definition.md con contenido
#     real y con frontmatter versionado (para ancestor.version_at_creation).
#
# Convención de identificadores:
#   Este hook NO hardcodea el prefijo de feature (configurado en methodology).
#   La carpeta raíz de features es siempre docs/works/features/ — la busca
#   dinámicamente desde el prompt y el filesystem.
#   Ver: .claude/rules/no-hardcoded-identifiers.md
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

# UserPromptSubmit envía { "prompt": "..." } por stdin
command -v jq >/dev/null 2>&1 || exit 0
PROMPT=$(echo "$PAYLOAD" | jq -r '.prompt // empty' 2>/dev/null || true)
[[ -z "$PROMPT" ]] && exit 0

# Detectar invocación del pipeline story
[[ "$PROMPT" != *"/fremi-pipeline-story"* ]] && exit 0

problems=()

# --------------------------------------------------------------------------
# R24: framework install
# --------------------------------------------------------------------------
if [[ ! -L ".claude/skills/fremi-story" ]]; then
  problems+=("Framework no instalado — .claude/skills/fremi-story no es symlink. Corré \`fremi install\`.")
fi

if [[ ! -f "CLAUDE.md" ]]; then
  problems+=("CLAUDE.md no existe — corré \`fremi install\`.")
elif ! grep -q "~/.fremi/framework/rules/workflow.md" CLAUDE.md 2>/dev/null; then
  problems+=("CLAUDE.md no referencia ~/.fremi/framework/rules/workflow.md — reinstalá con \`fremi install\`.")
fi

# --------------------------------------------------------------------------
# Upper-layer: capa producto lista (Regla 1, herencia de feature)
# --------------------------------------------------------------------------
PRODUCT_DEFINITION="docs/works/product/definition.md"
PRODUCT_PLAN="docs/works/product/plan.md"

if [[ ! -f "$PRODUCT_DEFINITION" ]]; then
  problems+=("$PRODUCT_DEFINITION no existe. Sin capa producto no se puede crear una story (Regla 1).")
elif [[ $(wc -c <"$PRODUCT_DEFINITION") -lt 100 ]]; then
  problems+=("$PRODUCT_DEFINITION parece vacío (< 100 bytes). Completá la capa producto primero.")
fi

if [[ ! -f "$PRODUCT_PLAN" ]]; then
  problems+=("$PRODUCT_PLAN no existe (Regla 1).")
fi

# --------------------------------------------------------------------------
# Upper-layer: feature referenciada en el prompt existe y tiene definition.md
#
# Busca el primer token que parezca un feature ID en el prompt. El formato
# exacto del ID (prefijo y padding) viene de methodology.core.yaml — el hook
# no lo hardcodea. En cambio, busca carpetas en docs/works/features/ cuyo
# nombre contenga el token extraído del prompt.
#
# El hook sólo reporta cuando puede determinar con certeza que la feature
# no existe. Si no puede inferir el FEATURE_ID del prompt, omite el check
# para no dar falsos positivos.
# --------------------------------------------------------------------------
FEATURES_DIR="docs/works/features"

# Extraer posible FEATURE_ID del prompt.
# Ej. con convención default (prefijo configurable en methodology.core.yaml):
#   /fremi-pipeline-story <feature-id> nombre-de-la-story
#   /fremi-pipeline-story <feature-id_slug-feature> nombre-story
# Captura el token inmediato después del slash-command en la primera línea.
FEATURE_TOKEN=$(echo "$PROMPT" | grep -o '/fremi-pipeline-story[[:space:]]\+[^[:space:]]\+' | head -1 | awk '{print $2}' || true)

if [[ -n "$FEATURE_TOKEN" && -d "$FEATURES_DIR" ]]; then
  # Buscar la carpeta de la feature que contenga el token
  FEATURE_DIR=$(find "$FEATURES_DIR" -maxdepth 1 -type d -name "*${FEATURE_TOKEN}*" 2>/dev/null | head -1 || true)

  if [[ -z "$FEATURE_DIR" ]]; then
    problems+=("Feature '$FEATURE_TOKEN' no encontrada en $FEATURES_DIR. Creala primero con /fremi-pipeline-feature.")
  else
    FEATURE_DEFINITION="$FEATURE_DIR/definition.md"
    if [[ ! -f "$FEATURE_DEFINITION" ]]; then
      problems+=("$FEATURE_DEFINITION no existe. La feature debe tener definition.md con contenido real (Regla 1).")
    elif [[ $(wc -c <"$FEATURE_DEFINITION") -lt 100 ]]; then
      problems+=("$FEATURE_DEFINITION parece vacío (< 100 bytes). Completá la feature antes de crear una story.")
    else
      # Regla 17: verificar que definition.md tiene frontmatter con version
      if ! grep -q "^version:" "$FEATURE_DEFINITION" 2>/dev/null; then
        problems+=("$FEATURE_DEFINITION no tiene frontmatter con 'version:' (Regla 17). Migrá la feature antes de arrancar el pipeline.")
      fi
    fi
  fi
fi

if [[ ${#problems[@]} -gt 0 ]]; then
  echo ""
  echo "⚠️  [pipeline-preconditions/story] Antes de invocar /fremi-pipeline-story:"
  for p in "${problems[@]}"; do
    echo "   - $p"
  done
  echo "   Ver: ~/.fremi/framework/rules/framework-mechanics.md → R24"
  echo "        ~/.fremi/framework/rules/hierarchy.md → R1"
  echo "        ~/.fremi/framework/rules/versioning.md → R17"
  echo ""
fi

exit 0
