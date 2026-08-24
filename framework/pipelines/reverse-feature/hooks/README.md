# `~/.fremi/framework/pipelines/reverse-feature/hooks/` — Hooks del pipeline REVERSE-FEATURE

> Hooks del harness del agente que aplican al pipeline `/fremi-pipeline-reverse-feature`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-pipeline-reverse-feature` | R24, R25, R30 | Verifica framework instalado, git history disponible y estructura docs/works/ antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/pipelines/reverse-feature/hooks/check-pipeline-preconditions.sh" }
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

- **R25**: el feature ID lo pasa el usuario como argumento al invocar el pipeline. El hook no
  valida el ID específico — lo hace el orquestador al arrancar la fase 0 (descubrimiento).
- **R30**: la ausencia de `.git/` no aborta — genera un warning de confidence baja. El pipeline
  puede continuar con timestamps inferidos como "hoy".
- **Upper-layer**: reverse-feature puede correr sin capa producto ya reconstruida. Si la iniciativa
  no existe, el pipeline pausa y pregunta (Regla 27 en stop-events.md), no aborta.
