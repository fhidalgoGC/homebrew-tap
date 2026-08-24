# `~/.fremi/framework/reverse-engineering/reverse-product/rules/` — Reglas del skill REVERSE-PRODUCT

> Reglas operativas del skill `/fremi-reverse-product`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de la capa producto completa.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact product + suma las reglas reverse (R25-R32) + stop events específicos del skill. |
| `stop-events.md` | Regla normativa de este skill: advertencia obligatoria de riesgo alto, precondiciones que abortan, y cuándo pausa (rationale de iniciativas, KPIs, ideas descartadas, ADRs estratégicos). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact product

El artifact product tiene sus propias reglas en
`~/.fremi/framework/artifacts/product/rules/`. El skill reverse-product **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde features/stories
   y código legacy. Especialmente relevante: R26 (transparent default — fuertemente
   recomendado por riesgo de racionalización post-hoc).

2. **Advertencia obligatoria**: antes de arrancar, el skill emite una advertencia sobre
   el riesgo de que las iniciativas reconstruidas sean interpretaciones post-hoc.

---

## Relación con el pipeline equivalente

El pipeline `/fremi-pipeline-reverse-product` orquesta la reconstrucción completa del
producto en modo interactivo por rondas. Sus reglas viven en:
`~/.fremi/framework/pipelines/reverse-product/rules/`

Este skill es la versión directa (sin pipeline de orquestación); sus stop events son
equivalentes a los del pipeline.
