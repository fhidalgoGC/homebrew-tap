# Flujo — Capa PRODUCTO

> **Config operativa:** [`docs/frmwk/skills/product/config.user.yaml`](../settings/config.product.yaml)
> **Orquestador:** [`/fremi-product`](../skills/product/SKILL.md)
> **Rol:** discovery + formalización del producto (una vez al arrancar; luego se mantiene living).

---

## Qué produce esta capa

**7 docs living** en `docs/works/product/` (todos con frontmatter versionado, changelog al pie — Regla 17):

| # | Doc | Skill que lo puebla | Etapa |
|---|---|---|---|
| 1 | `iniciativas.md` | `/fremi-product-iniciativas` | Discovery |
| 2 | `ideas.md` | `/fremi-product-ideas` | Discovery |
| 3 | `planteamiento.md` | `/fremi-product-planteamiento` | Discovery |
| 4 | `definition.md` | `/fremi-product-definition` | Formalización |
| 5 | `strategies.md` | `/fremi-product-strategies` | Formalización |
| 6 | `decisions.md` | `/fremi-product-adr` | Formalización (transversal) |
| 7 | `plan.md` | `/fremi-product-plan` + `/fremi-feature` (agrega entries) | Formalización |

---

## Diagrama del flujo

```
                    DISCOVERY (divergente)
                    ─────────────────────

     /fremi-product-iniciativas ──► iniciativas.md
              │
              ▼
     /fremi-product-ideas ────────► ideas.md
              │
              ▼
     /fremi-product-planteamiento ─► planteamiento.md
              │
              ▼
                   FORMALIZACIÓN (convergente)
                   ────────────────────────────

     /fremi-product-definition ───► definition.md
              │
              ▼
     /fremi-product-strategies ───► strategies.md
              │
              ▼
     /fremi-product-plan ─────────► plan.md
              │
              ▼
        ➜ arranca /fremi-feature (primera feature)


     ═══════ TRANSVERSAL (parallel_allowed) ═══════
     /fremi-product-adr — corre en cualquier momento
                    (típicamente durante strategies o al aparecer bifurcaciones)
     ─────────────► decisions.md
```

---

## Sequence (7 pasos, todos con skill)

### Step 1 — `/fremi-product-iniciativas`
- **Preconditions**: ninguna (es la raíz del producto).
- **Produces**: `product/iniciativas.md`.
- **Etapa**: Discovery.
- **Regla 17**: `version: 0.1.0` inicial; MINOR por cada init-XXX nueva; PATCH por corrección; MAJOR por reformulación radical.

### Step 2 — `/fremi-product-ideas`
- **Preconditions**: `iniciativas.md` con al menos 1 init-XXX Aceptada.
- **Produces**: `product/ideas.md`.
- **Regla 17**: `ancestor.id: product`, `ancestor.version_at_creation` = versión actual de `iniciativas.md`. MINOR por idea nueva; PATCH por marcar como Descartada.

### Step 3 — `/fremi-product-planteamiento`
- **Preconditions**: `ideas.md` con al menos 3 ideas exploradas.
- **Produces**: `product/planteamiento.md`.
- **Regla 17**: `ancestor.version_at_creation` = versión de `ideas.md`. MAJOR si cambia el approach elegido.

### Step 4 — `/fremi-product-definition`
- **Preconditions**: `planteamiento.md` con approach elegido.
- **Produces**: `product/definition.md`.
- **Regla 17**: `ancestor.version_at_creation` = versión de `planteamiento.md`. MINOR por capacidad nueva in-scope; MAJOR por capacidad removida (breaking).

### Step 5 — `/fremi-product-strategies`
- **Preconditions**: `definition.md` con capacidades in-scope declaradas.
- **Produces**: `product/strategies.md`.
- **Regla 17**: `ancestor.version_at_creation` = versión de `definition.md`. MAJOR si cambia estrategia Elegida.
- **Bifurcaciones** (Regla 3b): al elegir estrategia con 2+ opciones viables → invocar `/fremi-product-adr` en paralelo.

### Step 6 — `/fremi-product-plan`
- **Preconditions**:
  - `definition.md` con capacidades.
  - `strategies.md` con estrategia Elegida.
- **Produces**: `product/plan.md` (roadmap).
- **Regla 17**: MINOR cuando `/fremi-feature` agrega feature nueva al plan.

### Transversal — `/fremi-product-adr`
- **Preconditions**: ninguna dura — se dispara cuando aparece bifurcación técnica (Regla 3b).
- **Produces**: entries en `product/decisions.md`.
- **Regla 17**: MINOR por ADR nuevo; MAJOR si el ADR reemplaza otro vigente.

---

## Cuándo invocar `/fremi-product` (orquestador)

- Al arrancar un proyecto — el skill audita qué falta y sugiere qué sub-skill correr.
- Antes de crear una feature nueva — validar que discovery + formalización básica estén cubiertos.
- Para diagnosticar estado (`/fremi-product audit`).

**No invocar** para agregar UN doc — usar el sub-skill directo.

---

## Regla 17 aplicada — dependencia ancestral

```
iniciativas.md (raíz)
        │
        ▼
    ideas.md  (ancestor.version_at_creation = versión de iniciativas.md)
        │
        ▼
planteamiento.md (ancestor.version_at_creation = versión de ideas.md)
        │
        ▼
   definition.md (ancestor.version_at_creation = versión de planteamiento.md)
        │
        ▼
  strategies.md (ancestor.version_at_creation = versión de definition.md)
        │
        ▼
       plan.md (ancestor.version_at_creation = versión de definition.md + strategies.md)

decisions.md (transversal — sin dependencia lineal ancestral)
```

---

## Reglas aplicables

- **Regla 1** — No se salta etapas.
- **Regla 3b** — Bifurcaciones técnicas disparan ADR (`/fremi-product-adr`).
- **Regla 4** — Discovery antes de formalización.
- **Regla 12** — Sync-back: si una feature/story descubre algo transversal → volver a producto.
- **Regla 17** — Living versioning + linaje ancestral.

---

## Referencias

- Config operativa: [`config.product.yaml`](../settings/config.product.yaml)
- Reglas duras: [`workflow.md`](../rules/workflow.md)
- Índice general de flujos: [`workflow.md`](./workflow.md)
- Auditoría: `/fremi-sync-check` (audita Regla 12 + Regla 17).
