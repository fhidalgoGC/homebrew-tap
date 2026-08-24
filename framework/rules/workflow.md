# Reglas del flujo de trabajo — makingFileReport

> **Documento de referencia:** `~/.fremi/framework/flows/workflow.md`
>
> Estas reglas son **obligatorias** para todo trabajo en este proyecto. Si una regla bloquea una acción, hay que volver a la etapa correspondiente del flujo, no saltarla.
>
> **Este archivo es el índice global.** Los archivos temáticos bajo esta carpeta contienen sólo reglas **cross-domain** (aplican a más de un artifact). Las reglas específicas de cada dominio (story, product, feature, enabler, extra) viven dentro de la carpeta artifact correspondiente, en `~/.fremi/framework/artifacts/<capa>/rules/`. Así el orquestador carga sólo lo relevante al dominio en uso.

---

## Jerarquía del trabajo

El proyecto se organiza en **3 capas**: PRODUCTO → FEATURE → USER STORY. Cada acción ocurre en una capa específica.

```
docs/works/
├── product/                                  ← capa PRODUCTO
│   ├── iniciativas.md         ┐
│   ├── ideas.md               │ discovery
│   ├── planteamiento.md       ┘
│   ├── definition.md          ┐
│   ├── strategies.md          │ formalización
│   ├── decisions.md           │
│   └── plan.md                ┘
└── features/
    └── FT-XX_<slug>/                         ← capa FEATURE
        ├── definition.md
        ├── decisions.md      (opcional, ADRs específicos)
        └── user-stories/
            └── HU-XX_<slug>/                 ← capa USER STORY
                ├── FW-00_explore.md          (OPCIONAL — investigación previa)
                ├── FW-01_definition.md       (problema / por qué — negocio/usuario)
                ├── FW-02_proposal.md         (OPCIONAL — intent + approach + risk)
                ├── FW-03_scope.md            (límites: in-scope / out-of-scope)
                ├── FW-04_bdd-userstories.md  (qué OBSERVABLE: Given/When/Then)
                ├── FW-05_sdd-spec.md         (qué CONTRACTUAL: interfaces externas)
                ├── FW-06_design.md           (cómo ESTRUCTURAL: tech, librerías, capas)
                ├── FW-07_tdd-plan.md         (cómo se VERIFICA: plan de tests)
                ├── FW-08_plan.md             (en qué ORDEN se construye)
                ├── FW-09_checkwork.md        (estado EN VIVO: listo / en curso / pendiente)
                └── FW-10_closure.md          (DoD + trazabilidad + sign-off)
```

### Convención de nomenclatura

> **Fuente de verdad de la NOMENCLATURA:** `~/.fremi/framework/settings/methodology.core.yaml`. Las descripciones de abajo son resumen — la configuración formal (regex, formats, scopes) vive en ese YAML. Para cambiar prefijos o padding (ej: `FT-01` → `F-001`), editar el YAML y hacer sweep.
>
> **Fuente de verdad OPERATIVA por capa:** cada capa tiene su propio triple de archivos bajo `~/.fremi/framework/artifacts/<capa>/`:
> - `workflow.yaml` — secuencia canónica de steps (fuente única).
> - `config.core.yaml` — matriz de agentes + paralelismo.
> - `config.user.yaml` — choices del usuario (execution_mode, step_agents, conditional_rules); template del framework que se copia al proyecto en `.fremi/settings/<capa>/config.user.yaml` en `fremi install`.

- **Features:** `FT-XX_<slug>` (`FT-01`, `FT-02`, ...). ID secuencial de 2 dígitos a nivel proyecto. Slug kebab-case descriptivo.
- **Stories:** `HU-XX_<slug>` (`HU-01`, `HU-02`, ...). ID secuencial de 2 dígitos **dentro de cada feature** (cada feature arranca desde `HU-01`).
- **Docs dentro de stories:** prefijados con `FW-XX_` (FrameWork) reflejando el **orden de ejecución del workflow**. La cadena tiene 11 docs (FW-00..FW-10), progresión abstracto → concreto: explore → definition → proposal → scope → bdd → sdd → design → tdd → plan → checkwork → closure. `FW-00_explore` y `FW-02_proposal` son **condicionales** (ver `artifacts/story/rules/conditional-docs.md`); los otros 9 son obligatorios siempre.
- **Tasks:** `task-XXX` (3 dígitos), locales al `FW-08_plan.md` de cada story.
- **ADRs:** `ADR-NNN` con numeración global de 3 dígitos, distribuidos entre `product/decisions.md`, `FT-XX/decisions.md` o story delta.
- **IDs internos de story:** `CA-XXX` (criterios), `SC-XXX` (escenarios BDD), `TC-XXX` (tests).
- **Iniciativas:** `init-XXX` (3 dígitos), globales en `product/iniciativas.md`.

