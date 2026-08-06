---
name: fremi-tools
description: Orquestador del namespace `fremi-*` — gestión de assets del proyecto (skills, hooks, rules, MCPs). Los sub-skills siguen el patrón `fremi-<accion>-<recurso>`: por ejemplo `/fremi-add-skill`, `/fremi-delete-hook`, `/fremi-add-mcp`. Reemplaza el viejo `/fremi-tools`. Sin skill directo — invocar los sub-skills.
---

# /fremi — Orquestador del framework fremi

Namespace unificado para **gestión de assets del proyecto**. Reemplaza el viejo `/fremi-tools` con un esquema explícito por acción y recurso.

## Convención de nombres

```
fremi-<accion>-<recurso>
```

- **accion**: `add` | `delete`
- **recurso**: `skill` | `hook` | `rule` | `mcp`

Ejemplos: `/fremi-add-skill`, `/fremi-delete-hook`, `/fremi-add-mcp`, `/fremi-delete-rule`.

---

## Sub-skills disponibles (8)

### Acciones `add` (crear asset nuevo)

| Sub-skill | Rol | Destino |
|---|---|---|
| [`/fremi-add-skill`](./skills/add-skill/SKILL.md) | Crear skill de proyecto | `docs/project/skills/<name>/` + symlink en `.claude/skills/` |
| [`/fremi-add-hook`](./skills/add-hook/SKILL.md) | Crear hook de proyecto | `docs/project/hooks/<name>.sh` + instrucciones registro |
| [`/fremi-add-rule`](./skills/add-rule/SKILL.md) | Crear rule de proyecto | `docs/project/rules/<name>.md` + auto-ref en CLAUDE.md |
| [`/fremi-add-mcp`](./skills/add-mcp/SKILL.md) | Configurar MCP server nuevo | Entry en `.claude/settings.json` bajo `mcpServers` |

### Acciones `delete` (remover asset)

| Sub-skill | Rol |
|---|---|
| [`/fremi-delete-skill`](./skills/delete-skill/SKILL.md) | Eliminar skill de proyecto (+ symlink) |
| [`/fremi-delete-hook`](./skills/delete-hook/SKILL.md) | Eliminar hook + su registro en settings.json |
| [`/fremi-delete-rule`](./skills/delete-rule/SKILL.md) | Eliminar rule + referencia en CLAUDE.md |
| [`/fremi-delete-mcp`](./skills/delete-mcp/SKILL.md) | Remover MCP server de settings.json |

---

## Cuándo usar

- El usuario dice "agregá un skill para X", "necesitamos un hook que…", "sumá esta regla al proyecto", "conectá el MCP de Y".
- Requiere eliminar un asset del proyecto (skill/hook/rule/mcp) que ya no se necesita.

**No usar**: para asets de metodología (`~/.fremi/framework/framework/`) — esos se editan a mano.

---

## Scope

- **`add-skill`, `add-hook`, `add-rule`**: por default crean en `docs/project/` (project-scoped). Con `--scope frmwk` (avanzado, no recomendado) puede tocar `~/.fremi/framework/framework/`.
- **`add-mcp`, `delete-mcp`**: modifican `.claude/settings.json` (config del agente).
- **`delete-*`**: por default sólo elimina de `docs/project/`. Con `--force` puede eliminar de `~/.fremi/framework/framework/` (peligroso).

---

## Migración desde `/fremi-tools`

Skill viejo `/fremi-tools <type> <name>` → equivalente nuevo:

| Antes | Ahora |
|---|---|
| `/fremi-tools skill <name>` | `/fremi-add-skill <name>` |
| `/fremi-tools hook <name>` | `/fremi-add-hook <name>` |
| `/fremi-tools rule <name>` | `/fremi-add-rule <name>` |

Nuevas capacidades no disponibles en `/fremi-tools`:
- `/fremi-add-mcp <name>` — MCPs (nuevo tipo).
- `/fremi-delete-*` — remoción explícita (antes no había skill).

---

## Referencias

- Regla 21 (Skills organizados jerárquicamente por capa).
- Sub-skills bajo [`skills/`](./skills/).
- CLAUDE.md — configuración del agente que este skill mantiene.
- `.claude/settings.json` — donde se registran hooks + MCPs.
