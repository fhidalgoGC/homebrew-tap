# Flujo de Trabajo — makingFileReport (Índice)

Este documento es el **índice general** del flujo de trabajo. Cada capa/scope tiene su flow dedicado en un archivo separado.

El flujo combina **Product Discovery + SDD + BDD + TDD** organizado en **3 capas + artefactos opcionales**:

```
PRODUCTO  ──►  FEATURE  ──►  USER STORY  ──►  CÓDIGO
                    │            │
                    │            └── bugs (story-scope) + enablers (story-scope)
                    │
                    └── bugs (feature-scope) + enablers (feature-scope)

                    Además, transversales:
                    ─── enablers (global)
                    ─── extras (fuera del flujo)
```

---

## Principio central

> **Nada se construye hasta que se entiende qué producto queremos, qué features lo componen y qué historias de usuario lo justifican.**

La unidad mínima de valor es la **user story**. Cada story pertenece a una feature. Cada feature responde a una iniciativa del producto.

---

## Docs de flow por capa

Cada capa (y cada scope) tiene su archivo `flow.*.md` con:
- Docs que produce (con templates canónicos)
- Diagrama del flujo
- `flow.sequence[]` — secuencia de skills invocables (uno por step)
- `flow.parallel_allowed[]` — skills transversales que corren en cualquier momento
- Regla 17 aplicada — dependencia ancestral + bumps del padre
- Cuándo usar / cuándo NO usar cada skill

| Capa / Scope | Archivo | Orquestador | Config operativa |
|---|---|---|---|
| **Producto** (discovery + formalización) | [`flow.product.md`](./flow.product.md) | `/fremi-product` | [`config.product.yaml`](../settings/config.product.yaml) |
| **Feature** (línea de trabajo grande) | [`flow.feature.md`](./flow.feature.md) | `/fremi-feature` | [`config.feature.yaml`](../settings/config.feature.yaml) |
| **Story** (unidad de valor — 11 docs) | [`flow.story.md`](./flow.story.md) | `/fremi-story` | [`config.story.yaml`](../settings/config.story.yaml) |
| **Enabler** (trabajo habilitador) | [`flow.enabler.md`](./flow.enabler.md) | `/fremi-enabler` | [`config.enabler.yaml`](../settings/config.enabler.yaml) |
| **Bug scope story** (bug local) | [`flow.bug.story.md`](./flow.bug.story.md) | `/fremi-story-bug` | [`config.bug.story.yaml`](../settings/config.bug.story.yaml) |
| **Bug scope feature** (bug transversal) | [`flow.bug.feature.md`](./flow.bug.feature.md) | `/fremi-feature-bug` | [`config.bug.feature.yaml`](../settings/config.bug.feature.yaml) |
| **Extra** (fuera del flujo — tooling) | [`flow.extra.md`](./flow.extra.md) | *(sin skill)* | [`config.extra.yaml`](../settings/config.extra.yaml) |

---

## Estructura de `docs/works/`

```
docs/works/
├── product/                                  ← capa PRODUCTO — flow.product.md
│   ├── iniciativas.md                        ← discovery: objetivos estratégicos
│   ├── ideas.md                              ← discovery: brainstorm
│   ├── planteamiento.md                      ← discovery: framing + approach
│   ├── definition.md                         ← formalización: qué producto construimos
│   ├── strategies.md                         ← estrategias técnicas globales
│   ├── decisions.md                          ← ADRs globales acumulativos
│   └── plan.md                               ← roadmap de features
│
├── features/
│   └── FT-XX_<slug>/                         ← capa FEATURE — flow.feature.md
│       ├── definition.md
│       ├── decisions.md                      ← (condicional) ADRs locales
│       ├── enablers/EN-XX_<slug>/            ← (opcional) enablers feature-scope
│       ├── bugs/BG-XX_<slug>.md              ← (opcional) bugs feature-scope
│       └── user-stories/
│           └── HU-XX_<slug>/                 ← capa USER STORY — flow.story.md
│               ├── FW-00_explore.md          ← (condicional) investigación previa
│               ├── FW-01_definition.md       ← problema / por qué
│               ├── FW-02_proposal.md         ← (condicional) intent + approach
│               ├── FW-03_scope.md            ← límites
│               ├── FW-04_bdd-userstories.md  ← qué OBSERVABLE
│               ├── FW-05_sdd-spec.md         ← qué CONTRACTUAL
│               ├── FW-06_design.md           ← cómo ESTRUCTURAL
│               ├── FW-07_tdd-plan.md         ← cómo se VERIFICA
│               ├── FW-08_plan.md             ← en qué ORDEN
│               ├── FW-09_checkwork.md        ← estado EN VIVO (living)
│               ├── FW-10_closure.md          ← cierre + sign-off
│               ├── decisions.md              ← (opcional) ADRs locales a la story
│               ├── bugs/BG-XX_<slug>.md      ← (opcional) bugs story-scope
│               └── enablers/EN-XX_<slug>/    ← (opcional) enablers story-scope
│
├── enablers/                                 ← capa ENABLER global — flow.enabler.md
│   └── EN-XX_<slug>/
│       ├── EN-01_definition.md
│       ├── EN-02_design.md
│       ├── EN-03_plan.md
│       └── EN-04_closure.md
│
└── extra/                                    ← capa EXTRA (fuera del flujo) — flow.extra.md
    ├── EX-01_<slug>.md
    └── EX-02_<slug>.md
```

