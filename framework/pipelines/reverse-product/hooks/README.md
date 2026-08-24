# `~/.fremi/framework/pipelines/reverse-product/hooks/` — Hooks del pipeline REVERSE-PRODUCT

> Hooks del harness del agente que aplican al pipeline `/fremi-pipeline-reverse-product`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-pipeline-reverse-product` | R24, R25, R30 | Verifica framework instalado, git history disponible y materia prima de features existente antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/pipelines/reverse-product/hooks/check-pipeline-preconditions.sh" }
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

- **R25**: este hook verifica que hay features identificables como materia prima. Sin features,
  reverse-product no puede inferir iniciativas ni capacidades del producto.
- **R30**: verifica presencia de `.git/`. Sin git history, los timestamps se infieren como "hoy"
  con `reverse_engineered_confidence: 0.3` — el hook lo advierte, no aborta.
- **Riesgo alto**: reverse-product es el pipeline de mayor riesgo por racionalización post-hoc.
  La advertencia obligatoria la muestra el PIPELINE.md al arrancar, no este hook.
