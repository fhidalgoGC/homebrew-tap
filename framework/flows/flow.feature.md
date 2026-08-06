# Flujo — Capa FEATURE

> **Config operativa:** [`~/.fremi/framework/framework/skills/feature/config.user.yaml`](../settings/config.feature.yaml)
> **Orquestador:** [`/fremi-feature`](../skills/feature/SKILL.md)
> **Rol:** línea de trabajo grande dentro del producto que contiene múltiples user stories.

---

## Qué produce esta capa

**2 docs en `docs/works/features/FT-XX_<slug>/`**:

| Doc | Skill | Obligatoriedad | doc_type |
|---|---|---|---|
| `definition.md` | `/fremi-feature` (creación) | Siempre | living |
| `decisions.md` | `/fremi-feature-adr` | Condicional (`feature_decisions_when`) | living |

**Futuro (Regla 17 living-specs)**:
- `spec.md` (living) — contrato agregado consolidado de stories cerradas.

---

## Diagrama del flujo

```
                    CREACIÓN DE FEATURE
                    ───────────────────

     /fremi-feature <nombre>
           │
           │ Precondiciones:
           │  ├── product/plan.md contiene esta feature como planeada
           │  └── product/definition.md con capacidades in-scope
           │
           ▼
     features/FT-XX_<slug>/
     └── definition.md            (living, v0.1.0)
           │
           │ side_effect: bumpea MINOR de product/plan.md
           │
           ▼
     product/plan.md              (feature agregada al roadmap)


     ═══════ TRANSVERSAL (parallel_allowed) ═══════

     /fremi-feature-adr FT-XX   ─────► FT-XX/decisions.md  (living, ADRs locales)
     /fremi-feature-bug FT-XX   ─────► FT-XX/bugs/BG-XX_*.md
     /fremi-story <FT-XX>       ─────► FT-XX/user-stories/HU-YY_*/ (arranca capa story)
     /fremi-enabler --feature FT-XX ─► FT-XX/enablers/EN-XX_*/
```

---

## Sequence (1 paso creador)

### Step 1 — `/fremi-feature <nombre>`
- **Preconditions**:
  - `product/plan.md` con esta feature planeada (o el skill la agrega + bumpea plan MINOR).
  - `product/definition.md` con capacidades in-scope claras.
- **Produces**: `docs/works/features/FT-XX_<slug>/definition.md`.
- **Side effects**:
  - Bumpea **MINOR** en `product/plan.md` (feature agregada al roadmap).
  - Agrega entry al changelog de `plan.md`.
- **Regla 17**: `ancestor.id: product`, `ancestor.version_at_creation` = versión de `product/plan.md` al momento.

---

## Transversales (parallel_allowed) — durante toda la vida de la feature

### `/fremi-feature-adr FT-XX <título>`
- **When**: aparece decisión técnica local a la feature (Regla 3b).
- **Produces**: entries en `FT-XX/decisions.md`.
- **Side effects**: bumpea MINOR de `FT-XX/decisions.md` (o MAJOR si reemplaza otro ADR).

### `/fremi-feature-bug FT-XX <slug>`
- **When**: bug transversal a varias stories de la feature, o afecta contrato de feature sin trazar limpio a UNA story.
- **Produces**: `FT-XX/bugs/BG-XX_<slug>.md`.
- **Ver flow completo**: [`flow.bug.feature.md`](./flow.bug.feature.md).

### `/fremi-story <FT-XX> <nombre>`
- **When**: crear una story dentro de la feature.
- **Produces**: `FT-XX/user-stories/HU-YY_<slug>/` con esqueleto de los 11 docs.
- **Ver flow completo**: [`flow.story.md`](./flow.story.md).

### `/fremi-enabler --feature FT-XX <nombre>`
- **When**: trabajo técnico habilitador local a la feature.
- **Produces**: `FT-XX/enablers/EN-XX_<slug>/`.
- **Ver flow completo**: [`flow.enabler.md`](./flow.enabler.md).

---

## Condicional — `feature/decisions.md`

Se crea vía `/fremi-feature-adr` cuando aparecen ADRs locales a la feature (que no ameritan promoverse a producto).

**Regla `feature_decisions_when`** (en `config.feature.yaml`):

> `decisions.md` de feature es **obligatorio** cuando hay al menos un ADR aceptado que aplica sólo a esta feature. Opcional si todos los ADRs de la feature son transversales al producto (y viven en `product/decisions.md`).

---

## Cierre de la feature

Actualmente el cierre de una feature es **implícito** (no hay skill `/feature-closure` dedicado — cierra cuando sus stories cierran).

**Regla 17 al cerrar** (según `parent_bump_triggers.feature_closes` en `config.yaml` master):
- Bumpear **MINOR** de `product/plan.md` (marca la feature como completada).
- Bumpear `product/definition.md` según impacto (PATCH si aclara / MINOR si agrega capacidad / MAJOR si redefine).

*(Considerar crear `/feature-closure` explícito en un futuro pase si el usuario lo pide.)*

---

## Regla 17 — dependencia ancestral

```
product/plan.md
        │
        ▼
FT-XX/definition.md (ancestor.version_at_creation = versión de plan.md al crear)
        │
        ├────► FT-XX/decisions.md (ADRs locales — vive junto)
        │
        ├────► FT-XX/user-stories/HU-YY/* (11 docs + bugs + decisions + enablers)
        │
        └────► FT-XX/bugs/BG-XX_* (bugs de feature)
```

Al cerrar stories dentro de la feature, esas stories bumpean `FT-XX/definition.md` (y futuro `FT-XX/spec.md`).

---

## Reglas aplicables

- **Regla 1** — Requiere `product/plan.md` con la feature listada (o el skill la agrega).
- **Regla 3b** — Bifurcaciones técnicas locales disparan `/fremi-feature-adr`.
- **Regla 11** — Feature no cierra sin sus stories cerradas.
- **Regla 12** — Sync-back: descubrimientos transversales suben a producto.
- **Regla 15** — Enablers y bugs son opcionales (se crean bajo demanda).
- **Regla 17** — Living versioning + linaje ancestral.

---

## Referencias

- Config operativa: [`config.feature.yaml`](../settings/config.feature.yaml)
- Reglas duras: [`workflow.md`](../rules/workflow.md)
- Flow de story dentro de esta feature: [`flow.story.md`](./flow.story.md)
- Flow de bug de feature: [`flow.bug.feature.md`](./flow.bug.feature.md)
- Flow de enabler: [`flow.enabler.md`](./flow.enabler.md)
