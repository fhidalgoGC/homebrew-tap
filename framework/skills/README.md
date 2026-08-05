# `docs/frmwk/skills/` — Skills invocables del proyecto

> **Esta carpeta es configuración para los agentes (IA).** Cada subcarpeta contiene un skill ejecutable que el usuario invoca con `/fremi-<nombre>`. La IA carga el `SKILL.md` correspondiente y sigue su procedimiento.
>
> Este README es para humanos: explica qué skills hay, qué hace cada uno, y cómo agregar uno nuevo.

## Convención global — prefijo `fremi-`

**Todos los skills del framework llevan prefijo `fremi-`.** El `name:` del frontmatter de cada `SKILL.md` empieza con `fremi-` y el symlink en `.claude/skills/` también. Esto:

- Evita colisiones con skills de proyecto (los skills en `docs/project/skills/` NO llevan prefijo).
- Deja claro en autocomplete qué skill pertenece a la metodología reusable.
- Simplifica el sweep cuando se instala el framework en un proyecto nuevo.

El skill `/fremi-install-framework` es el responsable de asegurar que todo lo que se instala en `.claude/skills/` respeta esta convención.

---

## Contenido

### Orquestadores por capa

| Skill | Comando | Propósito |
|---|---|---|
| `product/` | `/fremi-product [sub]` | Orquestador de la capa producto — encolan las 7 sub-skills (`fremi-product-iniciativas` → `fremi-product-plan`). |
| `feature/` | `/fremi-feature <nombre>` | Crea una nueva feature (`FT-XX_<slug>/`) con `definition.md`. Valida precondiciones de capa producto. |
| `story/` | `/fremi-story <FT-XX> <nombre>` | Crea una nueva user story (`HU-XX_<slug>/`) con la cadena FW-01..FW-10 en el orden definido por `methodology.json`. |
| `enabler/` | `/fremi-enabler <nombre> [--scope]` | Crea un enabler técnico (global / por feature / por story) con la cadena `EN-01..EN-04`. |
| `tools/` | `/fremi-tools <acción> <tipo> <name>` | Meta-orquestador de scaffolding de assets bajo `docs/project/`. Sub-skills: `fremi-add-{skill,hook,rule,mcp}`, `fremi-delete-{skill,hook,rule,mcp}`. |

### Sub-skills invocables

| Capa | Sub-skills |
|---|---|
| Producto | `fremi-product-iniciativas`, `fremi-product-ideas`, `fremi-product-planteamiento`, `fremi-product-definition`, `fremi-product-strategies`, `fremi-product-adr`, `fremi-product-plan` |
| Feature | `fremi-feature-adr`, `fremi-feature-bug` |
| Story | `fremi-story-explore`, `fremi-story-definition`, `fremi-story-proposal`, `fremi-story-scope`, `fremi-story-bdd`, `fremi-story-sdd`, `fremi-story-design`, `fremi-story-tdd`, `fremi-story-plan`, `fremi-story-task`, `fremi-story-checkwork`, `fremi-story-verify`, `fremi-story-closure-check`, `fremi-story-closure`, `fremi-story-adr`, `fremi-story-bug` |
| Enabler | `fremi-enabler-definition`, `fremi-enabler-design`, `fremi-enabler-plan`, `fremi-enabler-closure` |
| Tools | `fremi-add-skill`, `fremi-add-hook`, `fremi-add-rule`, `fremi-add-mcp`, `fremi-delete-skill`, `fremi-delete-hook`, `fremi-delete-rule`, `fremi-delete-mcp` |

### Globales / auditoría

| Skill | Comando | Propósito |
|---|---|---|
| `sync-check/` | `/fremi-sync-check` | Audita la sincronía entre capas (producto ↔ feature ↔ story). Detecta divergencias para sync-back. Regla 12. |
| `import-template/` | `/fremi-import-template <ruta-origen> [--force]` | Importa un proyecto externo a `/template/`. Excluye `.git/`, `node_modules/`, `dist/`, `.serverless/` y carpetas de agentes. Copia `.env*` aunque estén ignorados. Genera 7 docs en `docs/template/`. |
| `link-template-assets/` | `/fremi-link-template-assets [skills\|rules\|hooks] [--remove]` | Enlaza skills/rules/hooks de `/template/docs/` a `docs/project/` (symlinks, no copias) y los expone al agente. `--remove` invierte la operación sin tocar los assets creados por `/fremi-add-*`. |

