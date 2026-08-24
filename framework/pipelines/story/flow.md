---
version: 2.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-story
  version_at_creation: null
---

# Flujo — Pipeline STORY (`/fremi-pipeline-story`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Artifact subyacente:** [`~/.fremi/framework/artifacts/story/flow.md`](../../artifacts/story/flow.md) — declara los 14 steps del ciclo completo. El pipeline **envuelve la cadena completa**.

## Principio: el pipeline envuelve el flow

> **El pipeline STORY envuelve TODO el flow de la story en automático.** Si corrés `/fremi-story` + sub-skills manualmente, avanzás step por step; si corrés `/fremi-pipeline-story`, la IA ejecuta la cadena entera end-to-end (desde el andamio inicial hasta la firma del closure) sin pausar entre steps salvo por stop events reales.

Diferencia esencial:

| Aspecto | `/fremi-story` (manual) | `/fremi-pipeline-story` (auto) |
|---|---|---|
| Alcance | Un step por invocación | 14 steps end-to-end |
| Ritmo | Vos decidís cuándo avanzar | La IA avanza sola |
| Implementación | Vos + `/fremi-story-task` iterativo | La IA corre TDD task por task |
| Closure | Vos firmás manualmente | La IA firma tras `closure-check` sin CRITICAL |
| Cuándo conviene | Story exploratoria; querés revisar cada FW-XX | Story clara; querés cerrar el ciclo entero sin ping-pong |

---

## Arco completo (14 steps del artifact + preflight)

| # | Step (id) | Sub-skill invocado | Doc producido | Fase | Obligatoriedad |
|---|---|---|---|---|---|
| −1 | `scaffold` (preflight) | `/fremi-story` | folder + templates iniciales | preflight | Siempre |
| 0 | `explore` | `/fremi-story-explore` | `{workflow.explore}` | explore | Condicional (R16) |
| 1 | `definition` | `/fremi-story-definition` | `{workflow.definition}` | definition | Siempre |
| 2 | `proposal` | `/fremi-story-proposal` | `{workflow.proposal}` | proposal | Condicional (R16) |
| 3 | `scope` | `/fremi-story-scope` | `{workflow.scope}` | scope | Siempre |
| 4 | `bdd` | `/fremi-story-bdd` | `{workflow.bdd}` | bdd | Siempre |
| 5 | `sdd` | `/fremi-story-sdd` | `{workflow.sdd}` | sdd | Siempre |
| 6 | `design` | `/fremi-story-design` | `{workflow.design}` | design | Siempre |
| 7 | `tdd` | `/fremi-story-tdd` | `{workflow.tdd}` | tdd | Siempre |
| 8 | `plan` | `/fremi-story-plan` | `{workflow.plan}` | tasks | Siempre |
| 9 | `apply` | `/fremi-story-task` + `/fremi-story-checkwork` (loop) | código + tests | apply | Siempre |
| 10 | `checkwork` | `/fremi-story-checkwork` | `{workflow.checkwork}` (living) | apply | Siempre |
| 11 | `verify` | `/fremi-story-verify` | reporte inline | verify | Siempre |
| 12 | `closure-check` | `/fremi-story-closure-check` | reporte inline de gaps | closure | Siempre |
| 13 | `closure` | `/fremi-story-closure` | `{workflow.closure}` + bump feature | closure | Siempre |

**El pipeline no salta ningún step del artifact.** El `skips_steps` en `workflow.yaml` está vacío.

---

## Arco narrativo por fases

### Fase 1 — Preflight (andamiaje)

Antes del primer step, invoca `/fremi-story <FEATURE_ID> <nombre>` para:
- Determinar el próximo `HU-XX` local a la feature.
- Crear el folder de la story.
- Instanciar los 11 templates iniciales.
- Capturar `ancestor.version_at_creation` desde el `definition.md` de la feature.
- Actualizar la lista "User stories planeadas" en el `definition.md` de la feature.

Si falla → aborta antes de tocar ningún step.

### Fase 2 — Planificación (steps 0..8)

