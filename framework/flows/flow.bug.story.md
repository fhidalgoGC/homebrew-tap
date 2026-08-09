# Flujo — Capa BUG (scope: STORY)

> **Config operativa:** [`~/.fremi/framework/artifacts/story/skills/bug/config.core.yaml`](../artifacts/story/skills/bug/config.core.yaml)
> **Skill:** [`/fremi-story-bug`](../artifacts/story/skills/bug/SKILL.md)
> **Rol:** defecto en código de producción atribuible a **UNA story específica** (default y más común).
>
> Para bugs transversales a varias stories → ver [`flow.bug.feature.md`](./flow.bug.feature.md).

> **Convención de tokens** — `{bug.filename}` resuelve contra `~/.fremi/framework/settings/methodology.user.yaml → identifiers.bug`. Default: `BG-XX_<slug>.md`.

---

## Qué produce esta capa

**1 archivo único** por bug (`single_file: true`):

- Ubicación: `docs/works/features/{FT-XX}/user-stories/{HU-YY}/bugs/`{bug.filename}`
- Numeración: **local a cada story** — cada story arranca desde `BG-01` en su carpeta `bugs/`.

**Secciones del archivo**:

| # | Sección | Obligatoriedad |
|---|---|---|
| 1 | `symptom` | Siempre |
| 2 | `impact-severity` | Siempre |
| 3 | `reproduction-red-test` | Siempre — **Regla 8 (test rojo primero)** |
| 4 | `root-cause` | Siempre |
| 5 | `fix-applied` | Siempre |
| 6 | `linkages` | Condicional (`bug_linkages_when`) |
| 7 | `closure` | Siempre |

---

## Diagrama del flujo

`
     Detección del bug
              │
              ▼
     ¿El comportamiento incorrecto contradice
      la spec de UNA story existente?
              │
              ├── NO → volver: crear/extender story (Regla 8) primero
              │
              └── SÍ:
              ▼
     /fremi-story-bug FT-XX/HU-YY <slug>
              │
              │ Precondiciones:
              │  ├── Story existe con `{workflow.definition}` + `{workflow.sdd}`
              │  └── Comportamiento incorrecto documentado en spec de la story
              │
              ▼
     HU-YY/bugs/`{bug.filename}`    (snapshot, v1.0.0)
              │
              │ ancestor.id = HU-YY
              │ ancestor.version_at_creation = versión de `{workflow.definition}`
              │
              ▼
     ═══ PROCEDURE AFTER CREATION (no-skill, dentro del ciclo del bug) ═══

     1. Caracterizar reproducción precisa       → completa sección `reproduction-red-test`

     2. Agregar test rojo al {workflow.tdd}     ← invoca /fremi-story-tdd (parallel_allowed)
        de la story (Regla 8)                     El test DEBE fallar antes del fix

     3. Implementar el fix
        (el test rojo pasa a verde)

     4. Llenar root-cause y fix-applied          → completa esas secciones

     5. Firmar sección `## Cierre` del bug
              │
              │ side_effect (Regla 17):
              │  bumpea la story padre según parent_bump_triggers.bug_closes:
              │    - PATCH si respetó el contrato
              │    - MINOR si extendió el contrato
              │    - MAJOR si cambió el contrato (viola spec — Regla 10)
              │  rellena ancestor.version_at_closure
              ▼
           BUG CERRADO


     ═══════ PARALLEL_ALLOWED durante el ciclo ═══════

     /fremi-story-tdd    — agregar test rojo al FW-07 (Regla 8, step 2)
     /fremi-story-adr    — si el fix requiere decisión técnica local a la story
     /fremi-feature-adr  — si el fix reveló decisión técnica de feature
`

---

## Sequence (1 step con skill)

### Step 1 — `/fremi-story-bug FT-XX/HU-YY <slug>`
- **Preconditions**:
  - Story existe con `{workflow.definition}` y `{workflow.sdd}`.
  - El comportamiento incorrecto contradice la spec de la story (Regla 8 — si no, extender spec primero).
- **Produces**: `HU-YY/bugs/`{bug.filename}` (snapshot).
- **Regla 17**: `ancestor.id: HU-YY`, `ancestor.version_at_creation` = versión actual de la story.

---

## Procedure after creation (acciones NO-skill dentro del ciclo del bug)

Estas acciones son parte del **trabajo interno del bug**, guiado por el `SKILL.md` de `/fremi-story-bug`. **NO son steps del flow** (no son skills invocables), pero completan el ciclo:

1. **Caracterizar reproducción precisa** → llena parte de `reproduction-red-test`.
2. **Agregar test rojo al {workflow.tdd} de la story (Regla 8)** — con skill disponible `/fremi-story-tdd` para hacerlo formal.
   - **Constraint**: el test DEBE fallar antes de implementar el fix.
3. **Implementar el fix** → el test rojo pasa a verde.
4. **Llenar `root-cause` y `fix-applied`** en el archivo del bug.
5. **Firmar sección `## Cierre`** — dispara bump del padre (Regla 17).

---

## Transversales (parallel_allowed)

### `/fremi-story-tdd`
- **When**: agregar el test rojo de reproducción al `{workflow.tdd}` de la story (Regla 8).

### `/fremi-story-adr`
- **When**: el fix requirió una decisión técnica local a la story (Regla 3b).
- **Produces**: entry en `HU-YY/decisions.md`.

### `/fremi-feature-adr`
- **When**: el fix reveló una decisión técnica que aplica a toda la feature.

---

## Cuándo usar `/fremi-story-bug` vs alternativas

| Caso | Skill correcto |
|---|---|
| Bug encaja claramente en UNA story existente | **`/fremi-story-bug`** (este flow) |
| Bug transversal a varias stories de una feature | `/fremi-feature-bug` → [`flow.bug.feature.md`](./flow.bug.feature.md) |
| Comportamiento no especificado en ninguna spec | Primero crear/extender la story (Regla 8), después el bug |
| Es una mejora / capacidad nueva | `/fremi-feature` o `/fremi-story` |

---

## Regla 17 — dependencia ancestral

`
HU-YY/`{workflow.definition}` (versión al momento del bug)
        │
        ▼
HU-YY/bugs/`{bug.filename}`  (snapshot)
   ├── ancestor.id = HU-YY
   ├── ancestor.version_at_creation = versión al crear
   └── ancestor.version_at_closure = versión final del padre al cerrar
        │
        │ Al firmar el bug:
        └── bumpea HU-YY (según impacto)
             - PATCH: respetó contrato
             - MINOR: extendió contrato
             - MAJOR: cambió contrato (viola spec — necesita ADR)
`

---

## Reglas aplicables

- **Regla 8** — Bug fix con test rojo PRIMERO antes del fix (obligatorio).
- **Regla 10** — Si el fix cambia el contrato → actualizar `{workflow.sdd}` de la story + ADR.
- **Regla 15** — Bugs son opcionales (se crean bajo demanda al detectar defecto).
- **Regla 17** — Versionado + bump del padre al cerrar.

---

## Referencias

- Config operativa: [`config.bug.story.yaml`](../artifacts/story/skills/bug/config.core.yaml)
- Sibling scope: [`flow.bug.feature.md`](./flow.bug.feature.md)
- Regla 8 (test rojo primero): [`workflow.md`](../rules/workflow.md)
- Template canónico: [`~/.fremi/framework/artifacts/story/skills/bug/references/BG-template.md`](../artifacts/story/skills/bug/references/BG-template.md)
