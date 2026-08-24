# `~/.fremi/framework/pipelines/story/hooks/` — Hooks del pipeline STORY

> Hooks del harness del agente que se disparan al invocar
> `/fremi-pipeline-story`. Verifican precondiciones ANTES de que el pipeline
> arranque.

---

## Hooks disponibles

| Hook | Evento | Reglas | Rol |
|---|---|---|---|
| `check-pipeline-preconditions.sh` | UserPromptSubmit | R24, R1, R17 | Detecta invocación de `/fremi-pipeline-story` y verifica: (1) framework instalado, (2) `product/definition.md` con contenido, (3) `product/plan.md` existe, (4) feature referenciada en el prompt existe con `definition.md` real y con frontmatter versionado. |

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
          { "type": "command", "command": "~/.fremi/framework/pipelines/story/hooks/check-pipeline-preconditions.sh" }
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

## Notas de diseño

El hook extrae el FEATURE_ID del prompt sin hardcodear el prefijo (como "FT-").
Busca la carpeta en `docs/works/features/` que contenga el token. Si no puede
inferir el FEATURE_ID con certeza, omite el check específico de feature para
evitar falsos positivos — la IA detectará la precondición faltante al arrancar
el pipeline.

---

## Reglas relacionadas

- **Regla 24** (framework install) → `~/.fremi/framework/rules/framework-mechanics.md`
- **Regla 1** (no salta etapas) → `~/.fremi/framework/rules/hierarchy.md`
- **Regla 17** (versionado + ancestor) → `~/.fremi/framework/rules/versioning.md`
