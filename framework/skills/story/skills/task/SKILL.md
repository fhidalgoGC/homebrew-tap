---
name: fremi-story-task
description: Agrega una nueva tarea al plan.md de una user story. Lee la nomenclatura desde docs/frmwk/settings/methodology.json (NO usa prefijos hardcoded). Usar cuando el usuario descompone una story en pasos.
---

# /task — Agregar tarea al plan de una story

Agrega una tarea al archivo de plan de una user story, respetando la Regla 7b (cada tarea debe tener al menos un criterio verificable de detección de completitud) y la nomenclatura definida en **`docs/frmwk/settings/methodology.json`**.

> **Importante:** lee `identifiers.task` y `identifiers.workflow_doc.items[]` del JSON. NO hardcodea ni el prefijo de la tarea (`task-`), ni el nombre del archivo plan (`FW-08_plan.md`).

## Sintaxis

```
/task <FEATURE_ID>_<STORY_ID> [título]
```

- `<FEATURE_ID>_<STORY_ID>`: referencia compuesta de la story padre (ej: `FT-03_HU-02`). Los formatos se derivan de `identifiers.feature.id_format` e `identifiers.story.id_format`.
- `título` (opcional): título corto de la tarea. Si falta, preguntárselo.

Si la referencia falta y hay **una sola story con tareas en progreso**, asumir esa. Si hay ambigüedad, preguntar.

## Cuándo invocarlo

- Usuario dice "agregar tarea", "task nueva", "descompongamos el plan".
- Se está armando el plan de ejecución de una story.
- Se identifica una nueva subtarea durante la ejecución.

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `docs/frmwk/settings/methodology.json`.
2. Extraer:
   - `task_cfg = identifiers.task` → `prefix`, `id_format`, `compound_id_format`, `location` (suele ser `FW-08_plan.md`), `scope` (story).
   - `wf_cfg = identifiers.workflow_doc` y derivar el filename del item con `name === "plan"` (es donde viven las tareas).
   - `story_cfg = identifiers.story`, `feat_cfg = identifiers.feature`.
   - También: filenames de los items `sdd-spec`, `bdd-userstories`, `tdd-plan` (para validar mapeo).

Si el JSON no parsea → abortar.

### Paso 1 — Resolver la story padre

1. Parsear el argumento `<FEATURE_ID>_<STORY_ID>` según los `id_format` del JSON.
2. Buscar carpeta `{paths.features_dir}/{feature_folder}/{paths.user_stories_subdir}/{story_folder}/`.
3. Si no existe → avisar y abortar.
4. Verificar que el archivo del plan (`FW-08_plan.md` o lo que diga el item del JSON) exista en esa story.

### Paso 2 — Determinar el ID de tarea

1. Parsear el archivo del plan de la story.
2. Extraer todas las tareas existentes que matcheen `task_cfg.regex` (default: `^task-\d{3}$`).
3. Próximo número = max(existentes) + 1. Si no hay → 1.
4. Construir el `id` aplicando `task_cfg.id_format` (default: `{prefix}-{number:03d}` → `task-001`).
5. IDs son **locales a la story** (scope=story en el JSON).

### Paso 3 — Recolectar info de la tarea

Preguntar al usuario (o inferir de la conversación):
1. **Objetivo** (1-2 líneas).
2. **Mapeo:** ¿qué contrato SDD implementa? ¿qué SC-XXX cubre? ¿qué decisión de Design materializa? ¿qué TC-XXX testea?
3. **Criterios de detección de completitud** (Regla 7b). Idealmente:
   - Comando que retorna exit 0.
   - Test específico que pasa.
   - Archivo que existe con contenido.
   - Coverage cumplido.
   - **Manualmente revisado** sólo como último recurso, describiendo qué se observa.
4. **Dependencias:** otras `task-XXX` previas (o "ninguna").

### Paso 4 — Anexar al archivo del plan

1. Leer el template canónico de `references/task-entry-template.md` (relativo a la carpeta del skill: `docs/frmwk/skills/task/references/task-entry-template.md`).
2. Reemplazar los placeholders del template con los valores recolectados:
   - `{task_id}` → ID determinado en Paso 2.
   - `<título>`, `<objetivo>`, mapeo SDD/BDD/Design/TDD, criterios de detección y dependencias → con la info del Paso 3.
3. Anexar el bloque resultante al final de la sección "Tareas" del archivo del plan (sin tocar tareas existentes).

> El template incluye reglas de uso. La más estricta (Regla 7b): toda tarea debe tener al menos un criterio verificable. Si el usuario no provee ninguno, no anexar o anexar con marca `⚠️ Falta criterio verificable`.

### Paso 5 — Validar sincronía (Regla 12)

Al crear la tarea, verificar:
- Que el contrato SDD que la tarea implementa ya esté en el doc SDD de la story (filename derivado del JSON, default `FW-05_sdd-spec.md`).
- Que el escenario BDD referenciado ya exista en el doc BDD.
- Que el test TDD esté en el doc TDD (default `FW-07_tdd-plan.md`).
- Que la decisión de Design tenga ADR cuando corresponda (Regla 3b).
- Si la tarea introduce un concepto/componente/decisión que **no está** en SDD/BDD/Design/TDD, eso ya es un gap: o se agrega al spec primero, o se promueve más arriba si es transversal.

Si la tarea revela algo que pertenece a capa superior → señalarlo y proponer sync-back antes de empezar a ejecutar la tarea.

### Paso 6 — Reportar

Decir al usuario:
- ID asignado (formato del JSON, default `task-XXX`).
- Referencia completa según `task_cfg.compound_id_format` (default: `{feature_id}_{story_id}_{id}`, ej: `FT-03_HU-02_task-001`).
- Si hubo sync-back: qué se actualizó arriba.
- Recordatorio: usar este ID para marcar progreso en el plan (`[ ]` → `[/]` → `[x]`) y para referenciar en commits/PRs.

## Validaciones (Regla 7b)

- **Toda tarea debe tener al menos un criterio verificable.** Si el usuario no provee ninguno, insistir. Si después de pedir el usuario rechaza dar un criterio → permitir crear la tarea pero marcarla con un ⚠️ "Falta criterio verificable" hasta que se complete.
- **Toda tarea debe mapear a algo del SDD/BDD/Design/TDD.** Si no hay mapeo, advertir: "Esta tarea no apunta a ningún contrato/escenario/decisión/test. ¿Estás seguro de que pertenece al alcance de la story?"
- Si la story aún no tiene SDD/BDD/Design/TDD con contenido → advertir que el plan debería esperar a tener esos definidos (Regla 1).

## Reglas

- IDs locales a la story, secuenciales, sin reciclar.
- El skill no marca tareas como hechas — el usuario edita el archivo del plan directamente cuando completa una tarea.
- Si la tarea reemplaza a otra (cambio de plan), marcar la antigua como `[~] descartada` y crear la nueva con ID nuevo.
- Si `methodology.json` no es legible → **abortar**. No usar fallbacks hardcoded.
