# `~/.fremi/framework/artifacts/story/hooks/` — Hooks STORY-DOMAIN

> Hooks del harness del agente que aplican **exclusivamente al workflow de story**. Verifican reglas domain-específicas (cadena de docs, checkwork, TDD, closure) sin cargar contexto de otras capas.

Cada hook lee su fuente de verdad de los archivos del dominio story:
- `~/.fremi/framework/artifacts/story/workflow.yaml` — secuencia + DAG
- `~/.fremi/framework/artifacts/story/config.core.yaml` — agent matrix
- `~/.fremi/framework/artifacts/story/config.user.yaml` — user choices (o `.fremi/settings/story/config.user.yaml` en el proyecto)
- `~/.fremi/framework/artifacts/story/rules/*.md` — reglas domain
- `~/.fremi/framework/artifacts/story/rules/applies.yaml` — mapping step→rules
- `~/.fremi/framework/settings/methodology.core.yaml` — filenames reales (nombres de archivos del workflow)

Los hooks CROSS-DOMAIN (Regla 17 versioning, frontmatter, ancestor coherence, session audit) viven en `~/.fremi/framework/hooks/`.

---

## Convención de identificadores (importante)

Los hooks NO hardcodean filenames del workflow (prefijos como `FW-`, `EN-`, `BG-`, `EX-` son configurables). Cada hook usa el helper `_workflow-filenames.sh` para resolver filenames desde `methodology.core.yaml` en runtime.

Los matchers en `.claude/settings.json` usan globs amplios (`**/user-stories/*/FW-*.md`) que aguantan cambios de padding. Ver `.claude/rules/no-hardcoded-identifiers.md`.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Regla | Rol |
|---|---|---|---|---|
| `check-workflow-sequence.sh` | PreToolUse | `Write` en `**/user-stories/*/<workflow-doc-glob>` | R1 + R16 | Verifica que los docs previos obligatorios de la cadena existen y tienen contenido antes de crear un doc posterior. Lee la cadena desde `methodology.core.yaml → layers.story.files_in_order`. |
| `check-conditional-docs.sh` | PreToolUse | `Write` en `**/user-stories/*/<workflow-doc-glob>` | R16 | Cuando se crea el doc `explore` o `proposal`, recuerda que son condicionales — se crean sólo si aplica al menos un criterio de `conditional_rules`. Detecta el step por filename resuelto desde methodology. |
| `sync-checkwork.sh` | PostToolUse | `Edit\|Write` en `**/user-stories/*/<workflow-doc-glob>` | R13 | Recordatorio: al editar el doc `plan`, actualizar el doc `checkwork` de la misma story. |
| `check-strict-tdd.sh` | PostToolUse | `Write` en `src/**/*.ts` (o path de código del proyecto) | R2, R7 | Si `testing.strict_tdd: true`, verifica que exista archivo de test asociado al código escrito. |
| `check-closure-precondition.sh` | PreToolUse | `Write` en `**/user-stories/*/<workflow-doc-glob>` | R11, R13 | Antes de firmar el doc `closure`: verifica que existe el doc `checkwork` y que el doc `plan` no tiene tasks `[ ]` ni `[/]`. |

> `<workflow-doc-glob>` — glob amplio que matchea cualquier doc del workflow story según la convención vigente. Con los defaults es `FW-*.md`. Los hooks verifican internamente si el filename corresponde a un step conocido.

Además del helper `_workflow-filenames.sh` (biblioteca, no un hook — `source`-only).

---

## Cómo registrar en `.claude/settings.json`

`fremi install` los registra automáticamente cuando el proyecto tiene la capa story activa. Registro manual (usar globs amplios para aguantar cambios de padding/prefijo):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/artifacts/story/hooks/check-workflow-sequence.sh" },
          { "type": "command", "command": "~/.fremi/framework/artifacts/story/hooks/check-conditional-docs.sh" },
          { "type": "command", "command": "~/.fremi/framework/artifacts/story/hooks/check-closure-precondition.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/artifacts/story/hooks/sync-checkwork.sh" },
          { "type": "command", "command": "~/.fremi/framework/artifacts/story/hooks/check-strict-tdd.sh" }
        ]
      }
    ]
  }
}
```

---

## Exit codes

- **0** — OK o warning no bloqueante (default).
- **2** — Bloquear con feedback (comentado en cada hook; descomentar la línea `# exit 2` cuando el proyecto esté listo para el rigor).

---

## Convención de header

Cada hook empieza con un bloque header que declara:
- **DOMAIN**: story (siempre acá).
- **Reglas aplicadas**: pointers a `~/.fremi/framework/artifacts/story/rules/*.md` y/o a las cross-domain en `~/.fremi/framework/rules/*.md`.
- **Fuente de verdad**: qué archivo del dominio lee (workflow.yaml, config.user.yaml, methodology.core.yaml).
- **Convención de identificadores**: cómo resuelve filenames sin hardcodear.

---

## Cuándo crear un hook nuevo story-domain

- La regla que verifica vive en `~/.fremi/framework/artifacts/story/rules/`.
- La lógica lee de archivos del dominio story (`workflow.yaml`, `config.user.yaml`) o del helper de filenames.
- El matcher es específico a paths story (`user-stories/` es el mejor discriminador — el resto de la ruta se resuelve internamente).

Si el hook aplica a más de una capa → va a `~/.fremi/framework/hooks/` (cross-domain).
