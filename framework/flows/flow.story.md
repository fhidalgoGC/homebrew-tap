# Flujo — Capa STORY

> **Config operativa:** [`~/.fremi/framework/artifacts/story/config.user.yaml`](../settings/config.story.yaml)
> **Orquestador:** [`/fremi-story`](../artifacts/story/SKILL.md)
> **Rol:** unidad mínima de valor. Cada story pertenece a una feature.

> **Convención de tokens** — los tokens `{workflow.X}` (ej: `{workflow.scope}`, `{workflow.definition}`) resuelven contra `~/.fremi/framework/settings/methodology.user.yaml → identifiers.workflow_doc.items` al ejecutarse un skill. Con la nomenclatura default resuelven a `{workflow.explore}`, `{workflow.definition}`, ..., `{workflow.closure}`. Si el usuario cambió el prefijo (`FW` → `FR`) o el padding (`03` → `003`), los skills se adaptan; estos docs no.

---

## Qué produce esta capa

**11 docs FW-XX** en `HU-YY_<slug>/` (2 condicionales, 9 obligatorios):

| # | Doc | Skill | Obligatoriedad | doc_type |
|---|---|---|---|---|
| 0 | `{workflow.explore}` | `/fremi-story-explore` | Condicional (`explore_when`) | snapshot |
| 1 | `{workflow.definition}` | `/fremi-story-definition` | Siempre | snapshot |
| 2 | `{workflow.proposal}` | `/fremi-story-proposal` | Condicional (`proposal_when`) | snapshot |
| 3 | `{workflow.scope}` | `/fremi-story-scope` | Siempre | snapshot |
| 4 | `{workflow.bdd}` | `/fremi-story-bdd` | Siempre | snapshot |
| 5 | `{workflow.sdd}` | `/fremi-story-sdd` | Siempre | snapshot |
| 6 | `{workflow.design}` | `/fremi-story-design` | Siempre | snapshot |
| 7 | `{workflow.tdd}` | `/fremi-story-tdd` | Siempre | snapshot |
| 8 | `{workflow.plan}` | `/fremi-story-plan` | Siempre | snapshot |
| 9 | `{workflow.checkwork}` | `/fremi-story-checkwork` + `/fremi-story-verify` | Siempre | **living** |
| 10 | `{workflow.closure}` | `/fremi-story-closure` | Siempre | snapshot |

**Verify phase**: NO tiene doc dedicado — su reporte se inserta como sección "Última corrida de verify" dentro de `{workflow.checkwork}`.

---

## Diagrama del flujo (13 steps)

`
                    ESCALERA DE ABSTRACCIÓN (baja de arriba hacia abajo)
                    ────────────────────────────────────────────────────

     /fremi-story-explore (condicional)  ──► `{workflow.explore}`      [investigar terreno]
              │
              ▼
     /fremi-story-definition ─────────────► `{workflow.definition}`    [problema / por qué]
              │
              ▼
     /fremi-story-proposal (condicional)  ─► `{workflow.proposal}`      [intent + approach + risk]
              │
              ▼
     /fremi-story-scope ──────────────────► `{workflow.scope}`          [in / out / dependencias]
              │
              ▼
     /fremi-story-bdd ────────────────────► {workflow.bdd}   [Given/When/Then]
              │
              ▼
     /fremi-story-sdd ────────────────────► {workflow.sdd}          [contratos externos]
              │
              ▼
     /fremi-story-design ─────────────────► {workflow.design}            [tech + estructura interna]
              │
              ▼
     /fremi-story-tdd ────────────────────► {workflow.tdd}          [TC-XXX planeados]
              │
              ▼
     /fremi-story-plan ───────────────────► {workflow.plan}              [task-XXX en orden]
              │
              ▼
                    IMPLEMENTACIÓN
                    ─────────────
              │
              ▼
     /fremi-story-checkwork ──────────────► {workflow.checkwork} (LIVING) [estado en vivo]
              │  (cada task cerrada bumpea PATCH)
              ▼
     /fremi-story-verify ──────────────────► escribe reporte en FW-09
              │  (verdict: PASS / PASS WITH WARNINGS / FAIL)
              ▼
     /fremi-story-closure-check ──────────► auditar antes de firmar
              │  (verifica trazabilidad + versionado)
              ▼
     /fremi-story-closure ────────────────► `{workflow.closure}` FIRMADO
              │
              ▼
           STORY DONE
              │
              │ side_effect (Regla 17):
              └── bumpea FT-XX/definition.md (según parent_bump_triggers.story_closes)


     ═══════ TRANSVERSAL (parallel_allowed) durante toda la story ═══════

     /fremi-story-task            → agregar task-XXX al {workflow.plan}
     /fremi-story-checkwork       → actualizar estado (start/close/status)
     /fremi-story-adr             → registrar ADR local (HU-YY/decisions.md — delta)
     /fremi-story-bug             → registrar bug local (HU-YY/bugs/BG-XX_*)
     /fremi-enabler --story FT-XX/HU-YY → enabler local a la story
`

