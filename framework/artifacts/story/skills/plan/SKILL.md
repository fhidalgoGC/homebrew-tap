---
name: fremi-story-plan
description: Puebla la estructura inicial del `FW-08_plan.md` de una story — el archivo del plan de ejecución con secciones para task-XXX. Doc snapshot como estructura, pero las entries `task-XXX` se agregan con `/fremi-story-task`. Este skill crea el esqueleto; `/fremi-story-task` puebla las tareas individuales.
---

# /fremi-story-plan — Poblar FW-08 (estructura del plan de ejecución)

Puebla la **estructura inicial** del `FW-08_plan.md`: resumen, secciones (Backlog / En curso / Cerradas), notas de orden y dependencias.

**Rol del doc**: en qué **orden** se construye la story. Las `task-XXX` individuales se agregan con `/fremi-story-task`; este skill crea el archivo con esqueleto.

**Diferencia con `/fremi-story-task`**:
- `/fremi-story-plan` — crea o refresca el archivo con estructura + descripción del orden.
- `/fremi-story-task` — agrega una `task-XXX` concreta al archivo existente.

## Sintaxis

```
/fremi-story-plan <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- `/fremi-story` acaba de armar el esqueleto y hay que dar forma inicial al plan.
- Se descubrió que el orden global de la story cambia (ej: hay que insertar una fase de spike).
- Nunca invocar para agregar 1 tarea — usar `/fremi-story-task`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.task` (task-XXX), `identifiers.workflow_doc.items[name=plan]`.
- `config.yaml` → `phase_rules.tasks`.

### Paso 1 — Validar padre y precondiciones
- `FW-07_tdd-plan.md` con TCs mapeados (el orden lo influye).
- `FW-06_design.md` con estructura de archivos a crear (el plan la sigue).

### Paso 2 — Cargar template
- `references/FW-08_plan-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.tasks`

- Estructura obligatoria: **Resumen del orden**, **Backlog** (todas las tareas), **Notas de dependencias**.
- Cada task-XXX (agregada con `/fremi-story-task`) debe tener: objetivo, mapeo a SDD/BDD/TDD/Design, criterios verificables de detección de completitud (Regla 7b).
- Estados: `[ ]` pendiente / `[/]` en curso / `[x]` hecho / `[~]` descartada con motivo.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = feature/definition.
- Cada `/fremi-story-task` posterior bumpea el archivo → PATCH del snapshot (excepción, ver Regla 17: los snapshots normalmente no bumpean, pero `FW-08` es interfaz de `/fremi-story-task`).

### Paso 5 — Escribir y reportar
- Guardar el esqueleto.
- Sugerir próximo paso: agregar tasks con `/fremi-story-task`.

## Validaciones

- El archivo tiene las 3 secciones (Resumen, Backlog, Notas).
- El resumen refleja el orden lógico basado en FW-06 (Design) + FW-07 (TDD).

## Anti-patrones

- ❌ Usar `/fremi-story-plan` para agregar 1 tarea — mala herramienta, usar `/fremi-story-task`.
- ❌ Escribir tareas sin mapeo a SDD/BDD/TDD — cada task justifica su existencia.
- ❌ Sobreescribir el archivo si ya tiene tasks — ofrecer edición aditiva.

## Referencias

- Template: [`references/FW-08_plan-template.md`](references/FW-08_plan-template.md).
- Skill `/fremi-story-task` — agrega entries.
- `config.yaml → phase_rules.tasks`.
- `~/.fremi/framework/rules/workflow.md` → Regla 7b (tareas con criterios verificables).