### Principio rector

> **La spec dirige el diseño.** Cada artefacto sólo puede consumir decisiones tomadas en los artefactos **anteriores**. Nunca puede depender de uno **posterior**. Si un contenido depende de una decisión que se toma más adelante, está en el archivo equivocado: se mueve, no se invierte el orden.

Progresión de abstracción para stories:
```
[explore]  →  definition  →  [proposal]  →  scope  →  qué observable  →  qué contractual  →  cómo estructural  →  cómo se verifica  →  en qué orden  →  vivo  →  cierre
 FW-00        FW-01           FW-02        FW-03    FW-04 (bdd)          FW-05 (sdd-spec)   FW-06 (design)      FW-07 (tdd)        FW-08 (plan)   FW-09    FW-10
```

Ver **Regla 6** en `~/.fremi/framework/artifacts/story/rules/bdd-sdd-design.md` para las reglas de frontera entre artefactos.

---

## Índice de reglas

Las reglas del framework están distribuidas en **dos niveles**:

1. **Cross-domain** (aplican a más de un artifact) → viven en `~/.fremi/framework/rules/`.
2. **Domain-específicas** (aplican sólo a UN artifact) → viven en `~/.fremi/framework/artifacts/<capa>/rules/`.

Cada `applies.yaml` en la carpeta rules del artifact declara qué reglas cargar por step. Así el orquestador aísla la carga contextual.

### Reglas cross-domain (aquí — `~/.fremi/framework/rules/`)

| Archivo | Reglas | Cubre |
|---|---|---|
| [`hierarchy.md`](hierarchy.md) | R1, R4 | R1: no salta etapas (todas las capas). R4: discovery antes de formalización de PRODUCTO. |
| [`sync-back.md`](sync-back.md) | R10, R12 | Docs como fuente de verdad; sync-back bidireccional entre capas (no es closure de artifact). |
| [`versioning.md`](versioning.md) | R17 | Living versioning, frontmatter, bump rules, changelog, rastreo ancestral. |
| [`framework-mechanics.md`](framework-mechanics.md) | R18, R19, R21, R22, R23, R24 | Steps = skills invocables; templates en skill dueño; prefijo `fremi-`; config por capa; hooks; guard de instalación. |

### Reglas domain-específicas — capa STORY (`~/.fremi/framework/artifacts/story/rules/`)

| Archivo | Reglas | Cubre |
|---|---|---|
| [`../artifacts/story/rules/definition-format.md`](../artifacts/story/rules/definition-format.md) | R5 | Formato canónico del `FW-01_definition.md` (As a / I want / So that + CAs). |
| [`../artifacts/story/rules/conditional-docs.md`](../artifacts/story/rules/conditional-docs.md) | R16 | Cuándo son obligatorios `FW-00_explore` y `FW-02_proposal`. |
| [`../artifacts/story/rules/bdd-sdd-design.md`](../artifacts/story/rules/bdd-sdd-design.md) | R6 (6.1–6.4) | Cadena BDD → SDD → Design; reglas de frontera; la spec dirige el diseño. |
| [`../artifacts/story/rules/tdd.md`](../artifacts/story/rules/tdd.md) | R2, R7, R7b | No código sin SDD+TDD; test rojo primero; plan verificable. |
| [`../artifacts/story/rules/closure.md`](../artifacts/story/rules/closure.md) | R11 | Story no es DONE sin `FW-10_closure.md` con matriz de trazabilidad + DoD. |
| [`../artifacts/story/rules/checkwork.md`](../artifacts/story/rules/checkwork.md) | R13 | `FW-09_checkwork.md` se mantiene al día durante la implementación. |
| [`../artifacts/story/rules/adr.md`](../artifacts/story/rules/adr.md) | R3, R3b, R20 | ADRs por scope (producto/feature/story); patrón bifurcación → opciones → usuario decide → ADR. **Categorizada bajo story** — referenciada por product/feature/enabler/extra vía `applies.yaml`. |
| [`../artifacts/story/rules/bug-fix-and-refactor.md`](../artifacts/story/rules/bug-fix-and-refactor.md) | R8, R9 | Bug fix con test de reproducción; refactor no cambia comportamiento. **Categorizada bajo story** — referenciada por feature vía `applies.yaml`. |
| [`../artifacts/story/rules/bugs.md`](../artifacts/story/rules/bugs.md) | R15 (parte bugs) | Bugs como artefacto opcional; scopes (story/feature); estructura del archivo; anti-patrones. **Categorizada bajo story** — referenciada por feature/enabler/reverse-enabler vía `applies.yaml`. |