---

## Convención de nomenclatura

**Fuente de verdad**: [`~/.fremi/framework/settings/methodology.core.yaml`](../settings/methodology.core.yaml). Las descripciones son resumen.

- **Features**: `FT-XX_<slug>` — ID secuencial global, 2 dígitos.
- **Stories**: `HU-XX_<slug>` — ID secuencial local a la feature, 2 dígitos.
- **Docs de story**: `FW-XX_<name>.md` (FW-00..FW-10) — 11 docs.
- **Tasks**: `task-XXX` — 3 dígitos, locales a `FW-08_plan.md`.
- **ADRs**: `ADR-NNN` — 3 dígitos, **numeración GLOBAL** compartida entre `product/decisions.md`, `FT-XX/decisions.md` y `HU-YY/decisions.md`.
- **Enablers**: `EN-XX_<slug>` — 2 dígitos, global al proyecto.
- **Bugs**: `BG-XX_<slug>.md` — 2 dígitos, local al scope (story o feature).
- **Extras**: `EX-NN_<slug>.md` — global al proyecto.
- **IDs internos de story**: `CA-XXX` (criterios), `SC-XXX` (escenarios BDD), `TC-XXX` (tests). 3 dígitos, locales.
- **Iniciativas**: `init-XXX` — 3 dígitos, globales.

---

## Principios rectores del framework

### 1. La spec dirige el diseño

Cada artefacto sólo puede consumir decisiones de los **anteriores**. Nunca de uno **posterior**. Progresión de abstracción:

```
[explore] → definition → [proposal] → scope → BDD → SDD → Design → TDD → plan → checkwork → closure
```

**Reglas de frontera** entre artefactos de story:

| Frontera | Regla |
|---|---|
| **BDD vs SDD** | BDD = qué ve el usuario. SDD = contrato técnico de interfaces externas. "Qué código HTTP devuelve" = SDD; "qué ve el usuario ante tal acción" = BDD. |
| **SDD vs Design** | Si un contrato puede escribirse SIN decidir tecnología → SDD. Si sólo existe porque ya se eligió una librería/capa → Design. |
| **TBDs** | Se resuelven en el artefacto donde nace la decisión, no se arrastran al posterior. |

### 2. Bifurcación técnica → ADR (Regla 3b)

Cuando aparece una decisión técnica con 2+ caminos viables, la IA:
1. **Pausa** — no elige silenciosamente.
2. **Propone opciones** con pros/contras al usuario.
3. **Espera** la decisión explícita.
4. **Crea ADR** en el scope apropiado (`/fremi-product-adr`, `/fremi-feature-adr` o `/fremi-story-adr`).
5. **Continúa** referenciando el ADR desde el artefacto que nació.

### 3. Sync-back bidireccional (Regla 12)

Si trabajando en capa inferior se descubre algo que pertenece arriba (restricción transversal, ADR global, capacidad nueva, término), **actualizar la superior PRIMERO**. Auditar con `/fremi-sync-check`.

### 4. Living versioning + linaje ancestral (Regla 17)

- Cada artifact tiene **versión semver** en frontmatter.
- Docs **living** (product/\*, feature/definition, checkwork) bumpean con cada cambio + tienen changelog al pie.
- Docs **snapshot** (FW-XX, EN-XX, BG-XX, EX-XX) registran `ancestor.version_at_creation` al nacer y `ancestor.version_at_closure` al firmar.
- Al firmar closure de un snapshot → **bumpea el padre** según `parent_bump_triggers`.

---

## Índice de reglas duras

Detalle completo en [`~/.fremi/framework/rules/workflow.md`](../rules/workflow.md).

