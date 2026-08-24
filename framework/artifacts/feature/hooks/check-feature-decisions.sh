#!/usr/bin/env bash
# ============================================================================
# Hook: check-feature-decisions — FEATURE-DOMAIN
# Tipo: PreToolUse
# Matcher (sugerido): { "tool_name": "Write",
#                       "file_path": "docs/works/features/*/decisions.md" }
#
# ────────────────────────────────────────────────────────────────────────────
# DOMAIN: feature — aplica cuando se crea `decisions.md` de una feature.
#
# Fuente de verdad del criterio de obligatoriedad:
#   config.user.yaml → conditional_rules.feature_decisions_when
#     runtime del proyecto: .fremi/settings/feature/config.user.yaml
#     framework template:   ~/.fremi/framework/artifacts/feature/config.user.yaml
#
# Reglas aplicadas:
#   Regla 15 (artefactos opcionales) — `decisions.md` de feature es CONDICIONAL.
# ────────────────────────────────────────────────────────────────────────────
#
# Propósito:
#   Cuando se crea el `decisions.md` de una feature, recordar que este doc es
#   CONDICIONAL — sólo se crea si la feature tiene ADRs LOCALES (que sólo
#   aplican a esa feature). Si todos los ADRs son transversales al producto,
#   van a `product/decisions.md` — no a `<feature>/decisions.md`.
#
# Salida:
#   stdout → recordatorio para revisar el criterio.
#   exit 0 → siempre.
# ============================================================================

set -uo pipefail

PAYLOAD=""
if [[ ! -t 0 ]]; then
  PAYLOAD="$(cat || true)"
fi

command -v jq >/dev/null 2>&1 || exit 0

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[[ -z "$FILE_PATH" ]] && exit 0

# Sólo aplica a `decisions.md` de una feature (excluir product/decisions.md y story-nested)
[[ "$FILE_PATH" != *"/docs/works/features/"*"/decisions.md" ]] && exit 0
[[ "$FILE_PATH" == *"/user-stories/"* ]] && exit 0

# Resolver path del config.user.yaml — preferir el del proyecto, fallback al framework
PROJECT_CONFIG=".fremi/settings/feature/config.user.yaml"
FRAMEWORK_CONFIG="$HOME/.fremi/framework/artifacts/feature/config.user.yaml"

CONFIG_FILE=""
if [[ -f "$PROJECT_CONFIG" ]]; then
  CONFIG_FILE="$PROJECT_CONFIG"
elif [[ -f "$FRAMEWORK_CONFIG" ]]; then
  CONFIG_FILE="$FRAMEWORK_CONFIG"
fi

cat <<EOF

⚠️  [check-feature-decisions] Estás creando el doc \`decisions.md\` de una feature.

Este doc es CONDICIONAL: sólo se crea si la feature tiene ADRs LOCALES (que
sólo aplican a esta feature, no transversales al producto).

Antes de continuar, verificá el criterio en:
  $CONFIG_FILE → conditional_rules.feature_decisions_when

Si todos los ADRs son transversales al producto → deben ir a
\`docs/works/product/decisions.md\`, no acá. Crear \`decisions.md\` de feature
"por completitud" es anti-patrón (Regla 15 / conditional).

Regla aplicable: ~/.fremi/framework/artifacts/story/rules/bugs.md (Regla 15).
EOF

exit 0