### Reglas domain-específicas — capa EXTRA (`~/.fremi/framework/artifacts/extra/rules/`)

| Archivo | Reglas | Cubre |
|---|---|---|
| [`../artifacts/extra/rules/extra-doc.md`](../artifacts/extra/rules/extra-doc.md) | R14 | Trabajo fuera del flujo spec-driven: cuándo aplica, estructura del archivo, "un archivo por concepto cohesivo", numeración, anti-patrones, cuándo promover a story. |

### Reglas domain-específicas — capa ENABLER (`~/.fremi/framework/artifacts/enabler/rules/`)

| Archivo | Reglas | Cubre |
|---|---|---|
| [`../artifacts/enabler/rules/enabler-lifecycle.md`](../artifacts/enabler/rules/enabler-lifecycle.md) | R15-enabler | Cuándo crear un enabler (criterios de activación), cuándo NO es enabler, ubicación por scope (global/feature/story), cadena liviana de 4 docs, procedimiento de cierre, anti-patrones. |

### Reglas domain-específicas — dominio REVERSE-ENGINEERING (`~/.fremi/framework/reverse-engineering/rules/`)

| Archivo | Reglas | Cubre |
|---|---|---|
| [`../reverse-engineering/rules/reverse.md`](../reverse-engineering/rules/reverse.md) | R25–R32 | Reverse-engineering como vía formal de alineación de código pre-existente. **Categorizada bajo reverse-engineering** — referenciada por los 6 reverse-* skills + los 4 reverse pipelines + product/discovery vía `applies.yaml` y prose. |

### Reglas domain-específicas — otras capas (pendientes de mover)

- **PRODUCT** — R4 (discovery) todavía vive en `hierarchy.md` global. Al restructurar `artifacts/product/` se moverá a `~/.fremi/framework/artifacts/product/rules/`.

---

## Cómo aplicar estas reglas

Antes de cada acción no trivial:

0. **Verificar instalación (Regla 24, ver `framework-mechanics.md`)**: antes de invocar cualquier skill/pipeline/hook, chequear que alguno de los orquestadores (`.claude/skills/fremi-story` por ejemplo) es symlink y `CLAUDE.md` existe. Si falla → proponer correr `fremi install` en la terminal y abortar la invocación.
1. **Identificar el tipo de pedido**: cambio de visión, nueva idea, nueva feature, nueva story, cambio de comportamiento, **bug** (Regla 8 + 15), **enabler técnico** (Regla 15), refactor, decisión técnica, **tooling/refactor sin habilitar nada** (Regla 14), **alinear código pre-existente sin docs** (Reglas 25-32, ver `reverse.md`).
2. **Identificar la capa** — el dominio dicta qué carpeta `rules/` cargar. Si es story → `~/.fremi/framework/artifacts/story/rules/`. Si es cross-artifact → las reglas de esta carpeta global.
3. **Consultar `applies.yaml`** del artifact — declara qué reglas aplican por step.
4. **Verificar precondiciones** (Regla 1, ver `hierarchy.md`).
5. Si falta una etapa previa: **proponer crearla**, no improvisar.
6. Al crear cualquier artifact: **capturar la versión actual del padre** en el frontmatter (Regla 17, ver `versioning.md`). Al cerrar: **bumpear el padre** según `parent_bump_triggers`.
