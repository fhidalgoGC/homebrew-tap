---
name: fremi-delete-mcp
description: Remueve un MCP server de `.claude/settings.json` bajo `mcpServers.<name>`. NO borra ningún archivo — sólo desregistra la entry. Pide confirmación antes.
---

# /fremi-delete-mcp — Remover MCP server

Remueve el registro de un MCP server de `.claude/settings.json`. El MCP queda desconectado del agente. **No borra archivos** — sólo modifica settings.

## Sintaxis

```
/fremi-delete-mcp <name>
```

## Cuándo invocarlo

- El MCP dejó de usarse o migraste a otro.
- Estás debuggeando y querés desconectar temporalmente.

## Procedimiento

### Paso 0 — Validar entrada
1. Leer `.claude/settings.json`.
2. Verificar que `mcpServers.<name>` existe.
3. Si no → abortar (nada que remover).

### Paso 1 — Mostrar config actual

Reportar la config que se va a remover:

```
El MCP <name> tiene esta config:
   type: stdio
   command: npx
   args: [...]
```

### Paso 2 — Confirmar

```
⚠️ Vas a remover el MCP: <name>
   El agente ya no tendrá acceso a las herramientas de este MCP.
   No se borran archivos — sólo se desregistra.

¿Confirmás? [sí/no]
```

### Paso 3 — Actualizar settings.json

1. Leer `.claude/settings.json`.
2. Remover `mcpServers.<name>`.
3. Si `mcpServers` queda vacío → dejarlo como `{}` o remover la clave entera (opcional).
4. Escribir el archivo con formato JSON indentado.

### Paso 4 — Reportar

```
✅ MCP removido: <name>
📁 Config actualizada: .claude/settings.json → mcpServers (removido)

Próximo paso:
   - Reiniciar el agente para que deje de intentar conectar al MCP.
   - Si el MCP era stdio con proceso propio → verificar que no queda proceso zombie.
```

## Validaciones

- MCP no existe en settings.json → abortar.
- `.claude/settings.json` malformado → abortar antes de modificar.

## Anti-patrones

- ❌ Remover un MCP sin verificar qué skills lo estaban usando — pueden romperse.
- ❌ Editar settings.json a mano — usar este skill para consistencia.

## Referencias

- Ver también: [`/fremi-add-mcp`](../add-mcp/SKILL.md).
- Docs oficiales MCP: [Anthropic MCP](https://docs.anthropic.com/en/docs/agents-and-tools/mcp).
