# Flujo — Capa STORY

> **Config operativa:** [`~/.fremi/framework/framework/skills/story/config.user.yaml`](../settings/config.story.yaml)
> **Orquestador:** [`/fremi-story`](../skills/story/SKILL.md)
> **Rol:** unidad mínima de valor. Cada story pertenece a una feature. Cadena de 11 docs FW-00..FW-10.

---

## Qué produce esta capa

**11 docs FW-XX** en `HU-YY_<slug>/` (2 condicionales, 9 obligatorios):

| # | Doc | Skill | Obligatoriedad | doc_type |
|---|---|---|---|---|
| 0 | `FW-00_explore.md` | `/fremi-story-explore` | Condicional (`explore_when`) | snapshot |
| 1 | `FW-01_definition.md` | `/fremi-story-definition` | Siempre | snapshot |
| 2 | `FW-02_proposal.md` | `/fremi-story-proposal` | Condicional (`proposal_when`) | snapshot |
| 3 | `FW-03_scope.md` | `/fremi-story-scope` | Siempre | snapshot |
| 4 | `FW-04_bdd-userstories.md` | `/fremi-story-bdd` | Siempre | snapshot |
| 5 | `FW-05_sdd-spec.md` | `/fremi-story-sdd` | Siempre | snapshot |
| 6 | `FW-06_design.md` | `/fremi-story-design` | Siempre | snapshot |
| 7 | `FW-07_tdd-plan.md` | `/fremi-story-tdd` | Siempre | snapshot |
| 8 | `FW-08_plan.md` | `/fremi-story-plan` | Siempre | snapshot |
| 9 | `FW-09_checkwork.md` | `/fremi-story-checkwork` + `/fremi-story-verify` | Siempre | **living** |
| 10 | `FW-10_closure.md` | `/fremi-story-closure` | Siempre | snapshot |

**Verify phase**: NO tiene doc dedicado — su reporte se inserta como sección "Última corrida de verify" dentro de `FW-09_checkwork.md`.

---

## Diagrama del flujo (13 steps)

```
                    ESCALERA DE ABSTRACCIÓN (baja de arriba hacia abajo)
                    ────────────────────────────────────────────────────

     /fremi-story-explore (condicional)  ──► FW-00_explore.md      [investigar terreno]
              │
              ▼
     /fremi-story-definition ─────────────► FW-01_definition.md    [problema / por qué]
              │
              ▼
     /fremi-story-proposal (condicional)  ─► FW-02_proposal.md      [intent + approach + risk]
              │
              ▼
     /fremi-story-scope ──────────────────► FW-03_scope.md          [in / out / dependencias]
              │
              ▼
     /fremi-story-bdd ────────────────────► FW-04_bdd-userstories   [Given/When/Then]
              │
              ▼
     /fremi-story-sdd ────────────────────► FW-05_sdd-spec          [contratos externos]
              │
              ▼
     /fremi-story-design ─────────────────► FW-06_design            [tech + estructura interna]
              │
              ▼
     /fremi-story-tdd ────────────────────► FW-07_tdd-plan          [TC-XXX planeados]
              │
              ▼
     /fremi-story-plan ───────────────────► FW-08_plan              [task-XXX en orden]
              │
              ▼
                    IMPLEMENTACIÓN
                    ─────────────
              │
              ▼
     /fremi-story-checkwork ──────────────► FW-09_checkwork (LIVING) [estado en vivo]
              │  (cada task cerrada bumpea PATCH)
              ▼
     /fremi-story-verify ──────────────────► escribe reporte en FW-09
              │  (verdict: PASS / PASS WITH WARNINGS / FAIL)
              ▼
     /fremi-story-closure-check ──────────► auditar antes de firmar
              │  (verifica trazabilidad + versionado)
              ▼
     /fremi-story-closure ────────────────► FW-10_closure.md FIRMADO
              │
              ▼
           STORY DONE
              │
              │ side_effect (Regla 17):
              └── bumpea FT-XX/definition.md (según parent_bump_triggers.story_closes)


     ═══════ TRANSVERSAL (parallel_allowed) durante toda la story ═══════

     /fremi-story-task            → agregar task-XXX al FW-08_plan
     /fremi-story-checkwork       → actualizar estado (start/close/status)
     /fremi-story-adr             → registrar ADR local (HU-YY/decisions.md — delta)
     /fremi-story-bug             → registrar bug local (HU-YY/bugs/BG-XX_*)
     /fremi-enabler --story FT-XX/HU-YY → enabler local a la story
```

---

## Sequence detallado (13 steps)

### Step 0 — `/fremi-story-explore` (CONDICIONAL)
- **Condition**: aplica al menos uno de `explore_when` (área desconocida / 2+ approaches / integración nueva / migración).
- **Preconditions**: `feature/definition.md` existe con contenido.
- **Produces**: `FW-00_explore.md`.
- **Regla 17**: snapshot v1.0.0, `ancestor.version_at_creation` = versión de `FT-XX/definition.md`.

### Step 1 — `/fremi-story-definition`
- **Preconditions**: `feature/definition.md` existe.
- **Produces**: `FW-01_definition.md` con formato `As a / I want / So that` + CA-XXX.

