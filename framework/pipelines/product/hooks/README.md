# `~/.fremi/framework/pipelines/product/hooks/` — Hooks del pipeline PRODUCT

> Hooks del harness del agente que se disparan al invocar
> `/fremi-pipeline-product`. Verifican precondiciones ANTES de que el pipeline
> arranque.

---

## Hooks disponibles

| Hook | Evento | Reglas | Rol |
|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | R24 | Detecta invocación de `/fremi-pipeline-product` y verifica que el framework está instalado (symlink + CLAUDE.md). Product es la capa raíz — no tiene upper-layer que verificar. |

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
          { "type": "command", "command": "~/.fremi/framework/pipelines/product/hooks/check-pipeline-preconditions.sh" }
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
  necesite rigor estricto en precondiciones).

---

## Reglas relacionadas

- **Regla 24** (framework install) → `~/.fremi/framework/rules/framework-mechanics.md`
- **Regla 1** (no salta etapas) → `~/.fremi/framework/rules/hierarchy.md`
