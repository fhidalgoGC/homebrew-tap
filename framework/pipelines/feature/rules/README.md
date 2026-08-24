# `~/.fremi/framework/pipelines/feature/rules/` — Reglas del pipeline FEATURE

> Reglas operativas del pipeline `/fremi-pipeline-feature`. Estos archivos
> gobiernan cuándo el pipeline PAUSA y qué reglas del framework aplican
> durante la orquestación de la capa FEATURE.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: qué reglas están activas. Hereda el `applies.yaml` del artifact feature + agrega las reglas propias del pipeline (stop events). |
| `stop-events.md` | Regla normativa de este pipeline: cuándo pausa, qué precondiciones abortan, anti-patrones. |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact

El artifact feature tiene sus propias reglas en
`~/.fremi/framework/artifacts/feature/rules/`. El pipeline **hereda** esas
reglas y las **extiende** con:

1. **Stop events específicos**: cuándo el modo automático debe pausar y pedir
   intervención del usuario. Clave para feature: sync-back a producto (R12),
   colisión de feature con existente, prioridad en roadmap desconocida.

2. **Precondiciones del pipeline**: condiciones que deben cumplirse ANTES de
   arrancar — capa producto lista (`product/definition.md` + `product/plan.md`
   con contenido real) y R24 install.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones
duras al detectar una invocación de `/fremi-pipeline-feature` en el prompt.
El orquestador (la IA) carga `applies.yaml` al arrancar para resolver qué
reglas están activas.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/rules/` | Reglas cross-domain. Referenciadas desde `applies.yaml`. |
| `~/.fremi/framework/artifacts/feature/rules/` | Reglas domain-específicas del artifact feature. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/feature/rules/` | Reglas propias del pipeline (esta carpeta). |
