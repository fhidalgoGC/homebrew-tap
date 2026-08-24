# `~/.fremi/framework/pipelines/product/rules/` — Reglas del pipeline PRODUCT

> Reglas operativas del pipeline `/fremi-pipeline-product`. Estos archivos
> gobiernan cuándo el pipeline PAUSA y qué reglas del framework aplican
> durante la orquestación de la capa PRODUCTO.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: qué reglas están activas. Hereda el `applies.yaml` del artifact product + agrega las reglas propias del pipeline (stop events). |
| `stop-events.md` | Regla normativa de este pipeline: cuándo pausa, qué precondiciones abortan, anti-patrones. |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact

El artifact product tiene sus propias reglas en
`~/.fremi/framework/artifacts/product/rules/`. El pipeline **hereda** esas
reglas (las mismas aplican cuando el pipeline orquesta el artifact) y las
**extiende** con dos dimensiones adicionales:

1. **Stop events específicos**: cuándo el modo automático del pipeline debe
   pausar y pedir intervención del usuario. Estos son distintos de las reglas
   del artifact porque dependen del contexto de ejecución auto-orquestada,
   no de la edición manual de un doc.

2. **Precondiciones del pipeline**: condiciones que deben cumplirse ANTES de
   que el pipeline arranque (R24 install, config files existentes). El artifact
   no verifica esto — lo verifica el pipeline.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones
duras al detectar una invocación de `/fremi-pipeline-product` en el prompt.
El orquestador (la IA) carga `applies.yaml` al arrancar el pipeline para
resolver qué reglas están activas en cada step.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/rules/` | Reglas cross-domain (hierarchy, versioning, sync-back, adr…). Referenciadas desde `applies.yaml`. |
| `~/.fremi/framework/artifacts/product/rules/` | Reglas domain-específicas del artifact product. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/product/rules/` | Reglas propias del pipeline (esta carpeta). |