### Reverse-engineering

Ubicados en `docs/frmwk/reverse-engineering/`: `fremi-reverse-story`, `fremi-reverse-feature`, `fremi-reverse-bug`, `fremi-reverse-enabler`, `fremi-reverse-product`, `fremi-reverse-extra`. Reconstruyen documentación a partir de código existente sin usar el flow lineal.

### Instalación

Ubicado en `docs/frmwk/installs/`: `fremi-install-framework` — instalador idempotente que asegura la convención `fremi-` al montar los symlinks en `.claude/skills/`.

---

## Estructura interna de cada skill

Cada subcarpeta tiene **un único archivo `SKILL.md`** con frontmatter YAML:

```
docs/frmwk/skills/<nombre>/
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

**Todos los skills que tocan nomenclatura** deben empezar con un `Paso 0 — Cargar configuración (OBLIGATORIO)` que lee `docs/frmwk/settings/methodology.json` y deriva prefijos/formatos de ahí.

Esto evita que los skills tengan hardcoded `FT-01` o `HU-01` — si el usuario cambia la convención en el JSON, los skills se adaptan.

Si el JSON no parsea → **abortar y avisar**. No usar fallbacks hardcoded.

Ver `docs/frmwk/settings/README.md` para la configuración.

---

## Cómo agregar un skill nuevo

1. Elegir un nombre corto en kebab-case (ej: `bug-triage`). El `name:` del frontmatter será `fremi-bug-triage`.
2. Crear la carpeta `docs/frmwk/skills/<nombre>/`.
3. Crear `SKILL.md` con:
   - Frontmatter con `name: fremi-<nombre>` y `description` clara (la IA usa la `description` para decidir cuándo invocarlo).
   - Sección **Sintaxis** con la forma de uso (`/fremi-<nombre> ...`).
   - Sección **Cuándo invocarlo** con triggers explícitos.
   - Sección **Procedimiento** paso a paso. Si toca nomenclatura, incluir el **Paso 0 — Cargar configuración**.
   - Sección **Validaciones** con casos de error.
4. Listar el skill en este README (tabla de Contenido).
5. Si el skill respeta o introduce alguna regla, referenciar la regla aplicable en `docs/frmwk/rules/workflow.md`.
6. El symlink en `.claude/skills/` se llama `fremi-<nombre>` (lo maneja `/fremi-install-framework`).

### Cuándo NO crear un skill

- La tarea se hace bien con un prompt manual breve — no amerita formalizar.
- El comportamiento debería ser **automático** (no invocable por usuario) — eso es un hook (ver `docs/frmwk/hooks/`).
- Es configuración estática — eso va a `docs/frmwk/settings/`.

---

## Cómo modificar un skill existente

- **Cambio de procedimiento** → editar el `SKILL.md`. Si el cambio afecta IDs o nomenclatura, asegurarse de que sigue leyendo `methodology.json` y no hardcodea.
- **Cambio de comando o sintaxis** → coordinar con el usuario (ya tiene memoria del comando viejo). Idealmente mantener compatibilidad o avisar del cambio.
- **Cambio de behavior crítico** (ej: pasa de avisar a bloquear) → mencionar en commit y, si toca, actualizar `docs/frmwk/flows/workflow.md`.

---

## Anti-patrones de esta carpeta

- ❌ Crear skills triviales que sólo hacen una llamada (mejor enseñar al usuario el comando directo).
- ❌ Hardcodear prefijos/formatos de nomenclatura (debe venir de `settings/methodology.json`).
- ❌ Crear skill que duplica función de otro skill (ej: dos formas de crear feature). Si hace falta variar, parametrizar.
- ❌ Skill sin **Validaciones** documentadas (la IA no sabría qué error reportar).
- ❌ Skill que se ejecuta automáticamente (eso es un hook, no un skill).
