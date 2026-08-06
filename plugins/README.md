# `~/.fremi/framework/plugins/` — Configuración de plugins por agente

> **Esta carpeta es configuración del entorno del agente.** Contiene archivos de configuración de plugins externos (MCP servers, integraciones, etc.) que cada agente (Claude Code, Cursor, etc.) consume.
>
> Este README es para humanos: explica para qué sirve la carpeta y cómo agregar configuración de un plugin nuevo.

---

## Estado actual

**Carpeta vacía** — aún no hay plugins configurados a nivel proyecto.

Cuando aparezca el primer plugin (ej: un MCP server específico para este servicio), su configuración vive acá y se referencia desde el `.claude/plugins.json` (o equivalente del agente) vía symlink.

---

## Para qué sirve

Algunos agentes consumen plugins de terceros: servidores MCP (Model Context Protocol), integraciones (Asana, Notion, Linear, Slack, etc.), o herramientas locales. Cada uno suele venir con un archivo de configuración (`.json`, `.yaml`).

Centralizar esa configuración acá tiene dos ventajas:
1. **Multi-agente:** un mismo plugin se configura una vez y los distintos agentes (`.claude/`, `.cursor/`, etc.) lo consumen vía symlinks. Sin duplicación.
2. **Versionado en el repo:** la configuración va al control de versiones — cualquier dev clona y tiene el mismo set de plugins.

---

## Cómo agregar configuración de un plugin

1. Crear un archivo descriptivo: `~/.fremi/framework/plugins/<plugin-nombre>.json` (o el formato que pida el plugin).
2. **Documentarlo en este README** con:
   - Nombre y propósito.
   - Quién lo consume (qué agente lo lee).
   - Si necesita credenciales (en `.env` no versionado).
3. Wirearlo en el archivo de configuración del agente (`.claude/settings.json` o similar), apuntando a `~/.fremi/framework/plugins/<plugin-nombre>.json`.

### Plantilla mínima de entry en este README

```markdown
| Archivo | Plugin | Consumido por | Notas |
|---|---|---|---|
| `linear-mcp.json` | Linear MCP server | Claude Code | Requiere `LINEAR_API_KEY` en `.env`. |
```

---

## Anti-patrones de esta carpeta

- ❌ Credenciales en plano (passwords, API keys). Acá va sólo la configuración estructural; los secretos van a `.env` no versionado y se referencian.
- ❌ Configuración específica de un usuario individual (eso va a `.claude/settings.local.json` o equivalente, no acá).
- ❌ Configuración de plugins que sólo usa un agente y nadie más (mejor ponerla en `.claude/` o el folder específico del agente, sin pasar por acá).
- ❌ Archivos sin entrada en la tabla de Contenido (este README debe quedar siempre al día).

---

## Listado de plugins configurados

(Vacío por ahora. Sumar entradas a medida que aparecen.)

| Archivo | Plugin | Consumido por | Notas |
|---|---|---|---|
| — | — | — | — |