### Step 2 — `/fremi-story-proposal` (CONDICIONAL)
- **Condition**: aplica al menos uno de `proposal_when` (contrato externo nuevo / bifurcación / 3+ archivos / user-facing / rollback risk).
- **Preconditions**: `FW-01_definition.md` completo con CAs.
- **Produces**: `FW-02_proposal.md` con Intent, Approach, Decisions (ADRs anclados), Impact, Risk.

### Step 3 — `/fremi-story-scope`
- **Preconditions**: `FW-01_definition.md` completo.
- **Produces**: `FW-03_scope.md` con In-scope / Out-of-scope / Dependencias.

### Step 4 — `/fremi-story-bdd`
- **Preconditions**: FW-01 + FW-03 completos.
- **Produces**: `FW-04_bdd-userstories.md` con SC-XXX (happy path + borde).

### Step 5 — `/fremi-story-sdd`
- **Preconditions**: FW-04 con SC-XXX.
- **Produces**: `FW-05_sdd-spec.md` con contratos externos + errores expuestos + NFRs.

### Step 6 — `/fremi-story-design`
- **Preconditions**: FW-05 con contratos completos.
- **Produces**: `FW-06_design.md` con tech + Key Invariants + Edge Cases Pin-Down + Open Questions + Acceptance Test Mapping (forward).

### Step 7 — `/fremi-story-tdd`
- **Preconditions**: FW-06 completo, Open Questions cerradas.
- **Produces**: `FW-07_tdd-plan.md` con TC-XXX mapeados a SC/SDD.

### Step 8 — `/fremi-story-plan`
- **Preconditions**: FW-07 con TCs.
- **Produces**: `FW-08_plan.md` esqueleto con estructura + Backlog + Notas.
- Entries `task-XXX` se agregan con `/fremi-story-task` (parallel).

### Step 9 — `/fremi-story-checkwork` (LIVING durante implementación)
- **Preconditions**: `FW-08_plan.md` con al menos 1 task.
- **Produces**: `FW-09_checkwork.md` (living) — mantiene estado real.
- **Regla 17**: v0.1.0 inicial; PATCH por task cerrada; MINOR si aparece archivo nuevo implementado.

### Step 10 — `/fremi-story-verify`
- **Preconditions**: `FW-09_checkwork.md` en **100%** de tasks cerradas.
- **Writes to**: sección "Última corrida de verify" dentro de `FW-09_checkwork.md`.
- **Emite**: Verdict PASS / PASS WITH WARNINGS / FAIL.

### Step 11 — `/fremi-story-closure-check`
- **Preconditions**: `/fremi-story-verify` PASS o PASS WITH WARNINGS (aceptadas).
- **Produces**: reporte de gaps de trazabilidad + Regla 17 (bumps padre pendientes).

### Step 12 — `/fremi-story-closure`
- **Preconditions**: `/fremi-story-closure-check` sin gaps CRITICAL.
- **Produces**: `FW-10_closure.md` FIRMADO con matriz de trazabilidad + DoD + sign-off.
- **Side effects** (Regla 17):
  - Bumpea `FT-XX/definition.md` (según `parent_bump_triggers.story_closes`).
  - Rellena `ancestor.version_at_closure` en el frontmatter del FW-10.

---

## Transversales (parallel_allowed)

### `/fremi-story-task <FT-XX/HU-YY> <título>`
- **When**: agregar task-XXX al plan de la story.
- **Writes to**: `FW-08_plan.md`.
- **Regla 17**: bumpea PATCH del FW-08 (excepción — el plan es snapshot pero acepta additions via /fremi-story-task).

### `/fremi-story-checkwork <FT-XX/HU-YY> [--action start|close|status]`
- **When**: arrancar/cerrar una task, o refrescar estado.
- **Writes to**: `FW-09_checkwork.md` (living).
- **Regla 17**: PATCH por task cerrada, MINOR si agrega archivo implementado.

### `/fremi-story-adr FT-XX/HU-YY <título>`
- **When**: aparece decisión técnica local a la story (Regla 3b).
- **Produces**: entry en `HU-YY/decisions.md` (living, delta).
- **Merge**: al firmar `/fremi-story-closure`, los ADRs se mergean a `FT-XX/decisions.md`.

### `/fremi-story-bug FT-XX/HU-YY <slug>`
- **When**: bug local descubierto durante la story.
- **Produces**: `HU-YY/bugs/BG-XX_<slug>.md`.
- **Ver flow completo**: [`flow.bug.story.md`](./flow.bug.story.md).

### `/fremi-enabler --story FT-XX/HU-YY <nombre>`
- **When**: trabajo técnico habilitador local a la story.
- **Produces**: `HU-YY/enablers/EN-XX_<slug>/`.
- **Ver flow completo**: [`flow.enabler.md`](./flow.enabler.md).

---

## Principio rector — la spec dirige el diseño

```
BDD (FW-04)  →  SDD (FW-05)  →  Design (FW-06)
qué observable    qué contractual    cómo estructural
```

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
- Templates canónicos: `~/.fremi/framework/framework/skills/story/skills/<sub>/references/`
- Flow feature (padre): [`flow.feature.md`](./flow.feature.md)
- Flow bug de story: [`flow.bug.story.md`](./flow.bug.story.md)
- Flow enabler: [`flow.enabler.md`](./flow.enabler.md)
