# Template — Entrada de tarea en `{workflow.plan}`

> **Para qué:** estructura canónica de una tarea (`task-XXX`) que se anexa a la sección "Tareas" del plan de una user story.
> **Usado por:** `/fremi-story-task`, Paso 4 (anexar al archivo del plan).
> **Placeholders:** todo lo que esté entre `<...>` se reemplaza con valores reales antes de anexar. `{task_id}` viene del Paso 2 del skill.
> **Regla 7b:** toda tarea debe tener al menos un criterio verificable de detección de completitud. Sin eso, la tarea no se anexa o se anexa con marca `⚠️ Falta criterio verificable`.

---

```markdown
### {task_id} — <título corto y accionable>

- **Objetivo:** <1-2 líneas. Qué construye o resuelve esta tarea — sin entrar en cómo.>

- **Implementa de:**
  - **SDD:** <contrato exacto del {workflow.sdd} que esta tarea materializa>
  - **BDD:** SC-XXX, SC-YYY (escenarios del {workflow.bdd} que esta tarea hace pasar)
  - **Design:** <decisión técnica del {workflow.design} que esta tarea aplica; mencionar ADR-XXX si la decisión tiene ADR>
  - **TDD:** TC-XXX, TC-YYY (tests del {workflow.tdd} que esta tarea verifica)

- **Detección de completitud:**
  - [ ] <criterio verificable 1 — idealmente comando o test concreto>
  - [ ] <criterio verificable 2>
  - [ ] <criterio verificable 3 si aplica>

- **Dependencias:** task-XXX, task-YYY (o `ninguna`)

- **Estado:** [ ] pendiente
```

---

## Reglas de uso

1. **Mapeo obligatorio.** Si una tarea no apunta a ningún contrato SDD, escenario BDD, decisión Design o test TDD → no pertenece al plan. Eliminarla o promover a la spec primero.
2. **Criterios verificables, no descriptivos.** Ejemplos válidos:
   - `npm test -- src/lambda/handler.test.ts` retorna exit 0
   - Archivo `src/lambda/handler.ts` exporta función `generatePdf(input)`
   - Coverage de `src/lambda/handler.ts` ≥ 80%
   - Endpoint `POST /reports/pdf` responde 200 con `application/pdf`
3. **Evitar criterios "manuales".** Sólo como último recurso, y describiendo qué se observa concretamente (no "funciona").
4. **Una tarea = una unidad de trabajo.** Si la "tarea" tiene 5+ criterios independientes, probablemente son 2-3 tareas separadas.
5. **Estados:** `[ ]` pendiente / `[/]` en curso / `[x]` hecho / `[~]` descartada (con motivo en el cuerpo).
