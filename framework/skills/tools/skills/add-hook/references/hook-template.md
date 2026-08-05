# Template — HOOK (para uso de `/fremi-tools hook <name>`)

Este template arma el script inicial de un hook específico de proyecto (bajo `docs/project/hooks/<name>.sh`). Se rellena reemplazando `<name>` y placeholders. El script queda con `chmod +x`.

**Nota importante**: en v1 el skill NO auto-registra el hook en `.claude/settings.json`. Al terminar el scaffold, el skill imprime las instrucciones para el registro manual (ver comentarios del template).

```bash
#!/usr/bin/env bash
# ============================================================
# Hook: <name>
# Tipo: <PreToolUse | PostToolUse | Stop | UserPromptSubmit | ...>
# Matcher (sugerido): <regex o glob — qué dispara el hook>
# Creado: YYYY-MM-DD
#
# Propósito:
#   <Qué hace este hook en 1-2 líneas.>
#
# Cómo registrar (NO automático en v1):
#   Editar .claude/settings.json y agregar bajo "hooks":
#     {
#       "hooks": {
#         "<HookEventName>": [
#           {
#             "matcher": "<pattern>",
#             "hooks": [
#               { "type": "command", "command": "<ruta-absoluta>/docs/project/hooks/<name>.sh" }
#             ]
#           }
#         ]
#       }
#     }
# ============================================================

set -euo pipefail

# Variables disponibles según el evento (ver docs de Claude Code hooks):
#   - CLAUDE_TOOL_NAME, CLAUDE_TOOL_INPUT (PreToolUse / PostToolUse)
#   - CLAUDE_TOOL_OUTPUT (PostToolUse)
#   - CLAUDE_PROMPT (UserPromptSubmit)
# Adaptar según evento elegido.

# === Lógica del hook ===

echo "TODO: implementar lógica del hook <name>"

# Salir con código:
#   0 → continuar normal
#   1 → bloquear acción / fallo del hook
#   2 → bloquear con feedback a Claude (sólo algunos eventos)
exit 0
```