La IA llena en cadena los 9 docs de planificación. Cada sub-skill escribe su FW-XX de un tirón, y el pipeline arranca el siguiente sin preguntar (modo `auto`) o pausa entre steps para checkpoint del usuario (modo `interactive`).

Stop events posibles durante esta fase: `conditional_ambiguous`, `technical_bifurcation` (R3b), `sync_back` (R12), `ca_ambiguous`, `rnf_missing`, `tech_outside_stack`, `plan_zero_tasks` (R7b). Ver `workflow.yaml → stop_events`.

Al terminar esta fase la story queda **planificada** — misma condición en la que terminaba el pipeline en la versión anterior. Pero ahora el pipeline sigue.

### Fase 3 — Implementación autónoma (step 9 — apply)

Con el `FW-08_plan.md` listo, la IA arranca a implementar task por task:

1. Toma la primera `task-XXX` en estado `[ ]` del plan.
2. Ejecuta el ciclo TDD de esa task:
   - Escribe el test rojo mapeado (Regla 7).
   - Corre el test — debe fallar.
   - Escribe el fix mínimo para pasar el test.
   - Corre el test — debe pasar.
   - Corre el resto de la suite — no debe romper.
3. Actualiza `FW-09_checkwork.md` (living) con la evidencia — vía `/fremi-story-checkwork`.
4. Marca la task `[x]` en `FW-08_plan.md` y avanza a la siguiente.

Este loop corre autónomo hasta llegar a 100% de tasks. Stop events específicos de apply:
- `test_failing_persistent` — un test no vuelve a verde después de N intentos.
- `unplanned_scope_discovered` — la implementación revela contrato no cubierto en SDD/design → volver atrás en la cadena.
- `bug_found_during_apply` — se detecta bug pre-existente ortogonal → `/fremi-story-bug` sin romper el flujo.
- `sync_back` — durante apply también aparecen decisiones que deberían subir a feature/producto.

**El pipeline NO improvisa fuera de la spec.** Si apply detecta un gap, vuelve a `sdd`/`design`/`plan` — la spec dirige el diseño, no al revés (Regla 6.4).

### Fase 4 — Verify (step 11)

Con todas las tasks en `[x]` y `checkwork` al 100%:
- Invoca `/fremi-story-verify` que corre `test_runner`, `type_checker` y `coverage` según `config.testing`.
- Resultado va a la sección "Última corrida de verify" del `checkwork`.

Stop event `verify_failing` bloquea el avance a `closure-check` — volver a `apply` para fixear, nunca seguir con verde falso.

### Fase 5 — Closure-check (step 12)

Con verify en PASS o PASS_WITH_WARNINGS:
- Invoca `/fremi-story-closure-check` que arma la matriz de trazabilidad (CA → SC → TC → task → commit).
- Reporta CRITICAL / WARNING / SUGGESTION.

Stop event `closure_check_critical` (Regla 11) bloquea el `closure` hasta resolver todos los CRITICAL.

### Fase 6 — Closure (step 13)

Con closure-check sin CRITICAL:
- Invoca `/fremi-story-closure`.
- Firma el `FW-10_closure.md` con `Fecha de cierre` y `Sign-off`.
- Bumpea la feature padre según `parent_bump_triggers.story_closes` (Regla 17).
- Actualiza `ancestor.version_at_closure` con la nueva versión de la feature.

Stop event `parent_version_conflict` (Regla 17) pausa si la feature cambió su versión desde que la story fue creada — para revisar si el cambio afecta CAs.

---

## Modo de ejecución

- **`auto`** (default): la IA corre los 14 steps end-to-end. Pausa sólo ante stop events reales.
- **`interactive`**: la IA corre cada sub-skill en `auto` (sin pausas por sección), pero el pipeline pausa **entre steps** para checkpoint del usuario. "El pipeline con checkpoints por doc" — útil cuando la story es sensible y querés ver el resultado de cada fase antes de avanzar.

**Regla dura**: dentro del pipeline los sub-skills NUNCA reactivan modo interactivo — corren siempre `auto`. Si querés validación por sección dentro de un doc específico, salite del pipeline e invocá el skill suelto (ej: `/fremi-story-sdd FT-03/HU-05 --mode interactive`).

