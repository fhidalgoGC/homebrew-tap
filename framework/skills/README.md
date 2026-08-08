# `~/.fremi/framework/skills/` — Skills utilitarios (no-artifact)

> **Esta carpeta contiene skills que NO son artifacts SAFe.** Solo utilidades transversales que no encajan en el flujo product → feature → story → enabler.
>
> Los skills que SÍ son artifacts SAFe viven en [`../artifacts/`](../artifacts/) (product, feature, story, enabler, extra). Cada uno con la misma anatomía (SKILL.md + config.core.yaml + config.user.yaml + skills/ + references/).
>
> Este README es para humanos: explica qué skills hay acá, qué hace cada uno, y cómo agregar uno nuevo.

## Convención global — prefijo `fremi-`

**Todos los skills del framework llevan prefijo `fremi-`.** El `name:` del frontmatter de cada `SKILL.md` empieza con `fremi-` y el symlink en `.claude/skills/` también. Esto:

- Evita colisiones con skills de proyecto (los skills en `docs/project/skills/` NO llevan prefijo).
- Deja claro en autocomplete qué skill pertenece a la metodología reusable.
- Simplifica el sweep cuando se instala el framework en un proyecto nuevo.

El skill el CLI `fremi install` es el responsable de asegurar que todo lo que se instala en `.claude/skills/` respeta esta convención.

---

## Contenido de esta carpeta (skills/)

| Skill | Comando | Propósito |
|---|---|---|
| `tools/` | `/fremi-tools <acción> <tipo> <name>` | Meta-orquestador de scaffolding de assets bajo `docs/project/`. Sub-skills: `fremi-add-{skill,hook,rule,mcp}`, `fremi-delete-{skill,hook,rule,mcp}`. |
| `sync-check/` | `/fremi-sync-check` | Audita sincronía entre capas (producto ↔ feature ↔ story) + coherencia de versionado ancestral. Regla 12 + Regla 17. |

## Contenido de `../artifacts/`

Artifacts SAFe (product, feature, story, enabler, extra) — flujo lineal Product Discovery + SDD + BDD + TDD. Cada uno con orquestador + sub-skills. Ver [`../artifacts/`](../artifacts/) para el detalle.

### Sub-skills por capa (viven bajo `../artifacts/<layer>/skills/<sub>/`)

| Capa | Sub-skills |
|---|---|
| Producto | `fremi-product-iniciativas`, `fremi-product-ideas`, `fremi-product-planteamiento`, `fremi-product-definition`, `fremi-product-strategies`, `fremi-product-adr`, `fremi-product-plan` |
| Feature | `fremi-feature-adr`, `fremi-feature-bug` |
| Story | `fremi-story-explore`, `fremi-story-definition`, `fremi-story-proposal`, `fremi-story-scope`, `fremi-story-bdd`, `fremi-story-sdd`, `fremi-story-design`, `fremi-story-tdd`, `fremi-story-plan`, `fremi-story-task`, `fremi-story-checkwork`, `fremi-story-verify`, `fremi-story-closure-check`, `fremi-story-closure`, `fremi-story-adr`, `fremi-story-bug` |
| Enabler | `fremi-enabler-definition`, `fremi-enabler-design`, `fremi-enabler-plan`, `fremi-enabler-closure` |
| Tools (acá en `skills/`) | `fremi-add-skill`, `fremi-add-hook`, `fremi-add-rule`, `fremi-add-mcp`, `fremi-delete-skill`, `fremi-delete-hook`, `fremi-delete-rule`, `fremi-delete-mcp` |

### Reverse-engineering

Ubicados en `~/.fremi/framework/reverse-engineering/`: `fremi-reverse-story`, `fremi-reverse-feature`, `fremi-reverse-bug`, `fremi-reverse-enabler`, `fremi-reverse-product`, `fremi-reverse-extra`. Reconstruyen documentación a partir de código existente sin usar el flow lineal.

### Instalación

