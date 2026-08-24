# `~/.fremi/framework/pipelines/reverse-story/hooks/` — Hooks del pipeline REVERSE-STORY

> Hooks del harness del agente que aplican al pipeline `/fremi-pipeline-reverse-story`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-pipeline-reverse-story` | R24, R25, R30 | Verifica framework instalado, git history disponible y carpeta de features existente antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/pipelines/reverse-story/hooks/check-pipeline-preconditions.sh" }
        ]
      }
    ]
  }
}
```

---

## Exit codes

- **0** — OK o warning no bloqueante (default). El hook informa pero no impide la ejecución.
- **2** — Bloqueante (comentado en el script). Descomentar `# exit 2` para rigor estricto.

---

## Notas reverse-específicas

- **Upper-layer**: la feature padre debe existir antes de reconstruir la story. El hook verifica
  que `docs/works/features/` existe; la validación del feature ID específico la hace el
  orquestador en su fase 0 (descubrimiento).
- **R29 (Regla 8 inconstruible)**: este hook no detecta bugs previos — esa detección ocurre
  durante la fase 0 del pipeline. El stop event correspondiente está en `stop-events.md`.
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta — el
  orquestador puede continuar con timestamps como "hoy" y `confidence: 0.3`.