---

## Anti-patrones (el pipeline NO debe pausar por esto)

- Confirmar wording de cada CA / SC / TC.
- Preguntar cuántas tasks poner en el plan.
- Preguntar si un test cubre un CA específico — se mapea y listo.
- Pedir feedback tras cada FW-XX completado (usar modo interactive si lo querés).
- Pedir confirmación para cada task completada durante apply.

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions`. Resumen:

- **R24** — Framework instalado (`.claude/skills/fremi-story` symlink + `CLAUDE.md` referencia workflow.md). Si falla → mensaje "Corré `fremi install`" y abortar. **No auto-instalar.**
- Methodology + config.user.yaml existen y parsean.
- `config.user.yaml → active: true`.
- **R1** — Feature `{FEATURE_ID}` existe con `definition.md` real.
- **R17** — Feature `definition.md` tiene frontmatter con `version`.

---

## Reglas activas durante la ejecución completa

- **R1** — No avanzar sin feature `definition.md`.
- **R2** — Durante apply, cada task es SDD+TDD antes de código.
- **R3b** — Bifurcaciones técnicas producen ADR antes de continuar.
- **R6** — Cadena BDD→SDD→Design se respeta; ida-vuelta si apply descubre gaps.
- **R7** — Test rojo primero durante apply.
- **R7b** — Plan tiene tasks con criterios verificables.
- **R8** — Bug durante apply → test rojo primero + `/fremi-story-bug`.
- **R11** — closure-check sin CRITICAL antes de firmar.
- **R12** — Sync-back activo durante scope/bdd/sdd/apply.
- **R13** — checkwork es living, single-writer.
- **R16** — Conditionals FW-00/FW-02 evaluados.
- **R17** — Frontmatter versionado + closure bumpea la feature.

---

## Estado final después del pipeline

La story queda **cerrada, firmada y bumpeada al padre**:

```
docs/works/features/FT-XX_<slug>/user-stories/HU-YY_<nombre>/
├── FW-00_explore.md           (si aplicó explore_when)
├── FW-01_definition.md        (v1.0.0, snapshot)
├── FW-02_proposal.md          (si aplicó proposal_when)
├── FW-03_scope.md
├── FW-04_bdd-userstories.md
├── FW-05_sdd-spec.md
├── FW-06_design.md
├── FW-07_tdd-plan.md
├── FW-08_plan.md              (todas las tasks en [x])
├── FW-09_checkwork.md         (100% + evidencia + verify PASS)
└── FW-10_closure.md           (firmado, ancestor.version_at_closure = feature bumpeada)
```

Además:
- Código productivo mergeable en `src/`.
- Tests verdes cubriendo todos los CAs.
- Feature padre bumpeada (Regla 17).
- ADRs firmados (si hubo bifurcaciones).
- Sync-back aplicado en feature/producto (si hubo divergencias).

**Próximo paso natural:** siguiente story de la feature, o closure de la feature si esta era la última.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Reglas duras: [`workflow.md`](../../rules/workflow.md) — R1, R2, R3b, R6, R7, R7b, R8, R11, R12, R13, R16, R17.
- Flow del artifact subyacente: [`~/.fremi/framework/artifacts/story/flow.md`](../../artifacts/story/flow.md)
- Orquestador manual: [`/fremi-story`](../../artifacts/story/SKILL.md)
- Pipeline padre: `/fremi-pipeline-feature` (encadena via `--first-story`)

---

## Changelog

- **v2.0.0** — 2026-08-11 — Rework: el pipeline ahora envuelve el ciclo COMPLETO (14 steps del artifact) — no más subset de planificación. Se agregaron las fases apply, verify, closure-check, closure con sus stop events y reglas correspondientes. [origen: aclaración del usuario — "el pipeline engloba el flow completo"]
- **v1.0.0** — 2026-08-11 — Creación inicial: subset de planificación (0..8). *Superada por v2.0.0.*
