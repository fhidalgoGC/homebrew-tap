# Template — `{workflow.plan}` de una story

> **Para qué:** orden de ejecución. Tareas (`task-XXX`) atómicas con criterios verificables de detección de completitud (Regla 7b).
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo inicial); `/fremi-story-task`, Paso 4 (agregar cada tarea).
> **Rol del archivo:** **en qué ORDEN se construye**. Es la operacionalización del Design + TDD en pasos atómicos.
> **No introduce comportamiento.** El plan ejecuta lo que ya está especificado en BDD/SDD/Design/TDD.

---

```markdown
---
version: 1.0.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: snapshot
ancestor:
  id: {feature_id}
  version_at_creation: "<versión actual de FT-XX/definition.md>"
  version_at_closure: null
---

# Plan de ejecución

## Resumen

<1-2 líneas. Estrategia general del plan: por dónde se empieza, qué piezas se unen al final.>

## Orden general

> Secuencia de bloques. Cada bloque agrupa tareas relacionadas. Dentro de un bloque, las tareas pueden tener dependencias finas.

1. **Bloque A — <título>** (tasks 001-003)
2. **Bloque B — <título>** (tasks 004-007)
3. **Bloque C — <título>** (tasks 008-...)

## Tareas

> Crear cada tarea con `/task <FT-XX>_<HU-YY>` (el skill agrega la entrada acá usando `references/task-entry-template.md`).

> Estructura esperada por tarea (resumen — el template canónico vive en `~/.fremi/framework/skills/task/references/task-entry-template.md`):

### task-001 — <título corto y accionable>

- **Objetivo:** <1-2 líneas>
- **Implementa de:**
  - **SDD:** <contrato>
  - **BDD:** SC-XXX
  - **Design:** <decisión + ADR si aplica>
  - **TDD:** TC-XXX
- **Detección de completitud:**
  - [ ] <criterio verificable 1>
  - [ ] <criterio verificable 2>
- **Dependencias:** ninguna (o `task-XXX`)
- **Estado:** [ ] pendiente

### task-002 — ...
...

## Riesgos / blockers conocidos

- <riesgo de schedule, bloqueo por dependencia externa, supuesto frágil>
- <para cada uno: cuándo se considera bloqueante y plan de mitigación>

## Notas de ejecución

- <observaciones libres sobre orden óptimo, paralelismo posible, cuándo correr CI integral, etc.>
```

---

## Reglas de uso

1. **Toda tarea es atómica.** Si tiene 5+ criterios independientes, son varias tareas — usar `/fremi-story-task` para partirla.
2. **Toda tarea tiene mapeo (SDD/BDD/Design/TDD).** Sin mapeo, la tarea no pertenece al plan.
3. **Toda tarea tiene al menos un criterio verificable** (Regla 7b). Comando que retorna 0, test que pasa, archivo que existe, etc.
4. **Estados de tarea:** `[ ]` pendiente / `[/]` en curso / `[x]` hecho / `[~]` descartada (con motivo).
5. **No re-numerar.** Si una tarea se descarta, queda con `[~]` y motivo; el siguiente número sigue siendo el siguiente, no se recicla.
6. **Bugs durante ejecución** → primero TC nuevo en `{workflow.tdd}`, después tarea acá para arreglarlo (Regla 8).
