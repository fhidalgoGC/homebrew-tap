# `~/.fremi/framework/pipelines/reverse-enabler/rules/` — Reglas del pipeline REVERSE-ENABLER

> Reglas operativas del pipeline `/fremi-pipeline-reverse-enabler`. Gobiernan cuándo
> el pipeline PAUSA para pedir input, qué precondiciones abortan la ejecución, y qué
> reglas del framework aplican durante la reconstrucción de los 4 docs del enabler
> (definition, design, plan, closure — por default `EN-01..EN-04`).

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact enabler + suma las reglas reverse (R25-R32) + stop events específicos del pipeline. |
| `stop-events.md` | Regla normativa de este pipeline: precondiciones que abortan, cuándo pausa (scope ambiguo, numeración de enabler, features vinculadas, ADRs retroactivos). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact enabler

El artifact enabler tiene sus propias reglas en
`~/.fremi/framework/artifacts/enabler/rules/`. El pipeline reverse-enabler **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde IaC, packages y
   git history. Transparent por default. Preguntas dirigidas para gaps no-inferibles (scope,
   features/stories habilitadas, rationale de ADRs técnicos).

2. **Scope variable**: enabler puede ser global, feature-scoped o story-scoped (Regla 15).
   El stop event de "scope ambiguo" es específico de reverse porque en el flow forward el
   scope se declara al crear el enabler. En reverse debe inferirse.

3. **Regla 29 N/A para enabler**: a diferencia de story-reverse (donde R29 marca la limitación
   para bugs), en enabler-reverse Regla 29 no aplica directamente — pero si el enabler nació
   como fix de un bug de infra, se marca la limitación y se sugiere `/fremi-reverse-bug`.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones duras al detectar
una invocación de `/fremi-pipeline-reverse-enabler` en el prompt. El orquestador (la IA) carga
`applies.yaml` al arrancar el pipeline para resolver qué reglas están activas.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/reverse-engineering/rules/reverse.md` | Reglas R25-R32 del régimen reverse. Fuente de verdad del comportamiento de reconstrucción. |
| `~/.fremi/framework/artifacts/enabler/rules/` | Reglas domain-específicas del artifact enabler. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/reverse-enabler/rules/` | Reglas propias de este pipeline (esta carpeta). |
