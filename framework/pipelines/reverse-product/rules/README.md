# `~/.fremi/framework/pipelines/reverse-product/rules/` — Reglas del pipeline REVERSE-PRODUCT

> Reglas operativas del pipeline `/fremi-pipeline-reverse-product`. Gobiernan cuándo
> el pipeline PAUSA para pedir input, qué precondiciones abortan la ejecución, y qué
> reglas del framework aplican durante la reconstrucción de la capa producto.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact product + suma las reglas reverse (R25-R32) + stop events específicos del pipeline. |
| `stop-events.md` | Regla normativa de este pipeline: advertencia de riesgo alto, precondiciones que abortan, cuándo pausa para pedir input al usuario. |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact product

El artifact product tiene sus propias reglas en
`~/.fremi/framework/artifacts/product/rules/`. El pipeline reverse-product **hereda** esas
reglas y las **extiende** con dos dimensiones adicionales:

1. **Rules reverse específicas (R25-R32)**: gobiernan cómo se reconstruyen los docs desde
   código existente — transparent por default, preguntas dirigidas para gaps, no inventar.
   Estas reglas NO aplican al artifact forward.

2. **Stop events de reconstrucción**: cuándo el modo auto del pipeline debe pausar y pedir
   intervención — especialmente para gaps de rationale de negocio (iniciativas, planteamiento,
   criterios de éxito) que no son inferibles del código.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones duras al detectar
una invocación de `/fremi-pipeline-reverse-product` en el prompt. El orquestador (la IA) carga
`applies.yaml` al arrancar el pipeline para resolver qué reglas están activas.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/reverse-engineering/rules/reverse.md` | Reglas R25-R32 del régimen reverse. Fuente de verdad del comportamiento de reconstrucción. |
| `~/.fremi/framework/artifacts/product/rules/` | Reglas domain-específicas del artifact product. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/reverse-product/rules/` | Reglas propias de este pipeline (esta carpeta). |
