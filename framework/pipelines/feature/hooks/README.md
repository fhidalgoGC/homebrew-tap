# `~/.fremi/framework/pipelines/feature/hooks/` — Hooks del pipeline FEATURE

> Hooks del harness del agente que se disparan al invocar
> `/fremi-pipeline-feature`. Verifican precondiciones ANTES de que el pipeline
> arranque.

---

## Hooks disponibles

| Hook | Evento | Reglas | Rol |
|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | R24, R1, R17 | Detecta invocación de `/fremi-pipeline-feature` y verifica: (1) framework instalado, (2) `product/definition.md` con contenido, (3) `product/plan.md` con contenido (para `ancestor.version_at_creation`). |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` lo registra automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/pipelines/feature/hooks/check-pipeline-preconditions.sh" }
        ]
      }
    ]
  }
}
```

---

## Exit codes

- **0** — OK o warning no bloqueante (default). El pipeline puede arrancar.
- **2** — Bloquear (comentado; descomentar `# exit 2` cuando el proyecto
  necesite rigor estricto).

---

## Reglas relacionadas

- **Regla 24** (framework install) → `~/.fremi/framework/rules/framework-mechanics.md`
- **Regla 1** (no salta etapas) → `~/.fremi/framework/rules/hierarchy.md`
- **Regla 17** (versionado + ancestor) → `~/.fremi/framework/rules/versioning.md`
