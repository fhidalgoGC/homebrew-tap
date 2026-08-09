# Template — `{enabler.plan}` de un enabler

> **Para qué:** orden de ejecución. Tareas atómicas con criterios verificables (Regla 7b).
> **Usado por:** `/fremi-enabler`, Paso 4 (crear archivo inicial).
> **Rol del archivo:** **en qué orden se construye el enabler**. Es la operacionalización de `{enabler.design}` en pasos atómicos.
> **No introduce comportamiento.** Sólo ejecuta lo decidido en `{enabler.design}`.

---

```markdown
# Plan de ejecución del enabler

## Resumen

<1-2 líneas: estrategia general del plan. Cuántos bloques, qué se hace primero.>

## Orden general

> Secuencia de bloques. Dentro de cada bloque, tareas relacionadas con posible paralelismo.

1. **Bloque A — <título>** (tasks 001-003)
2. **Bloque B — <título>** (tasks 004-006)
3. **Bloque C — verificación y cierre** (tasks 007-...)

## Tareas

### task-001 — <título corto y accionable>

- **Objetivo:** <1-2 líneas — qué construye>
- **Implementa de:**
  - **Decisión:** D-XX de `{enabler.design}`
  - **Criterio:** CA-XXX de `{enabler.definition}` (si aplica)
- **Detección de completitud:**
  - [ ] <criterio verificable 1 — comando / test / archivo>
  - [ ] <criterio verificable 2>
- **Dependencias:** ninguna (o `task-XXX`)
- **Estado:** [ ] pendiente

### task-002 — ...

### task-XXX — Verificación integral

- **Objetivo:** validar que todos los CA del `{enabler.definition}` se cumplen.
- **Detección de completitud:**
  - [ ] CA-001 verificable con <comando>
  - [ ] CA-002 verificable con <comando>
  - [ ] CA-003 verificable con <comando>
  - [ ] Features/stories vinculadas en EN-01 pueden ejecutar su workflow sin errores.

## Riesgos / blockers conocidos

- <bloqueo por servicio externo, dependencia con otra feature, ventana de mantenimiento>
- <plan de mitigación por cada uno>

## Notas de ejecución

- <orden óptimo, paralelismo posible, momentos para sync con otros equipos>
```

---

## Reglas de uso

1. **Toda tarea es atómica.** Si una tarea tiene 5+ criterios independientes → partirla.
2. **Toda tarea tiene mapeo** a una decisión (`D-XX`) o criterio técnico (`CA-XXX`) del enabler.
3. **Criterios verificables automáticamente** cuando sea posible — comando que retorna 0, test que pasa, archivo que existe.
4. **Estados:** `[ ]` pendiente / `[/]` en curso / `[x]` hecho / `[~]` descartada (con motivo, no se recicla número).
5. **Verificación final obligatoria.** La última tarea siempre revalida todos los CA del `{enabler.definition}`. Sin esto el enabler no se puede cerrar.
6. **Bugs encontrados durante la ejecución del enabler** → si el bug es del enabler mismo, agregar tarea de fix acá. Si el bug es en código de una story → seguir Regla 8 y registrar `BG-XX` en la story afectada.
