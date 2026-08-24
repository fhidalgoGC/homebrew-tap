# `~/.fremi/framework/pipelines/reverse-enabler/hooks/` — Hooks del pipeline REVERSE-ENABLER

> Hooks del harness del agente que aplican al pipeline `/fremi-pipeline-reverse-enabler`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-pipeline-reverse-enabler` | R24, R25, R30, R15 | Verifica framework instalado, git history disponible, y upper-layer correcta según scope declarado (global/feature/story). |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/pipelines/reverse-enabler/hooks/check-pipeline-preconditions.sh" }
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

- **Scope variable**: este es el único pipeline reverse con 3 scopes posibles (global /
  feature / story). El hook extrae el scope del prompt para verificar la upper-layer correcta.
  Sin `--scope`: default `global` — no se verifica upper-layer.
- **R25**: artifacts identificables (IaC, packages, layers, scripts, workflows) — la
  validación de artefactos concretos la hace el orquestador en fase 0, no este hook.
- **R30**: la ausencia de `.git/` genera un warning pero no aborta. Los timestamps se
  infieren como "hoy" con `confidence: 0.3`.
- **Numeración del enabler**: la numeración global (formato configurable en methodology) la resuelve el orquestador
  (no el hook). Si hay múltiples enablers a reconstruir simultáneamente, correr el
  pipeline secuencialmente para evitar colisiones.
