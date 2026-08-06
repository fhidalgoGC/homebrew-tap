---
name: fremi-add-mcp
description: Registra un MCP (Model Context Protocol) server en `.claude/settings.json` bajo `mcpServers`. Soporta 3 tipos: `stdio` (comando local), `http` (endpoint remoto), `sse` (server-sent events). Idempotente — si el MCP ya existe con misma config, no duplica.
---

# /fremi-add-mcp — Registrar MCP server

Agrega un MCP server nuevo a `.claude/settings.json` bajo `mcpServers`. El MCP queda disponible como fuente de herramientas para el agente en su próxima invocación.

## Sintaxis

```
/fremi-add-mcp <name> [--type stdio|http|sse]
```

- `<name>`: identificador del MCP (kebab-case).
- `--type`: tipo de transporte (default `stdio`).

## Cuándo invocarlo

- Se quiere conectar un MCP server nuevo (ej: base de datos custom, API interna, servidor de contexto).
- El proyecto necesita capacidades que un MCP existente provee.

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar `--type` ∈ {stdio, http, sse}.
3. Verificar que `.claude/settings.json` es legible.

### Paso 1 — Recolectar config del MCP

Según `--type`, pedir al usuario los campos necesarios:

**`stdio`** (default):
- `command`: comando a ejecutar (ej: `npx`, `python`, path a binario).
- `args`: array de argumentos.
- `env` (opcional): variables de entorno específicas.

**`http`**:
- `url`: endpoint del MCP.
- `headers` (opcional): typicamente `Authorization: Bearer <token>`.

**`sse`**:
- `url`: endpoint SSE.
- `headers` (opcional).

### Paso 2 — Actualizar `.claude/settings.json`

1. Leer `.claude/settings.json` actual (o crear estructura mínima si no existe).
2. Verificar que `mcpServers.<name>` NO existe (si existe → preguntar si sobrescribir).
3. Agregar la entry en `mcpServers.<name>` con la config del Paso 1.
4. Escribir el archivo con formato JSON indentado.

### Paso 3 — Reportar

```
✅ MCP server registrado: <name>
📁 Config: .claude/settings.json → mcpServers.<name>
🔧 Tipo: <stdio|http|sse>

Próximo paso:
   - Reiniciar el agente para que detecte el MCP nuevo.
   - Verificar que las herramientas del MCP aparezcan al arrancar.
   - Si el MCP requiere credenciales, asegurate de tener las env vars configuradas.
```

## Validaciones

- Colisión de nombre con MCP existente → preguntar antes de sobrescribir.
- `.claude/settings.json` malformado → abortar con error claro.
- Campos obligatorios faltantes → pedirlos al usuario antes de escribir.

## Ejemplo — MCP stdio (típico)

```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-postgres"],
      "env": {
        "DATABASE_URL": "postgres://..."
      }
    }
  }
}
```

## Referencias

- Template de entry: [`references/mcp-entry-template.json`](references/mcp-entry-template.json).
- Docs oficiales MCP: [Anthropic MCP](https://docs.anthropic.com/en/docs/agents-and-tools/mcp).
- Ver también: [`/fremi-delete-mcp`](../delete-mcp/SKILL.md).
