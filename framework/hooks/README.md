# `~/.fremi/framework/hooks/` — Hooks CROSS-DOMAIN

> **Esta carpeta es configuración del entorno del agente.** Los hooks son scripts bash que el harness del agente ejecuta **automáticamente** en respuesta a eventos.
>
> Ejecutan al recibir input del usuario, al editar/crear archivos, al terminar sesión, etc. El usuario NO los invoca — se disparan solos según registro en `.claude/settings.json`.
>
> Por default **AVISAN pero NO bloquean** (exit 0). Se pueden habilitar para bloquear (exit 2) descomentando líneas específicas.

---

## Convención de identificadores (importante)

Los hooks NO hardcodean filenames del workflow (prefijos como `FW-`, `EN-`, `BG-`, `EX-` son configurables). Cada hook usa el helper `_methodology.sh` para resolver filenames desde `~/.fremi/framework/settings/methodology.core.yaml` en runtime.

Los matchers en `.claude/settings.json` usan globs amplios que aguantan cambios de padding/prefijo. Ver `.claude/rules/no-hardcoded-identifiers.md`.

---

## Estructura de hooks — 2 niveles

Los hooks del framework se distribuyen en **dos niveles** por dominio (mismo patrón que rules):

### 1. Cross-domain (esta carpeta — `~/.fremi/framework/hooks/`)

Hooks que aplican a **más de un artifact** o al entorno del agente en general (session-level, versioning transversal, frontmatter común, reverse).

### 2. Domain-específicos (dentro de cada artifact)

Hooks que aplican **sólo a un artifact**. Viven en `~/.fremi/framework/artifacts/<capa>/hooks/`. El harness los carga cuando la capa correspondiente está activa.

- **Story**: `~/.fremi/framework/artifacts/story/hooks/` (5 hooks — ver su README).
- **Product**: `~/.fremi/framework/artifacts/product/hooks/` (1 hook — `check-product-sequence.sh` para R1 + R4).
- **Feature**: `~/.fremi/framework/artifacts/feature/hooks/` (2 hooks — `check-feature-preconditions.sh` para R1+R17, `check-feature-decisions.sh` para R15).
- **Enabler, extra**: pendientes.

---

## Hooks cross-domain (esta carpeta)

### P1 — Regla 17 (versionado + linaje) — críticos, aplican a TODO artifact

| Hook | Evento | Matcher sugerido | Rol |
|---|---|---|---|
| `check-frontmatter.sh` | PostToolUse | Edit/Write en `docs/works/**/*.md` | Verifica frontmatter con campos obligatorios |
| `check-version-bump.sh` | PostToolUse | Edit en `docs/works/**/*.md` | Verifica versión aumentó (docs living) |
| `check-changelog-entry.sh` | PostToolUse | Edit en `docs/works/**/*.md` | Verifica entry en `## Changelog` |
| `check-parent-bump-on-closure.sh` | PostToolUse | Edit en `**/user-stories/*/*.md\|**/enablers/*/*.md` | Verifica que padre bumpeó al firmar el closure de story o enabler. Detecta el filename de closure dinámicamente vía `_methodology.sh`. |
| `check-ancestor-coherence.sh` | PostToolUse | Edit/Write en `docs/works/**/*.md` | Verifica `ancestor.version_at_creation` es válida. Resuelve prefijos de feature/story y filename de definition vía `_methodology.sh`. |

### P2 — Testing y auditoría transversal

| Hook | Evento | Rol |
|---|---|---|
| `audit-on-stop.sh` | Stop | Auditoría ligera al final de la sesión. Resuelve filenames de closure y checkwork dinámicamente vía `_methodology.sh`. |

### Helper compartido

| Archivo | Rol |
|---|---|
| `_methodology.sh` | **Biblioteca `source`-only** (no un hook). Resuelve filenames por capa desde `methodology.core.yaml`. Expone `meth_load_layer`, `meth_layer_file_by_name`, `meth_is_closure_file`, `meth_is_story_workflow_file`, etc. Bash 3.2+ compat. Usado por los 4 hooks cross-domain que necesitan conocer filenames por dominio. |

### P3 — Reverse-engineering (Regla 25-32)

