# Flujo — Capa BUG (scope: FEATURE)

> **Config operativa:** [`~/.fremi/framework/artifacts/feature/skills/bug/config.core.yaml`](../artifacts/feature/skills/bug/config.core.yaml)
> **Skill:** [`/fremi-feature-bug`](../artifacts/feature/skills/bug/SKILL.md)
> **Rol:** defecto **transversal a varias stories** de una feature, o que afecta el contrato de feature sin trazar limpio a UNA story específica.
>
> Para bugs locales a una story → ver [`flow.bug.story.md`](./flow.bug.story.md).

---

## Qué produce esta capa

**1 archivo único** por bug:

- Ubicación: `docs/works/features/{FT-XX}/bugs/BG-XX_<slug>.md`
- Numeración: **local a cada feature** — cada feature arranca desde `BG-01`.

**Secciones**: mismas que bug de story (symptom, impact-severity, reproduction-red-test, root-cause, fix-applied, linkages, closure). **Diferencia clave**: en bug de feature, la sección `linkages` es **prácticamente siempre obligatoria** (múltiples stories/ADRs involucrados).

---

## Diagrama del flujo

```
     Detección del bug
              │
              ▼
     ¿El bug se atribuye a UNA story específica?
              │
              ├── SÍ → usar /fremi-story-bug (ver flow.bug.story.md)
              │
              └── NO (transversal a varias / afecta contrato de feature):
              ▼
     /fremi-feature-bug FT-XX <slug>
              │
              │ Precondiciones:
              │  ├── Feature existe con FT-XX/definition.md
              │  │    (y FT-XX/spec.md si ya se implementó living-spec)
              │  └── Comportamiento incorrecto contradice contratos declarados
              │       a nivel feature (no atribuible limpio a UNA story)
              │
              ▼
     FT-XX/bugs/BG-XX_<slug>.md    (snapshot, v1.0.0)
              │
              │ ancestor.id = FT-XX
              │ ancestor.version_at_creation = versión de FT-XX/definition.md
              │
              ▼
     ═══ PROCEDURE AFTER CREATION (no-skill) ═══

     1. Caracterizar reproducción precisa

     2. Identificar suite de tests apropiada    → completa parte de `linkages`
        (típicamente en la story cuya spec
         cubre el comportamiento afectado)

     3. Agregar test rojo al FW-07_tdd-plan     ← invoca /fremi-story-tdd (parallel_allowed)
        de la story elegida (Regla 8)             El test DEBE fallar antes del fix

     4. Implementar el fix (puede tocar código
        de múltiples stories)

     5. Llenar root-cause, fix-applied, linkages → linkages OBLIGATORIA acá
        (referencias a stories/ADRs afectados)

     6. Firmar sección `## Cierre` del bug
              │
              │ side_effect (Regla 17):
              │  bumpea la feature padre según parent_bump_triggers.bug_closes:
              │    - PATCH si respetó el contrato
              │    - MINOR si extendió el contrato
              │    - MAJOR si cambió el contrato
              │  rellena ancestor.version_at_closure
              ▼
           BUG CERRADO


     ═══════ PARALLEL_ALLOWED durante el ciclo ═══════

     /fremi-story-tdd    — agregar test rojo al FW-07 de la story cuya spec cubre el bug
     /fremi-feature-adr  — si el fix requiere decisión técnica local a la feature
     /fremi-product-adr  — si el fix reveló decisión técnica transversal al producto
```

---

## Sequence (1 step con skill)

### Step 1 — `/fremi-feature-bug FT-XX <slug>`
- **Preconditions**:
  - Feature existe con `FT-XX/definition.md` (y `FT-XX/spec.md` si ya se implementó living-spec).
  - El comportamiento incorrecto contradice contratos declarados a nivel feature (NO atribuible limpio a UNA story).
- **Produces**: `FT-XX/bugs/BG-XX_<slug>.md` (snapshot).
- **Regla 17**: `ancestor.id: FT-XX`, `ancestor.version_at_creation` = versión actual de la feature.

---

## Procedure after creation (acciones NO-skill)

1. **Caracterizar reproducción precisa**.
2. **Identificar suite de tests apropiada** — típicamente en la story cuya spec cubre el comportamiento afectado. Este paso llena parte de `linkages`.
3. **Agregar test rojo al `FW-07_tdd-plan` de la story elegida** (Regla 8) — con skill disponible `/fremi-story-tdd`.
   - **Constraint**: el test DEBE fallar antes de implementar el fix.
4. **Implementar el fix** — puede tocar código de múltiples stories.
5. **Llenar `root-cause`, `fix-applied` y `linkages`** — en bugs de feature, `linkages` es prácticamente obligatoria.
6. **Firmar sección `## Cierre`** — dispara bump del padre.

---

## Transversales (parallel_allowed)

### `/fremi-story-tdd`
- **When**: agregar test rojo al `FW-07_tdd-plan` de la story cuya spec cubre el comportamiento afectado.

### `/fremi-feature-adr`
- **When**: el fix requirió una decisión técnica local a la feature.

### `/fremi-product-adr`
- **When**: el fix reveló una decisión técnica transversal al producto.

---

## Cuándo usar `/fremi-feature-bug` vs alternativas

| Caso | Skill correcto |
|---|---|
| Bug transversal a varias stories de una feature | **`/fremi-feature-bug`** (este flow) |
| Bug local a UNA story | `/fremi-story-bug` → [`flow.bug.story.md`](./flow.bug.story.md) |
| Bug transversal a MÚLTIPLES features | Escalar a story de producto o `EX-NN`. NO es bug de feature. |
| Cambio de spec consciente (spec estaba mal) | Regla 10 — actualizar spec + ADR (no es bug) |
| Cambio de tooling / build / IaC sin defecto en producción | `EX-NN` en `docs/works/extra/` |

---

## Regla 17 — dependencia ancestral

```
FT-XX/definition.md (versión al momento del bug)
        │
        ▼
FT-XX/bugs/BG-XX_<slug>.md  (snapshot)
   ├── ancestor.id = FT-XX
   ├── ancestor.version_at_creation = versión de definition.md al crear
   └── ancestor.version_at_closure = versión final de definition.md al cerrar
        │
        │ Al firmar el bug:
        └── bumpea FT-XX/definition.md (según impacto)
             - PATCH: respetó contrato de feature
             - MINOR: extendió contrato
             - MAJOR: cambió contrato
```

---

## Reglas aplicables

- **Regla 8** — Bug fix con test rojo PRIMERO antes del fix (obligatorio).
- **Regla 10** — Si el fix cambia el contrato de feature → actualizar `FT-XX/definition.md` + ADR.
- **Regla 12** — Sync-back: si el fix revela algo transversal al producto → subir a producto.
- **Regla 15** — Bugs son opcionales.
- **Regla 17** — Versionado + bump del padre al cerrar.

---

## Referencias

- Config operativa: [`config.bug.feature.yaml`](../artifacts/feature/skills/bug/config.core.yaml)
- Sibling scope: [`flow.bug.story.md`](./flow.bug.story.md)
- Regla 8 (test rojo primero): [`workflow.md`](../rules/workflow.md)
- Template canónico: [`~/.fremi/framework/artifacts/feature/skills/bug/references/BG-template.md`](../artifacts/feature/skills/bug/references/BG-template.md)
