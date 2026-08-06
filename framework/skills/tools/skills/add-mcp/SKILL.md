---
name: fremi-add-mcp
description: Registra un MCP (Model Context Protocol) server. Fuente única en `docs/project/mcp/<name>.json`, luego registra en CADA agente instalado que soporte MCP (Claude Code → `.claude/settings.json`, Cursor → `.cursor/mcp.json`). Soporta 3 transports: `stdio`, `http`, `sse`. Idempotente.
---

# /fremi-add-mcp — Registrar MCP server

Registra un MCP server como fuente única en `docs/project/mcp/<name>.json` y lo referencia desde **cada agente instalado que soporte MCP** — hoy Claude Code y Cursor.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) §2.4 para el mapping por agente.

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
3. Verificar que `docs/project/mcp/<name>.json` NO existe.

### Paso 1 — Recolectar config del MCP

Según `--type`, pedir al usuario los campos necesarios:

**`stdio`** (default):
- `command`: comando a ejecutar (ej: `npx`, `python`, path a binario).
- `args`: array de argumentos.
- `env` (opcional): variables de entorno específicas.

**`http`**:
- `url`: endpoint del MCP.
- `headers` (opcional): típicamente `Authorization: Bearer <token>`.

**`sse`**:
- `url`: endpoint SSE.
- `headers` (opcional).

### Paso 2 — Escribir la fuente única

1. `mkdir -p docs/project/mcp/`
2. Escribir `docs/project/mcp/<name>.json` con el JSON del MCP:
   ```json
   {
     "type": "<stdio|http|sse>",
     "command": "...",
     "args": [...],
     "env": { ... }
   }
   ```
   (los campos varían según el transport)
3. Este archivo es la fuente única — cada agente lo consume desde acá.

### Paso 3 — Detectar agentes instalados

| Agente        | Marcador             | Soporte MCP |
|---------------|----------------------|-------------|
| Claude Code   | `.claude/`           | ✅ nativo    |
| Cursor        | `.cursor/`           | ✅ nativo (shape casi idéntico) |
| Windsurf      | `.windsurf/`         | ⚠️ pendiente confirmar path del config |
| Aider         | `.aider.conf.yml`    | ❌ no soporta |

### Paso 4 — Registrar en cada agente detectado

Para **cada** agente detectado que soporte MCP:

- **Claude Code**:
  1. Leer `.claude/settings.json` (o crear con estructura mínima).
  2. Si `mcpServers.<name>` YA existe con misma config → skip (idempotente); si difiere → preguntar sobrescribir.
  3. Copiar el contenido de `docs/project/mcp/<name>.json` a `mcpServers.<name>`.
  4. Escribir el archivo con JSON indentado.

- **Cursor**:
  1. Leer `.cursor/mcp.json` (o crear con `{"mcpServers": {}}`).
  2. Mismo procedimiento que Claude: copiar del JSON fuente a `mcpServers.<name>`.
  3. Escribir el archivo con JSON indentado.

- **Windsurf / Aider**: omitir con nota `(no soporta MCP)` o `(pendiente)`.

### Paso 5 — Reportar

```
✅ MCP server registrado: <name>
📁 Fuente única: docs/project/mcp/<name>.json
🔧 Tipo: <stdio|http|sse>

📖 Registrado en los agentes instalados:
   ✓ Claude Code   .claude/settings.json → mcpServers.<name>
   ✓ Cursor        .cursor/mcp.json → mcpServers.<name>
   • Windsurf      (pendiente soporte upstream — omitido)
   • Aider         (no soporta MCP — omitido)

Próximo paso:
   - Reiniciar cada agente para que detecte el MCP nuevo.
   - Verificar que las herramientas del MCP aparezcan al arrancar.
   - Si el MCP requiere credenciales, asegurate de tener las env vars configuradas.
```

## Validaciones

- Colisión de nombre con MCP existente → preguntar antes de sobrescribir.
- `.claude/settings.json` o `.cursor/mcp.json` malformado → abortar antes de modificar.
- Campos obligatorios faltantes → pedirlos al usuario antes de escribir.

## Ejemplo — MCP stdio (típico)

`docs/project/mcp/my-database.json`:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@my-org/mcp-postgres"],
  "env": {
    "DATABASE_URL": "postgres://..."
  }
}
```

`.claude/settings.json` y `.cursor/mcp.json` (idénticos):

```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-postgres"],
      "env": { "DATABASE_URL": "postgres://..." }
    }
  }
}
```

## Referencias

- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Template de entry: [`references/mcp-entry-template.json`](references/mcp-entry-template.json).
- Docs oficiales MCP: [Anthropic MCP](https://docs.anthropic.com/en/docs/agents-and-tools/mcp).
- Ver también: [`/fremi-delete-mcp`](../delete-mcp/SKILL.md).