| # | Regla | Qué garantiza |
|---|---|---|
| 1 | No se salta etapas | Precondiciones entre docs |
| 2 | No código sin SDD + TDD | Spec-driven |
| 3 | Toda decisión técnica → ADR | Trazabilidad |
| 3b | Bifurcación → opciones → usuario decide → ADR | La IA no decide sola |
| 4 | Discovery antes de formalización | Producto con hipótesis validadas |
| 5 | Story empieza por `FW-01_definition` con formato As a / I want / So that | Rol + acción + beneficio |
| 6 | Cadena BDD → SDD → Design | La spec dirige el diseño |
| 7 | TDD rojo primero | Test antes de código |
| 7b | Plan = tareas con criterios verificables | Completitud auditable |
| 8 | Bug fix con test rojo previo | Regresión cubierta |
| 9 | Refactor no cambia comportamiento | Tests verdes antes y después |
| 10 | Docs son fuente de verdad | Sin divergencia silenciosa |
| 11 | Story no es DONE sin `FW-10_closure` validado | Sign-off explícito |
| 12 | Sync-back bidireccional entre capas | Coherencia inter-capa |
| 13 | Checkwork al día durante implementación | Estado real conocido |
| 14 | Trabajo fuera del flujo → `EX-NN` | Rastro de tooling/scripts |
| 15 | Enablers y bugs son OPCIONALES (bugs con 2 scopes) | Se crean bajo demanda |
| 16 | FW-00 y FW-02 condicionales según `config.story.yaml` | Papeleo mínimo |
| 17 | Living versioning + linaje ancestral | Trazabilidad temporal |
| 18 | Cada step del `flow.sequence` es un skill invocable | Interfaz clara skill ↔ acción |
| 19 | Templates viven en el skill dueño (symlinks en otros) | Single source of truth |
| 20 | ADRs / bugs / enablers siguen jerarquía de scopes | Ubicación explícita por alcance |
| 21 | Skills organizados jerárquicamente por capa | Estructura refleja relación conceptual |
| 22 | Config operativa per-capa (`config.<capa>.yaml`) | Escalabilidad + `active` flag por capa |
| 23 | Hooks como red de seguridad de Regla 17 | Validación automática en tiempo real |

---

## Índice de skills invocables

**Orquestadores por capa**:
- `/fremi-product` — capa producto
- `/fremi-feature` — capa feature
- `/fremi-story` — capa story
- `/fremi-enabler` — capa enabler (multi-scope)

**Sub-skills product** (7):
`/fremi-product-iniciativas`, `/fremi-product-ideas`, `/fremi-product-planteamiento`, `/fremi-product-definition`, `/fremi-product-strategies`, `/fremi-product-adr`, `/fremi-product-plan`

**Sub-skills feature** (2):
`/fremi-feature-adr`, `/fremi-feature-bug`

**Sub-skills story** (16):
`/fremi-story-explore`, `/fremi-story-definition`, `/fremi-story-proposal`, `/fremi-story-scope`, `/fremi-story-bdd`, `/fremi-story-sdd`, `/fremi-story-design`, `/fremi-story-tdd`, `/fremi-story-plan`, `/fremi-story-task`, `/fremi-story-checkwork`, `/fremi-story-verify`, `/fremi-story-closure-check`, `/fremi-story-closure`, `/fremi-story-adr`, `/fremi-story-bug`

**Sub-skills enabler** (4):
`/fremi-enabler-definition`, `/fremi-enabler-design`, `/fremi-enabler-plan`, `/fremi-enabler-closure`

**Globales** (transversales):
`/fremi` (orquestador de add/delete de skills/hooks/rules/mcp), `/fremi-import-template`, `/fremi-link-template-assets`, `/fremi-sync-check`

---

## Cómo empezar

1. **Producto nuevo**: `/fremi-product` para auditar estado → arrancar por `/fremi-product-iniciativas`.
2. **Feature nueva**: verificar que producto esté al día → `/fremi-feature <nombre>`.
3. **Story nueva**: verificar que feature exista → `/fremi-story FT-XX <nombre>` (crea el esqueleto de los 11 docs) → poblar cada uno con su sub-skill (`/fremi-story-definition`, `/fremi-story-scope`, ...).
4. **Auditoría periódica**: `/fremi-sync-check` (verifica Regla 12 + Regla 17).

---

## Referencias

- **Reglas duras**: [`~/.fremi/framework/rules/workflow.md`](../rules/workflow.md).
- **Configs operativas**: [`~/.fremi/framework/settings/config.yaml`](../settings/config.yaml) + 7 `config.<capa>.yaml`.
- **Nomenclatura**: [`~/.fremi/framework/settings/methodology.core.yaml`](../settings/methodology.core.yaml).
- **Skills invocables**: `~/.fremi/framework/skills/` (con jerarquía por capa).
- **CLAUDE.md** (entrada del agente): [`../../../CLAUDE.md`](../../../CLAUDE.md).