| Hook | Evento | Rol |
|---|---|---|
| `check-reverse-alignment.sh` | PostToolUse | Valida frontmatter reverse, confidence, recuerda parent bump, reporta ratio reverse/forward |

### P4 — Estado del flujo (transversal a capas)

| Hook | Evento | Rol |
|---|---|---|
| `check-workflow-stage.sh` | UserPromptSubmit | Reporta estado del flujo por capa (product, feature, story, enabler, extra) |

---

## Hooks story-domain (movidos)

Los siguientes hooks vivían acá y se movieron a `~/.fremi/framework/artifacts/story/hooks/` porque son story-específicos:

| Hook | Nueva ubicación | Regla story |
|---|---|---|
| `check-flow-preconditions.sh` → `check-workflow-sequence.sh` | `artifacts/story/hooks/` | R1 + R16 (FW-XX chain) |
| `sync-checkwork.sh` | `artifacts/story/hooks/` | R13 (checkwork living) |
| `check-strict-tdd.sh` | `artifacts/story/hooks/` | R2, R7 (SDD+TDD, test rojo) |

Además se crearon **nuevos** hooks story-domain: `check-conditional-docs.sh` (R16), `check-closure-precondition.sh` (R11+R13). Ver `artifacts/story/hooks/README.md`.

---

## Cómo se registran

`fremi install` (vía `fremi agent install`) registra automáticamente **TODOS** los hooks del framework — los cross-domain de acá y los domain-específicos de cada capa, pipeline y reverse-skill. El registro vive en el plugin de Claude Code, no en el `.claude/settings.json` del proyecto:

```
~/.claude/plugins/cache/fremi/fremi/<version>/hooks/hooks.json
```

El instalador descubre los hooks recorriendo el árbol del framework y lee de cada script su header (`# Tipo:` → evento, `# Matcher (sugerido):` → matcher) para wirearlo al evento correcto. Consecuencias:

- **Agregar un hook nuevo no requiere tocar el CLI**: creá el `.sh` con su header `# Tipo:` en cualquier carpeta `hooks/` del framework y corré `fremi agent install`.
- Un script sin header `# Tipo:` válido **no se registra** (el instalador lo reporta como skipped).
- Archivos con prefijo `_` (ej: `_methodology.sh`) se ignoran: son librerías `source`-only, no hooks.

Registro manual en `.claude/settings.json` (sólo si querés hooks a nivel proyecto) — ejemplo con los cross-domain de acá:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/hooks/check-frontmatter.sh" },
          { "type": "command", "command": "~/.fremi/framework/hooks/check-version-bump.sh" },
          { "type": "command", "command": "~/.fremi/framework/hooks/check-changelog-entry.sh" },
          { "type": "command", "command": "~/.fremi/framework/hooks/check-parent-bump-on-closure.sh" },
          { "type": "command", "command": "~/.fremi/framework/hooks/check-ancestor-coherence.sh" }
        ]
      }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "~/.fremi/framework/hooks/check-workflow-stage.sh" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "~/.fremi/framework/hooks/audit-on-stop.sh" } ] }
    ]
  }
}
```

Los hooks domain-específicos se registran adicionalmente desde cada `artifacts/<capa>/hooks/README.md`.

---

## Dependencias

- **`jq`** — para parsear el JSON payload de los hooks (todos lo usan).
- **`git`** — sólo `check-version-bump.sh` lo usa para comparar con HEAD.

Sin `jq` los hooks salen silenciosamente sin bloquear.

---

## Exit codes

- **0** — OK o no aplicable. Continúa normal (default de todos).
- **1** — Error del hook.
- **2** — Bloquear con feedback (comentado por default; descomentar para hacer bloqueantes).

**Para bloquear un hook específico**: descomentar la línea `# exit 2` en el hook. Sólo hacerlo si el proyecto está listo para el rigor.

---

## Reglas cross-domain relacionadas

- **Regla 17** — versionado + linaje → `check-frontmatter`, `check-version-bump`, `check-changelog-entry`, `check-parent-bump-on-closure`, `check-ancestor-coherence`.
- **Reglas 25-32** — reverse → `check-reverse-alignment`.

Reglas story-específicas (R1 en FW-XX, R2, R7, R11, R13, R16) se verifican con hooks en `artifacts/story/hooks/`.