El CLI `fremi install` (binario en PATH) es el instalador. Idempotente: recorre `~/.fremi/framework/skills/` + `reverse-engineering/`, monta los symlinks en `.claude/skills/` con prefijo `fremi-`, y actualiza `CLAUDE.md` con las referencias necesarias. No hay slash-command de instalación.

---

## Estructura interna de cada skill

Cada subcarpeta tiene **un único archivo `SKILL.md`** con frontmatter YAML:

```
~/.fremi/framework/skills/<nombre>/
└── SKILL.md
```

El `SKILL.md` empieza con frontmatter que define el comando y descripción:

```yaml
---
name: fremi-feature
description: Crea una nueva feature... (descripción que la IA usa para decidir cuándo invocarlo)
---
```

> **Recordatorio:** el `name:` del frontmatter debe **siempre** empezar por `fremi-` para skills del framework. Los skills de proyecto (`docs/project/skills/`) NO llevan prefijo.

Después del frontmatter va el procedimiento del skill (Markdown).

---

## Convención: Paso 0 — Cargar configuración

**Todos los skills que tocan nomenclatura** deben empezar con un `Paso 0 — Cargar configuración (OBLIGATORIO)` que lee `~/.fremi/framework/settings/methodology.core.yaml` y deriva prefijos/formatos de ahí.

Esto evita que los skills tengan hardcoded `FT-01` o `HU-01` — si el usuario cambia la convención en el JSON, los skills se adaptan.

Si el JSON no parsea → **abortar y avisar**. No usar fallbacks hardcoded.

Ver `~/.fremi/framework/settings/README.md` para la configuración.

---

## Cómo agregar un skill nuevo

1. Elegir un nombre corto en kebab-case (ej: `bug-triage`). El `name:` del frontmatter será `fremi-bug-triage`.
2. Crear la carpeta `~/.fremi/framework/skills/<nombre>/`.
3. Crear `SKILL.md` con:
   - Frontmatter con `name: fremi-<nombre>` y `description` clara (la IA usa la `description` para decidir cuándo invocarlo).
   - Sección **Sintaxis** con la forma de uso (`/fremi-<nombre> ...`).
   - Sección **Cuándo invocarlo** con triggers explícitos.
   - Sección **Procedimiento** paso a paso. Si toca nomenclatura, incluir el **Paso 0 — Cargar configuración**.
   - Sección **Validaciones** con casos de error.
4. Listar el skill en este README (tabla de Contenido).
5. Si el skill respeta o introduce alguna regla, referenciar la regla aplicable en `~/.fremi/framework/rules/workflow.md`.
6. El symlink en `.claude/skills/` se llama `fremi-<nombre>` (lo maneja el CLI `fremi install`).

### Cuándo NO crear un skill

- La tarea se hace bien con un prompt manual breve — no amerita formalizar.
- El comportamiento debería ser **automático** (no invocable por usuario) — eso es un hook (ver `~/.fremi/framework/hooks/`).
- Es configuración estática — eso va a `~/.fremi/framework/settings/`.

---

## Cómo modificar un skill existente

- **Cambio de procedimiento** → editar el `SKILL.md`. Si el cambio afecta IDs o nomenclatura, asegurarse de que sigue leyendo `methodology.core.yaml` y no hardcodea.
- **Cambio de comando o sintaxis** → coordinar con el usuario (ya tiene memoria del comando viejo). Idealmente mantener compatibilidad o avisar del cambio.
- **Cambio de behavior crítico** (ej: pasa de avisar a bloquear) → mencionar en commit y, si toca, actualizar `~/.fremi/framework/flows/workflow.md`.

---

## Anti-patrones de esta carpeta

- ❌ Crear skills triviales que sólo hacen una llamada (mejor enseñar al usuario el comando directo).
- ❌ Hardcodear prefijos/formatos de nomenclatura (debe venir de `settings/methodology.core.yaml`).
- ❌ Crear skill que duplica función de otro skill (ej: dos formas de crear feature). Si hace falta variar, parametrizar.
- ❌ Skill sin **Validaciones** documentadas (la IA no sabría qué error reportar).
- ❌ Skill que se ejecuta automáticamente (eso es un hook, no un skill).
