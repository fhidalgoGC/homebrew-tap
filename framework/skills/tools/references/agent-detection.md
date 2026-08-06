# Detección de agentes instalados en un proyecto

> **Fuente única de verdad** para los skills `fremi-add-*` / `fremi-delete-*`.
>
> Cada skill de proyecto (skill, rule, hook, mcp) vive como fuente única en `docs/project/<tipo>/` y se **expone / registra** a los agentes que estén instalados en el proyecto. Este doc define cómo detectar qué agente está instalado y cómo se hace la exposición por tipo de asset.

---

## 1. Detección de agentes

Un agente se considera "instalado en el proyecto" si el marcador canónico existe en la raíz del proyecto:

| Agente        | Marcador en raíz del proyecto | Estado en fremi |
|---------------|-------------------------------|-----------------|
| Claude Code   | `.claude/` (directorio)       | ✅ implementado end-to-end |
| Cursor        | `.cursor/` (directorio)       | ⚠️ estructura reservada, no probado |
| Windsurf      | `.windsurf/` (directorio)     | ⚠️ estructura reservada, no probado |
| Aider         | `.aider.conf.yml` (archivo)   | ⚠️ estructura reservada, no probado |

Si no se detecta ningún agente → el skill se crea igual en `docs/project/`, pero se advierte al usuario que nada lo va a ver hasta que instale al menos un agente.

---

## 2. Exposición / registro por tipo de asset

### 2.1 Skills

- **Fuente única:** `docs/project/skills/<name>/SKILL.md`
- **Registro:** symlink por agente.

| Agente        | Dónde va el symlink                    | Formato del target |
|---------------|----------------------------------------|--------------------|
| Claude Code   | `.claude/skills/<name>`                | relativo al symlink (ej: `../../docs/project/skills/<name>`) |
| Cursor        | `.cursor/skills/<name>`                | relativo — pendiente confirmación de que Cursor lea skills en este layout |
| Windsurf      | `.windsurf/skills/<name>`              | relativo — pendiente |
| Aider         | (no soporta skills — omitir)           | — |

### 2.2 Rules

- **Fuente única:** `docs/project/rules/<name>.md`
- **Registro:** varía por agente — no siempre es symlink.

| Agente        | Cómo se registra la rule                                          |
|---------------|-------------------------------------------------------------------|
| Claude Code   | Bullet en `CLAUDE.md` bajo la sección `## Project rules`, apuntando al path de la rule |
| Cursor        | Symlink `.cursor/rules/<name>.mdc` → `docs/project/rules/<name>.md` (Cursor lee `.mdc` por auto-discovery) |
| Windsurf      | Append en `.windsurfrules` (archivo único) con una entrada `## <name>` seguida del contenido incluido o referenciado |
| Aider         | Agregar el path a la lista `read:` en `.aider.conf.yml` |

Sólo Claude está implementado hoy end-to-end (agrega bullet a `CLAUDE.md`). Cursor/Windsurf/Aider quedan definidos aquí para la siguiente iteración.

### 2.3 Hooks

- **Fuente única:** `docs/project/hooks/<name>.sh` (chmod +x)
- **Registro:** sólo Claude Code tiene hooks nativos.

| Agente        | Cómo se registra el hook                                          |
|---------------|-------------------------------------------------------------------|
| Claude Code   | Entry en `.claude/settings.json` bajo `hooks.<EventName>` (ver `add-hook/SKILL.md`) |
| Cursor        | (no soporta hooks — omitir) |
| Windsurf      | (no soporta hooks — omitir) |
| Aider         | (no soporta hooks — omitir) |

**Nota**: fremi-add-hook v1 NO auto-registra el hook — imprime instrucciones porque el usuario elige evento + matcher.

### 2.4 MCP servers

- **Fuente única:** `docs/project/mcp/<name>.json` — un JSON con el shape estándar de `mcpServers.<name>` (transport + command/args/env o url/headers). El skill lo escribe una sola vez y cada agente lo consume desde ahí.
- **Registro:** cada agente lo referencia en su archivo de config.

| Agente        | Cómo se registra el MCP                                           |
|---------------|-------------------------------------------------------------------|
| Claude Code   | Entry en `.claude/settings.json` bajo `mcpServers.<name>` (copia del contenido de la fuente única) |
| Cursor        | Entry en `.cursor/mcp.json` bajo `mcpServers.<name>` (Cursor soporta MCP con shape casi idéntico) |
| Windsurf      | (soporta MCP — pendiente confirmar path del config) |
| Aider         | (no soporta MCP — omitir) |

Como MCP tiene shape muy similar entre Claude y Cursor, la fuente única en `docs/project/mcp/<name>.json` sirve para ambos sin duplicar.

---

## 3. Idempotencia y actualización

- **Los skills `add-*` son idempotentes**: si ya existe la fuente en `docs/project/`, no se sobrescribe salvo con `--force`. Los symlinks/registros faltantes por agente sí se agregan.
- **Reinvocar `fremi-add-<tipo> <name>` después de instalar un agente nuevo** es la forma canónica de "exponerlo también a ese agente" — el skill sólo crea lo que falta.
- **Los skills `delete-*`** iteran sobre todos los agentes detectados y remueven cada registro antes de borrar la fuente única.

---

## 4. Pseudocódigo de referencia

```pseudo
function detectInstalledAgents(projectRoot):
    agents = []
    if exists(projectRoot + "/.claude"):        agents.push("claude")
    if exists(projectRoot + "/.cursor"):        agents.push("cursor")
    if exists(projectRoot + "/.windsurf"):      agents.push("windsurf")
    if exists(projectRoot + "/.aider.conf.yml"):agents.push("aider")
    return agents

function registerAsset(assetType, name, agents):
    for agent in agents:
        method = REGISTRATION_TABLE[assetType][agent]
        if method is None:
            report("• {agent}   (no soporta {assetType} — omitido)")
        else:
            applyRegistration(method, name)
            report("✓ {agent}   {registrationPath(method, name)}")
```
