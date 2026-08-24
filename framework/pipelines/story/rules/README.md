# `~/.fremi/framework/pipelines/story/rules/` — Reglas del pipeline STORY

> Reglas operativas del pipeline `/fremi-pipeline-story`. Estos archivos
> gobiernan cuándo el pipeline PAUSA y qué reglas del framework aplican
> durante la orquestación de la planificación de una story (steps 0..8).

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: qué reglas están activas. Hereda el `applies.yaml` del artifact story + agrega las reglas propias del pipeline (stop events). |
| `stop-events.md` | Regla normativa de este pipeline: cuándo pausa, qué precondiciones abortan, anti-patrones. El pipeline story tiene el conjunto más amplio de stop events de los 3 pipelines forward, por la densidad de bifurcaciones técnicas en SDD y Design. |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact

El artifact story tiene sus propias reglas en
`~/.fremi/framework/artifacts/story/rules/`. El pipeline **hereda** esas
reglas y las **extiende** con:

1. **Stop events específicos**: cuándo el modo automático debe pausar. Para
   story hay 7 stop events capa-específicos (vs 4 para product y 4 para
   feature), porque la story involucra decisiones técnicas concretas en SDD y
   Design (R3b) y evaluación de conditionals (R16).

2. **Precondiciones del pipeline**: feature existente con `definition.md` real
   y frontmatter versionado (R17), además de R24 install.

3. **Alcance limitado**: el pipeline cubre sólo los steps 0..8
   (planificación). Los steps 9..12 (checkwork, verify, closure-check,
   closure) son post-pipeline y corren en modo iterativo manual. Las reglas
   para esos steps siguen vigentes — las aplica el artifact, no el pipeline.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones
duras al detectar una invocación de `/fremi-pipeline-story` en el prompt.
El orquestador (la IA) carga `applies.yaml` al arrancar para resolver qué
reglas están activas durante los steps de planificación.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/rules/` | Reglas cross-domain. Referenciadas desde `applies.yaml`. |
| `~/.fremi/framework/artifacts/story/rules/` | Reglas domain-específicas del artifact story (cadena BDD→SDD→Design, checkwork, closure…). Este pipeline las **hereda** para los steps cubiertos. |
| `~/.fremi/framework/pipelines/story/rules/` | Reglas propias del pipeline (esta carpeta). |
