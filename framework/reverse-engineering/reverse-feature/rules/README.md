# `~/.fremi/framework/reverse-engineering/reverse-feature/rules/` — Reglas del skill REVERSE-FEATURE

> Reglas operativas del skill `/fremi-reverse-feature`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de los docs de feature.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact feature + suma las reglas reverse (R25-R32) + stop events específicos del skill. |
| `stop-events.md` | Regla normativa de este skill: precondiciones que abortan, cuándo pausa (iniciativa, métricas, ADRs sin rationale, capacidades transversales), y sync-back a producto (R12). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact feature

El artifact feature tiene sus propias reglas en
`~/.fremi/framework/artifacts/feature/rules/`. El skill reverse-feature **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde stories
   existentes y código legacy.

2. **Regla 12 explícita**: si durante la reconstrucción se detectan capacidades
   transversales a múltiples features, el skill pausa y sugiere sync-back a producto
   antes de continuar.

---

## Relación con el pipeline equivalente

El pipeline `/fremi-pipeline-reverse-feature` orquesta la reconstrucción completa de
una feature (incluyendo invocar `/fremi-reverse-story` para cada story huérfana). Sus
reglas viven en: `~/.fremi/framework/pipelines/reverse-feature/rules/`

Los stop events del skill son un subconjunto de los del pipeline.
