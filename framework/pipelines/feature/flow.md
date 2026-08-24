---
version: 2.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-feature
  version_at_creation: null
---

# Flujo — Pipeline FEATURE (`/fremi-pipeline-feature`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Artifact subyacente:** [`~/.fremi/framework/artifacts/feature/flow.md`](../../artifacts/feature/flow.md) — declara los 2 steps del ciclo feature (definition + lifecycle). El pipeline **envuelve ambos**.

## Principio: el pipeline envuelve el flow

> **El pipeline FEATURE envuelve TODO el flow de la feature en automático.** El artifact declara 2 steps: `definition` (crear la feature) y `lifecycle` (fase transversal donde nacen stories, bugs, enablers, ADRs). El pipeline hace las dos cosas end-to-end: crea la feature Y encadena `/fremi-pipeline-story` por cada story listada en `user_stories_seed[]`, manejando bugs/enablers/ADRs como stop events durante el lifecycle.

Diferencia esencial:

| Aspecto | `/fremi-feature` (manual) | `/fremi-pipeline-feature` (auto) |
|---|---|---|
| Alcance | Sólo crea el `definition.md` | 2 steps end-to-end: definition + lifecycle completo |
| Stories seed | Se listan en el definition; vos las creás después | El pipeline encadena `pipeline-story` por cada una |
| Bugs/enablers | Vos los detectás y los invocás | Stop events durante lifecycle; se resuelven inline |
| Sync-back a producto | Manual | Automático (evalúa al terminar cada step) |
| Bump del plan | Manual | Automático (MINOR sin preguntar) |
| Cuándo conviene | Querés crear la feature y decidir story por story | Feature con seed claro; querés cerrar toda la línea de stories |

---

## Arco completo (2 steps del artifact + preflight)

| # | Step (id) | Skill/pipeline invocado | Producido | Fase | Obligatoriedad |
|---|---|---|---|---|---|
| −1 | `scaffold` (preflight) | `/fremi-feature` | folder + template definition.md | preflight | Siempre |
| 0 | `definition` | `/fremi-feature` | `definition.md` + sync-back + bump plan | definition | Siempre |
| 1 | `lifecycle` | `/fremi-pipeline-story` (loop) + skills transversales | 1..N stories cerradas + bugs/enablers/ADRs | lifecycle | Siempre |

**El pipeline no salta ningún step del artifact.** `skips_steps: []`.

---

## Arco narrativo por fases

### Fase 1 — Preflight (andamiaje)

Antes del primer step, invoca `/fremi-feature <nombre>` para:
- Determinar el próximo ID de feature en el proyecto (según `methodology.core.yaml → identifiers.feature`).
- Crear el folder de la feature.
- Instanciar el template `definition.md` con frontmatter y secciones vacías.
- Capturar `ancestor.version_at_creation` desde la versión actual de `product/plan.md` (Regla 17).

Si falla → aborta antes de tocar el step 0.

### Fase 2 — Definition (step 0)

El pipeline delega en `/fremi-feature` para armar el `definition.md` completo de un tirón:
- Capacidades concretas que la feature habilita.
- Scope (in-scope / out-of-scope respecto a `product/definition.md`).
- `user_stories_seed[]` — roadmap inicial de stories que se derivarán.
- Frontmatter versionado (`v0.1.0`, `ancestor.version_at_creation = product/plan@{versión}`).

Después de escribir el doc:
- **Sync-back a producto (R12)**: evalúa si la feature introduce capacidades/restricciones/términos no presentes en `product/definition.md`. Si detecta divergencia → stop event `sync_back_producto`.
- **Bump del plan (R17)**: agrega la feature al roadmap con MINOR bump automático. No pregunta.

Stop events posibles durante esta fase: `sync_back_producto` (R12), `technical_bifurcation` (R3b), `feature_collision`, `plan_prioridad_desconocida`.

### Fase 3 — Lifecycle (step 1)

Con la feature creada, el pipeline arranca el lifecycle. Este es el step transversal donde la feature "vive" — se van creando stories, bugs, enablers y ADRs hasta que todas las stories seed cierran.

**Loop principal — stories seed:**

Para cada entrada en `definition.md → user_stories_seed[]`:
1. Encadena `/fremi-pipeline-story <FEATURE_ID> <nombre-seed>` en modo heredado.
2. El sub-pipeline corre el ciclo COMPLETO de la story (14 steps — planificación + implementación + closure firmado).
3. Al cerrar la story, el `feature/definition.md` se bumpea según `parent_bump_triggers.story_closes` (Regla 17).
4. El pipeline avanza a la siguiente seed.

**Sin `user_stories_seed[]`** → stop event `user_stories_seed_empty`: preguntar al usuario si (a) proveer los nombres de stories iniciales para arrancar, (b) terminar el pipeline en `definition` (lifecycle diferido — se arrancan stories manualmente después).

**Skills transversales durante lifecycle** — activados por stop events, no por loop:
- `/fremi-feature-adr` — decisión técnica que afecta a la feature entera (R3b + R20). Actualiza `feature/decisions.md` antes de continuar.
- `/fremi-feature-bug` — bug transversal que afecta múltiples stories o partes no ligadas a una story (R8 — test rojo primero). Se cierra antes de arrancar la próxima story.
- `/fremi-enabler --feature <FT-XX>` — infraestructura o tooling feature-scope. Se completa antes de las stories que dependen del enabler.

