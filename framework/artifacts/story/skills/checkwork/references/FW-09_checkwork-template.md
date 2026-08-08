# Template — `FW-09_checkwork.md` de una story (living)

> **Doc VIVO** (Regla 13). Es el único archivo del workflow que muta durante la implementación. Se actualiza al arrancar/cerrar cada task (o vía hook `~/.fremi/framework/hooks/sync-checkwork.sh`).
>
> **Espejo del `FW-08_plan.md`** pero con estado. Refleja: tasks en curso/hechas, % progreso, CAs cubiertos, archivos implementados, bloqueos, próximos pasos.
>
> **Tipo (Regla 17):** **living** — versión propia + changelog al pie. Cada task cerrada bumpea PATCH (o MINOR si agrega archivos nuevos).
>
> **Precondición del `FW-10_closure.md`**: este doc debe mostrar 100% completado antes de que se pueda firmar el closure (Regla 11).

---

---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: {feature_id}
  version_at_creation: "<versión actual de FT-XX/definition.md>"
---

# Checkwork — {feature_id} / {story_id} — <título de la story>

**Última actualización**: <YYYY-MM-DD HH:MM>
**Estado general**: <PLANIFICACIÓN | EN CURSO | EN VERIFY | LISTO PARA CLOSURE | CERRADA>

---

## Estado general

- **Progreso**: X / N tasks cerradas (Y%)
- **Docs listos**: `FW-01`, `FW-03`, `FW-04`, `FW-05`, `FW-06`, `FW-07`, `FW-08` (+ `FW-00`, `FW-02` si aplicaron).
- **Última corrida de `verify`**: <fecha> — <PASS / PASS WITH WARNINGS / FAIL / no ejecutado>.
- **Cerrable**: <sí / no> — <razón>.

## ✅ Listo

<Tareas cerradas. Cada una con fecha, referencia al task-XXX del plan, y evidencia mínima.>

- [x] **task-001** — <título breve> — cerrada YYYY-MM-DD.
  - Criterios verificados: <comando/test que pasó>.
  - Archivos: `src/functions/x/y.ts`, `src/functions/x/test/z.test.ts`.

- [x] **task-002** — <título breve> — cerrada YYYY-MM-DD.
  - …

## 🚧 En curso

<Tareas activas (estado `[/]` en el plan). Cada una con fecha de inicio y qué le falta para cerrarse.>

- [/] **task-003** — <título breve> — arrancó YYYY-MM-DD.
  - Pendiente: <qué queda para marcarla `[x]`>.

## ⬜ Pendiente

<Tareas planeadas pero no arrancadas.>

- [ ] **task-004** — <título breve>
- [ ] **task-005** — <título breve>

## Cobertura por criterio de aceptación (CA)

<Espejo de los CAs del `FW-01_definition.md`. Se marca ✅ cuando existe test verde que lo cubre.>

| CA | Descripción resumida | Estado | Test que lo cubre |
|---|---|---|---|
| CA-001 | <resumen> | ✅ | `src/…/test/x.test.ts::should …` |
| CA-002 | <resumen> | 🚧 | (en implementación en task-003) |
| CA-003 | <resumen> | ⬜ | (pendiente — task-005) |

## Archivos implementados

<Lista concreta de archivos tocados durante esta story (código, no docs).>

- `src/functions/<X>/handler.ts` — <resumen del cambio>
- `src/functions/<X>/schemas/<Y>.ts` — <resumen del cambio>
- `src/functions/<X>/test/unit-test/<Z>.test.ts` — <N tests>
- <…>

## ❓ Decisiones pendientes / bloqueos

<Cualquier cosa que impida avanzar. Si hay una task bloqueada, indicar cuál.>

- [ ] <bloqueo 1> — bloquea task-XXX.
- [ ] <pregunta técnica que necesita respuesta del usuario/PM>.

## Bugs abiertos asociados

<Referencias a `BG-XX_<slug>.md` dentro de esta story que siguen abiertos. Bloquean parcialmente el cierre (Regla 11).>

- [ ] `bugs/BG-01_<slug>.md` — <resumen>. Estado: <en repro / con fix propuesto / cerrado>.

## Próximos pasos sugeridos

<Lo que la IA/humano debería hacer next para desbloquear/avanzar.>

1. <acción 1>
2. <acción 2>
3. Cuando 100%: correr `/fremi-story-verify`, luego `/fremi-story-closure-check`, luego firmar `FW-10_closure.md`.

## Changelog

- **v0.1.0** — YYYY-MM-DD — Checkwork creado, plan inicial trazado. [origen: /fremi-story al scaffolding]
<!-- Cada task cerrada agrega entry PATCH; nuevos archivos implementados suman MINOR -->

