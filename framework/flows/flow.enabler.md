# Flujo — Capa ENABLER

> **Config operativa:** [`~/.fremi/framework/framework/skills/enabler/config.user.yaml`](../settings/config.enabler.yaml)
> **Orquestador:** [`/fremi-enabler`](../skills/enabler/SKILL.md)
> **Rol:** trabajo técnico habilitador. NO tiene comportamiento user-facing por sí solo — habilita que features/stories puedan existir o cumplir sus contratos.

---

## Qué produce esta capa

**4 docs snapshot** en `EN-XX_<slug>/`:

| # | Doc | Skill | doc_type |
|---|---|---|---|
| 1 | `EN-01_definition.md` | `/fremi-enabler-definition` | snapshot |
| 2 | `EN-02_design.md` | `/fremi-enabler-design` | snapshot |
| 3 | `EN-03_plan.md` | `/fremi-enabler-plan` | snapshot |
| 4 | `EN-04_closure.md` | `/fremi-enabler-closure` | snapshot |

**Sin BDD/SDD/TDD** — el enabler no tiene comportamiento user-facing. Esa parte vive en las features/stories que consumen el enabler.

---

## Scopes admitidos (3 placements)

| Scope | Ubicación | Invocación | Cuándo |
|---|---|---|---|
| **Global** (default) | `docs/works/enablers/{EN-XX}/` | `/fremi-enabler <nombre>` | Transversal — no pertenece a UNA feature/story |
| **Feature** | `docs/works/features/{FT-XX}/enablers/{EN-XX}/` | `/fremi-enabler <nombre> --feature FT-XX` | Local a UNA feature |
| **Story** | `docs/works/features/{FT-XX}/user-stories/{HU-YY}/enablers/{EN-XX}/` | `/fremi-enabler <nombre> --story FT-XX/HU-YY` | Local a UNA story |

**Numeración EN-XX es global al proyecto** — evita colisiones entre scopes.

---

## Diagrama del flujo

```
     /fremi-enabler <nombre> [--feature FT-XX | --story FT-XX/HU-YY]
              │
              │ Precondiciones:
              │  └── Padre existe según scope (product/feature/story)
              │
              ▼
     Scaffold de los 4 docs (esqueletos vacíos)
              │
              ▼
     /fremi-enabler-definition ────► EN-01_definition.md  [qué habilita + vinculaciones]
              │
              ▼
     /fremi-enabler-design ────────► EN-02_design.md      [tech + estructura + ADRs]
              │
              ▼
     /fremi-enabler-plan ──────────► EN-03_plan.md        [T-XXX con criterios verificables]
              │
              ▼
              (implementación fuera del ciclo de docs)
              │
              ▼
     /fremi-enabler-closure ───────► EN-04_closure.md FIRMADO
              │
              │ side_effect (Regla 17):
              └── bumpea el padre según scope y parent_bump_triggers.enabler_closes


     ═══════ TRANSVERSAL (parallel_allowed) ═══════

     /fremi-product-adr / /fremi-feature-adr / /fremi-story-adr — según scope del enabler
                                                 (para decisiones técnicas en EN-02)
```

---

## Sequence (5 steps, todos con skill)

### Step 1 — `/fremi-enabler <nombre> [--feature FT-XX | --story FT-XX/HU-YY]`
- **Preconditions**: padre existe según scope.
- **Action**: create-scaffold.
- **Produces**: los 4 archivos EN-01..EN-04 (esqueletos).

### Step 2 — `/fremi-enabler-definition <EN-ID>`
- **Preconditions**: scaffold creado.
- **Produces**: `EN-01_definition.md` poblado con:
  - Qué habilita (capacidad técnica).
  - Vinculaciones (features/stories que dependen).
  - Criterios técnicos de aceptación (verificables).

### Step 3 — `/fremi-enabler-design <EN-ID>`
- **Preconditions**: EN-01 con contenido real.
- **Produces**: `EN-02_design.md` poblado con:
  - Tecnologías + librerías + versiones + justificación.
  - Estructura de archivos a crear.
  - Firmas TypeScript reales (o equivalente en otro stack).
- **Side effects**: ADRs generados si hubo bifurcaciones (Regla 3b).

### Step 4 — `/fremi-enabler-plan <EN-ID>`
- **Preconditions**: EN-02 con estructura declarada.
- **Produces**: `EN-03_plan.md` con task-XXX + criterios verificables (Regla 7b).

### Step 5 — `/fremi-enabler-closure <EN-ID>`
- **Preconditions**:
  - Todas las tasks de EN-03 en `[x]`.
  - Criterios técnicos de EN-01 verificados (comandos ejecutables, recursos existen).
- **Produces**: `EN-04_closure.md` FIRMADO.
- **Side effects** (Regla 17):
  - Bumpea el padre según scope y `parent_bump_triggers.enabler_closes`:
    - Global → bumpea `product/plan.md` MINOR.
    - Feature → bumpea `FT-XX/definition.md` MINOR o PATCH según impacto.
    - Story → bumpea `HU-YY/FW-01_definition.md` PATCH (informativo).
  - Rellena `ancestor.version_at_closure` en el frontmatter del EN-04.

---

## Transversales

### `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr`
- **When**: aparece decisión técnica en EN-02 con 2+ caminos viables (Regla 3b).
- **Scope del ADR**: coincide con el scope del enabler:
  - Enabler global → `/fremi-product-adr`.
  - Enabler de feature → `/fremi-feature-adr`.
  - Enabler de story → `/fremi-story-adr`.

---

## Cuándo usar `/fremi-enabler` vs alternativas

| Caso | Skill correcto |
|---|---|
| Endpoint nuevo / capacidad user-facing | `/fremi-feature` o `/fremi-story` |
| Tooling / scripts / refactor sin habilitar nada nuevo | `EX-NN` en `docs/works/extra/` |
| Defecto en código de producción | `/fremi-story-bug` o `/fremi-feature-bug` |
| Cambio en docs / metodología | `~/.fremi/framework/framework/` directo (o `EX-NN` si se registra como work item) |

---

## Regla 17 — dependencia ancestral

```
Padre (según scope):
  - Global   → product/plan.md
  - Feature  → FT-XX/definition.md
  - Story    → HU-YY/FW-01_definition.md
        │
        ▼
EN-01_definition.md (ancestor.version_at_creation = versión del padre al crear)
        │
        ▼
EN-02_design.md
        │
        ▼
EN-03_plan.md
        │
        ▼
EN-04_closure.md (rellena ancestor.version_at_closure al firmar)
        │
        │ side_effect: bumpea el padre
        ▼
Padre (nueva versión)
```

---

## Reglas aplicables

- **Regla 1** — Requiere padre existente según scope.
- **Regla 3b** — Bifurcaciones en EN-02 disparan ADR (según scope).
- **Regla 7b** — Tasks del EN-03 con criterios verificables.
- **Regla 15** — Enablers son opcionales (se crean bajo demanda cuando se identifica capacidad habilitadora).
- **Regla 17** — Versionado + bump del padre al cerrar.

---

## Referencias

- Config operativa: [`config.enabler.yaml`](../settings/config.enabler.yaml)
- Reglas duras: [`workflow.md`](../rules/workflow.md)
- Templates canónicos: `~/.fremi/framework/framework/skills/enabler/skills/<sub>/references/`
