# Reglas de TDD y plan verificable (dominio STORY)

> **Reglas obligatorias 2, 7, 7b.** Gobiernan la precondición de SDD+TDD antes de tocar código, el ciclo test-rojo → verde → refactor, y el formato del plan como lista de tareas verificables.
>
> **Alcance:** estas reglas son DOMAIN-específicas de `story/`. Se cargan sólo cuando se está trabajando en una story. Los enablers tienen su propia disciplina en `enabler/rules/`; los bugs (Regla 8) tienen la suya en el dominio bug.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`sdd`, `tdd`, `plan`, `bdd`, etc.) y **conceptos** (feature, story, task) para referirse a los artefactos. Los prefijos/formatos concretos (feature folder, story folder, IDs internos como `CA-XXX`, `SC-XXX`, `TC-XXX`, `task-XXX`) son configurables — ver `~/.fremi/framework/settings/methodology.core.yaml`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md` para reglas cross-domain como R9 (refactor no cambia comportamiento).

---

## Regla 2 — No se escribe código sin `sdd` + `tdd` de la story

Antes de tocar código de producción, deben existir, para la story correspondiente:
- El doc `sdd` con el contrato relevante.
- El doc `tdd` con tests planeados.

Filenames y ubicación se derivan de la convención vigente en `methodology.core.yaml` (`layers.story.dir` + `layers.story.files_in_order`).

**Excepciones permitidas:**
- Configuración de tooling (linters, formatters, tsconfig).
- Scaffolding inicial (`package.json`, estructura de carpetas).
- Los archivos de `docs/` y `~/.fremi/framework/`.

---

## Regla 7 — TDD: test rojo primero

Al implementar código:
1. Escribir el test (debe fallar — **rojo**).
2. Implementar lo mínimo para que pase (**verde**).
3. Refactorizar manteniendo tests verdes.

Los tests planeados en el doc `tdd` (con IDs de test — `TC-XXX` por default) se marcan como `[x]` cuando se implementan.

---

## Regla 7b — Plan = tareas con detección de completitud verificable

El doc `plan` no es texto narrativo: es una lista de tareas atómicas. Cada tarea debe tener:

1. **ID** de task (formato configurable — por default `task-XXX`, secuencial dentro de la story).
2. **Objetivo** explícito (qué construye).
3. **Mapeo** a piezas de los docs `sdd`, `bdd` o `tdd`. Sin mapeo, la tarea no tiene razón de existir.
4. **Criterios verificables de detección de completitud** (DoD de la tarea), idealmente automatizables:
   - Comando que retorna exit 0.
   - Test específico (`archivo::función`) que pasa.
   - Archivo que existe con contenido X.
   - Métrica de coverage cumplida.
   - Behavior observable manualmente (sólo último recurso, y describiendo cómo se observa).
5. **Estado** explícito: `[ ]` pendiente / `[/]` en curso / `[x]` hecho.

Una tarea **no se marca `[x]`** sin que todos sus criterios pasen. Si un criterio falla, la tarea sigue `[/]`.

Ver template en `~/.fremi/framework/flows/workflow.md` sección "Plan de ejecución".
