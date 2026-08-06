---
name: fremi-delete-mcp
description: Remueve un MCP server — borra `docs/project/mcp/<name>.json` Y desregistra en CADA agente instalado que lo tenga configurado (Claude Code → `.claude/settings.json`, Cursor → `.cursor/mcp.json`). Pide confirmación antes.
---

# /fremi-delete-mcp — Remover MCP server

Remueve la fuente única del MCP en `docs/project/mcp/<name>.json` y su registro en **cada agente instalado** que lo tenga configurado (hoy Claude Code y Cursor).

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) §2.4.

## Sintaxis

```
/fremi-delete-mcp <name>
```

## Cuándo invocarlo

- El MCP dejó de usarse o migraste a otro.
- Estás debuggeando y querés desconectar temporalmente.

## Procedimiento

### Paso 0 — Validar entrada
1. Verificar que `docs/project/mcp/<name>.json` existe (fuente única) o que hay algún agente con `mcpServers.<name>` registrado.
2. Si no hay nada → abortar (nada que remover).

### Paso 1 — Detectar registros por agente

Para cada agente instalado que soporte MCP:

- **Claude Code**: buscar `mcpServers.<name>` en `.claude/settings.json`.
- **Cursor**: buscar `mcpServers.<name>` en `.cursor/mcp.json`.
- **Windsurf / Aider**: omitir.

### Paso 2 — Mostrar config actual + confirmar

```
⚠️ Vas a remover el MCP: <name>
   Fuente: docs/project/mcp/<name>.json
   Registros detectados:
     - Claude Code:  .claude/settings.json → mcpServers.<name>
     - Cursor:       .cursor/mcp.json → mcpServers.<name>

Config:
   type: stdio
   command: npx
   args: [...]

¿Confirmás? [sí/no]
```

### Paso 3 — Eliminar

Para **cada** agente detectado con registro:

- **Claude Code**: remover `mcpServers.<name>` de `.claude/settings.json`.
- **Cursor**: remover `mcpServers.<name>` de `.cursor/mcp.json`.
- Si el objeto `mcpServers` queda vacío → dejarlo como `{}` (no borrar la clave).

Después borrar la fuente única: `rm docs/project/mcp/<name>.json`.

### Paso 4 — Reportar

```
✅ MCP removido: <name>
🗑️ Borrado:
   - docs/project/mcp/<name>.json

📖 Registros removidos:
   ✓ Claude Code   .claude/settings.json → mcpServers.<name>
   ✓ Cursor        .cursor/mcp.json → mcpServers.<name>
   • Windsurf      (no registrado — omitido)

Próximo paso:
   - Reiniciar cada agente para que deje de intentar conectar al MCP.
   - Si el MCP era stdio con proceso propio → verificar que no queda proceso zombie.
```

## Validaciones

- MCP no existe en ningún lugar → abortar.
- `.claude/settings.json` o `.cursor/mcp.json` malformado → abortar antes de modificar.
- Fallo al remover algún registro por agente → seguir con los demás y reportar el error, pero NO borrar la fuente única (garantiza que reintento es idempotente).

## Anti-patrones

- ❌ Remover un MCP sin verificar qué skills lo estaban usando — pueden romperse.
- ❌ Editar settings.json / mcp.json a mano — usar este skill para consistencia entre agentes.

## Referencias

- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Ver también: [`/fremi-add-mcp`](../add-mcp/SKILL.md).
- Docs oficiales MCP: [Anthropic MCP](https://docs.anthropic.com/en/docs/agents-and-tools/mcp).
