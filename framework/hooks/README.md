# `~/.fremi/framework/hooks/` — Hooks del framework

> **Esta carpeta es configuración del entorno del agente.** Los hooks son scripts bash que el harness del agente ejecuta **automáticamente** en respuesta a eventos.
>
> Ejecutan al recibir input del usuario, al editar/crear archivos, al terminar sesión, etc. El usuario NO los invoca — se disparan solos según registro en `.claude/settings.json`.
>
> Por default **AVISAN pero NO bloquean** (exit 0). Se pueden habilitar para bloquear (exit 2) descomentando líneas específicas.

---

## Hooks disponibles (10 total)

### P1 — Regla 17 (versionado + linaje) — críticos

| Hook | Evento | Matcher sugerido | Rol |
|---|---|---|---|
| `check-frontmatter.sh` | PostToolUse | Edit/Write en `docs/works/**/*.md` | Verifica frontmatter con campos obligatorios |
| `check-version-bump.sh` | PostToolUse | Edit en `docs/works/**/*.md` | Verifica versión aumentó (docs living) |
| `check-changelog-entry.sh` | PostToolUse | Edit en `docs/works/**/*.md` | Verifica entry en `## Changelog` |
| `check-parent-bump-on-closure.sh` | PostToolUse | Edit en `**/FW-10_closure.md`, `**/EN-04_closure.md` | Verifica que padre bumpeó al firmar |

### P2 — Flow compliance (Regla 1)

| Hook | Evento | Matcher sugerido | Rol |
|---|---|---|---|
| `check-flow-preconditions.sh` | PreToolUse | Write en `**/user-stories/*/FW-*.md` | Verifica docs previos existen |
| `check-ancestor-coherence.sh` | PostToolUse | Edit/Write en `docs/works/**/*.md` | Verifica `ancestor.version_at_creation` es válida |

### P3 — Testing y auditoría

| Hook | Evento | Matcher sugerido | Rol |
|---|---|---|---|
| `check-strict-tdd.sh` | PostToolUse | Write en `src/**/*.ts` | Verifica test asociado si `strict_tdd: true` |
| `audit-on-stop.sh` | Stop | (n/a) | Auditoría ligera al final de la sesión |

### P4 — Reverse-engineering (Regla 25-32)

| Hook | Evento | Matcher sugerido | Rol |
|---|---|---|---|
| `check-reverse-alignment.sh` | PostToolUse | Edit/Write en `docs/works/**/*.md` | Valida frontmatter reverse, confidence, recuerda parent bump, reporta ratio reverse/forward (Regla 32) |

### Existentes

| Hook | Evento | Rol |
|---|---|---|
| `check-workflow-stage.sh` | UserPromptSubmit | Reporta estado del flujo por capas |
| `sync-checkwork.sh` | PostToolUse (Edit/Write en FW-08_plan.md) | Recordatorio: actualizá FW-09_checkwork |

---

## Cómo registrar en `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-frontmatter.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-version-bump.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-changelog-entry.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-parent-bump-on-closure.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-ancestor-coherence.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-strict-tdd.sh" },
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/sync-checkwork.sh" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-flow-preconditions.sh" }
        ]
      }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/check-workflow-stage.sh" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "${PROJECT_ROOT}/~/.fremi/framework/hooks/audit-on-stop.sh" } ] }
    ]
  }
}
```

Sustituir `${PROJECT_ROOT}` por el path absoluto del proyecto.

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

## Reglas relacionadas

- **Regla 1** — precondiciones entre etapas → `check-flow-preconditions.sh`.
- **Regla 7** — TDD rojo primero → `check-strict-tdd.sh`.
- **Regla 13** — checkwork al día → `sync-checkwork.sh`.
- **Regla 17** — versionado + linaje → `check-frontmatter`, `check-version-bump`, `check-changelog-entry`, `check-parent-bump-on-closure`, `check-ancestor-coherence`.