---

## Sequence detallado (13 steps)

### Step 0 — `/fremi-story-explore` (CONDICIONAL)
- **Condition**: aplica al menos uno de `explore_when` (área desconocida / 2+ approaches / integración nueva / migración).
- **Preconditions**: `feature/definition.md` existe con contenido.
- **Produces**: `{workflow.explore}`.
- **Regla 17**: snapshot v1.0.0, `ancestor.version_at_creation` = versión de `FT-XX/definition.md`.

### Step 1 — `/fremi-story-definition`
- **Preconditions**: `feature/definition.md` existe.
- **Produces**: `{workflow.definition}` con formato `As a / I want / So that` + CA-XXX.

### Step 2 — `/fremi-story-proposal` (CONDICIONAL)
- **Condition**: aplica al menos uno de `proposal_when` (contrato externo nuevo / bifurcación / 3+ archivos / user-facing / rollback risk).
- **Preconditions**: `{workflow.definition}` completo con CAs.
- **Produces**: `{workflow.proposal}` con Intent, Approach, Decisions (ADRs anclados), Impact, Risk.

### Step 3 — `/fremi-story-scope`
- **Preconditions**: `{workflow.definition}` completo.
- **Produces**: `{workflow.scope}` con In-scope / Out-of-scope / Dependencias.

### Step 4 — `/fremi-story-bdd`
- **Preconditions**: FW-01 + FW-03 completos.
- **Produces**: `{workflow.bdd}` con SC-XXX (happy path + borde).

### Step 5 — `/fremi-story-sdd`
- **Preconditions**: FW-04 con SC-XXX.
- **Produces**: `{workflow.sdd}` con contratos externos + errores expuestos + NFRs.

### Step 6 — `/fremi-story-design`
- **Preconditions**: FW-05 con contratos completos.
- **Produces**: `{workflow.design}` con tech + Key Invariants + Edge Cases Pin-Down + Open Questions + Acceptance Test Mapping (forward).

### Step 7 — `/fremi-story-tdd`
- **Preconditions**: FW-06 completo, Open Questions cerradas.
- **Produces**: `{workflow.tdd}` con TC-XXX mapeados a SC/SDD.

### Step 8 — `/fremi-story-plan`
- **Preconditions**: FW-07 con TCs.
- **Produces**: `{workflow.plan}` esqueleto con estructura + Backlog + Notas.
- Entries `task-XXX` se agregan con `/fremi-story-task` (parallel).

### Step 9 — `/fremi-story-checkwork` (LIVING durante implementación)
- **Preconditions**: `{workflow.plan}` con al menos 1 task.
- **Produces**: `{workflow.checkwork}` (living) — mantiene estado real.
- **Regla 17**: v0.1.0 inicial; PATCH por task cerrada; MINOR si aparece archivo nuevo implementado.

### Step 10 — `/fremi-story-verify`
- **Preconditions**: `{workflow.checkwork}` en **100%** de tasks cerradas.
- **Writes to**: sección "Última corrida de verify" dentro de `{workflow.checkwork}`.
- **Emite**: Verdict PASS / PASS WITH WARNINGS / FAIL.