Stop events específicos de lifecycle: `user_stories_seed_empty`, `sub_pipeline_story_aborted`, `feature_bug_transversal` (R8), `feature_enabler_needed`, `feature_adr_needed` (R3b), `lifecycle_scope_creep` (R12 — capacidad global detectada, sync-back a producto).

**Fin del lifecycle:** cuando todas las stories del `user_stories_seed[]` están cerradas Y no hay bugs/enablers/ADRs pendientes que bloqueen. Reporte final incluye el estado de cada story chained.

### Fase 4 — Cierre — reporte y próximo paso

Al terminar exitosamente, la IA reporta:
- Feature creada (ID + slug + path).
- Versión inicial del `definition.md` + `ancestor.version_at_creation`.
- Bump del `plan.md` (versión anterior → versión nueva).
- Sync-back a producto (si hubo).
- ADRs registrados (con scope: producto/feature/story).
- Stories procesadas — lista de `user_stories_seed[]` con outcome (closed / aborted / skipped) + link al reporte de cada pipeline-story.
- Bumps del `feature/definition.md` acumulados por cada story cerrada.
- Bugs y enablers creados durante lifecycle.
- Stop events registrados.
- **Próximo paso**: todas las stories seed cerradas — proponer nueva story, feature closure manual (si aplica), o volver a producto.

---

## Modo de ejecución

- **`auto`** (default): la IA corre los 2 steps end-to-end, encadenando cada story del seed sin pausar. Pausa sólo ante stop events reales.
- **`interactive`**: cada sub-pipeline de story corre en `auto`, pero el pipeline feature pausa **entre stories** — al terminar cada story reporta el resultado y pregunta si continúa con la siguiente. Útil para revisar cada story antes de arrancar la próxima.

**Regla dura**: dentro del pipeline los sub-pipelines de story NUNCA reactivan modo interactivo — corren siempre `auto`.

---

## Anti-patrones (el pipeline NO debe pausar por esto)

- Confirmar el orden exacto de capacidades listadas.
- Preguntar por wording del título.
- Preguntar si se hace el bump de `plan.md` — es obligatorio (R17), se hace sin preguntar.
- Pausar entre stories durante lifecycle — se encadenan sin preguntar (usar `--mode interactive` para checkpoint por story).
- Volver a preguntar precondiciones ya validadas en el preflight.

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions`. Resumen:

- **R24** — Framework instalado.
- Methodology + config de feature existen y parsean.
- `config.user.yaml → active: true`.
- **R1** — `product/definition.md` existe con contenido real.
- **R1** — `product/plan.md` existe con contenido real.
- **R17** — `product/plan.md` tiene frontmatter con `version`.

---

## Reglas activas durante la ejecución completa

- **R1** — No avanzar sin `product/definition.md` + `product/plan.md`.
- **R3b** — Toda bifurcación produce ADR antes de continuar.
- **R8** — Bug feature-scope descubierto durante lifecycle → test rojo primero.
- **R12** — Sync-back activo durante definition Y lifecycle.
- **R17** — Bump del plan.md padre + captura ancestor.version_at_creation en definition; cada story chained bumpea la feature al closure.
- **R20** — ADRs al scope correcto (producto / feature / story).

---

## Estado final después del pipeline

Con `user_stories_seed[]` cerrado por completo:

```
docs/works/features/FT-XX_<slug>/
├── definition.md                          (v0.M.N — MINOR bumps acumulados por closures)
├── decisions.md                           (si hubo ADRs feature-scope)
├── enablers/                              (si se crearon enablers feature-scope)
│   └── <enabler-folder>/
├── bugs/                                  (si hubo bugs feature-scope)
│   └── <bug-filename>
└── user-stories/
    ├── HU-01_<seed-1>/                    (11 docs FW-XX + closure firmado)
    ├── HU-02_<seed-2>/                    (11 docs FW-XX + closure firmado)
    └── HU-N_<seed-N>/                     (idem)

docs/works/product/plan.md   (bump MINOR — feature agregada al roadmap)
```

**Próximo paso natural:** nueva story ad-hoc no listada en seed, feature closure manual, o volver a producto para próxima iniciativa.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Reglas duras: [`workflow.md`](../../rules/workflow.md) — R1, R3b, R8, R12, R17, R20.
- Flow del artifact subyacente: [`~/.fremi/framework/artifacts/feature/flow.md`](../../artifacts/feature/flow.md)
- Orquestador manual: [`/fremi-feature`](../../artifacts/feature/SKILL.md)
- Pipeline padre: `/fremi-pipeline-product`
- Pipeline hijo (encadenado en cada story seed): `/fremi-pipeline-story`

---

## Changelog

- **v2.0.0** — 2026-08-11 — Rework: el pipeline ahora envuelve el ciclo COMPLETO del artifact feature (definition + lifecycle end-to-end). Lifecycle = loop sobre user_stories_seed[] encadenando /fremi-pipeline-story + skills transversales para bugs/enablers/ADRs. `--first-story` deprecado — ya no es opt-in. [origen: aclaración del usuario — "el pipeline engloba el flow completo"]
- **v1.0.0** — 2026-08-11 — Creación inicial: sólo cubría step definition + `--first-story` opcional. *Superada por v2.0.0.*
