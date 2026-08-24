# `~/.fremi/framework/pipelines/reverse-feature/rules/` — Reglas del pipeline REVERSE-FEATURE

> Reglas operativas del pipeline `/fremi-pipeline-reverse-feature`. Gobiernan cuándo
> el pipeline PAUSA para pedir input, qué precondiciones abortan la ejecución, y qué
> reglas del framework aplican durante la reconstrucción de la capa feature.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact feature + suma las reglas reverse (R25-R32) + stop events específicos del pipeline. |
| `stop-events.md` | Regla normativa de este pipeline: precondiciones que abortan, cuándo pausa para pedir input (stories ambiguas, iniciativa faltante, conflictos). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact feature

El artifact feature tiene sus propias reglas en
`~/.fremi/framework/artifacts/feature/rules/`. El pipeline reverse-feature **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde código — transparent
   por default, preguntas dirigidas para gaps no-inferibles (iniciativa, stories ambiguas).

2. **Sync-back activo (R12)**: durante la reconstrucción de `definition.md`, si se detectan
   capacidades transversales se pausa para sugerir sync-back a producto. Este stop event es
   específico del pipeline reverse (el forward tiene el mismo comportamiento pero no es un stop event
   de pipeline).

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones duras al detectar
una invocación de `/fremi-pipeline-reverse-feature` en el prompt. El orquestador (la IA) carga
`applies.yaml` al arrancar el pipeline para resolver qué reglas están activas.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/reverse-engineering/rules/reverse.md` | Reglas R25-R32 del régimen reverse. Fuente de verdad del comportamiento de reconstrucción. |
| `~/.fremi/framework/artifacts/feature/rules/` | Reglas domain-específicas del artifact feature. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/reverse-feature/rules/` | Reglas propias de este pipeline (esta carpeta). |