### Step 11 — `/fremi-story-closure-check`
- **Preconditions**: `/fremi-story-verify` PASS o PASS WITH WARNINGS (aceptadas).
- **Produces**: reporte de gaps de trazabilidad + Regla 17 (bumps padre pendientes).

### Step 12 — `/fremi-story-closure`
- **Preconditions**: `/fremi-story-closure-check` sin gaps CRITICAL.
- **Produces**: `{workflow.closure}` FIRMADO con matriz de trazabilidad + DoD + sign-off.
- **Side effects** (Regla 17):
  - Bumpea `FT-XX/definition.md` (según `parent_bump_triggers.story_closes`).
  - Rellena `ancestor.version_at_closure` en el frontmatter del FW-10.

---

## Transversales (parallel_allowed)

### `/fremi-story-task <FT-XX/HU-YY> <título>`
- **When**: agregar task-XXX al plan de la story.
- **Writes to**: `{workflow.plan}`.
- **Regla 17**: bumpea PATCH del FW-08 (excepción — el plan es snapshot pero acepta additions via /fremi-story-task).

### `/fremi-story-checkwork <FT-XX/HU-YY> [--action start|close|status]`
- **When**: arrancar/cerrar una task, o refrescar estado.
- **Writes to**: `{workflow.checkwork}` (living).
- **Regla 17**: PATCH por task cerrada, MINOR si agrega archivo implementado.

### `/fremi-story-adr FT-XX/HU-YY <título>`
- **When**: aparece decisión técnica local a la story (Regla 3b).
- **Produces**: entry en `HU-YY/decisions.md` (living, delta).
- **Merge**: al firmar `/fremi-story-closure`, los ADRs se mergean a `FT-XX/decisions.md`.

### `/fremi-story-bug FT-XX/HU-YY <slug>`
- **When**: bug local descubierto durante la story.
- **Produces**: `HU-YY/bugs/`{bug.filename}`.
- **Ver flow completo**: [`flow.bug.story.md`](./flow.bug.story.md).

### `/fremi-enabler --story FT-XX/HU-YY <nombre>`
- **When**: trabajo técnico habilitador local a la story.
- **Produces**: `HU-YY/enablers/EN-XX_<slug>/`.
- **Ver flow completo**: [`flow.enabler.md`](./flow.enabler.md).

---

## Principio rector — la spec dirige el diseño

`
BDD (FW-04)  →  SDD (FW-05)  →  Design (FW-06)
qué observable    qué contractual    cómo estructural
`

Cada artefacto sólo consume decisiones de los anteriores. Nunca depende de uno posterior. Si un contenido depende de una decisión más adelante, está en el archivo equivocado.

---

## Reglas aplicables

- **Regla 1** — No se salta etapas. Precondiciones estrictas entre steps.
- **Regla 2** — No se escribe código sin FW-05 (SDD) + FW-07 (TDD).
- **Regla 3b** — Bifurcaciones disparan `/fremi-story-adr` (o `/fremi-feature-adr` o `/fremi-product-adr` según scope).
- **Regla 6** — Cadena BDD → SDD → Design (la spec dirige el diseño).
- **Regla 7** — TDD rojo primero (activado si `config.testing.strict_tdd: true`).
- **Regla 11** — Story no es DONE sin FW-10 firmado.
- **Regla 12** — Sync-back a feature/producto.
- **Regla 13** — Checkwork se mantiene al día durante implementación.
- **Regla 16** — Obligatoriedad condicional de FW-00 y FW-02.
- **Regla 17** — Versionado + linaje ancestral + bump del padre al cerrar.

---

## Referencias

- Config operativa: [`config.story.yaml`](../settings/config.story.yaml)
- Reglas duras: [`workflow.md`](../rules/workflow.md)
- Templates canónicos: `~/.fremi/framework/artifacts/story/skills/<sub>/references/`
- Flow feature (padre): [`flow.feature.md`](./flow.feature.md)
- Flow bug de story: [`flow.bug.story.md`](./flow.bug.story.md)
- Flow enabler: [`flow.enabler.md`](./flow.enabler.md)
