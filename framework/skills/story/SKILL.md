---
name: fremi-story
description: Crea una nueva user story dentro de una feature, con los 11 docs prefijados (FW-00..FW-10) según la configuración del workflow. Lee la nomenclatura desde ~/.fremi/framework/settings/methodology.core.yaml y la obligatoriedad condicional de FW-00_explore y FW-02_proposal desde ~/.fremi/framework/settings/config.yaml. NO usa prefijos hardcoded. Usar cuando el usuario quiere crear una historia nueva dentro de una feature existente.
---

# /fremi-story — Crear nueva user story

Crea el folder de una user story con los **docs en plantilla** dentro de la feature indicada, todos prefijados según la configuración de **`~/.fremi/framework/settings/methodology.core.yaml`** (nomenclatura) y **`~/.fremi/framework/settings/config.yaml`** (obligatoriedad operativa).

La cadena canónica tiene **11 docs** (`FW-00..FW-10`), pero dos son de **obligatoriedad condicional** — `FW-00_explore` y `FW-02_proposal` sólo se crean cuando aplican los criterios declarados en `config.story.yaml → conditional_rules` (ver Regla 16).

> **Importante:** este skill NO tiene prefijos ni nombres de archivos hardcoded. Lee `identifiers.story`, `identifiers.workflow_doc` y `identifiers.workflow_doc.items[]` del JSON para derivar nombres, formatos y orden. Si la convención cambia, el skill se adapta.

## Sintaxis

```
/fremi-story <FEATURE_ID> <nombre-descriptivo>
```

- `<FEATURE_ID>`: ID de la feature padre (ej: `FT-03`) o slug completo (`FT-03_reportes-mensuales`). El formato concreto sale de `identifiers.feature.id_format` del JSON.
- `<nombre-descriptivo>`: texto libre. Se convierte a kebab-case según `slug.transforms`.

Si falta alguno → preguntárselo al usuario.

## Cuándo invocarlo

- Usuario dice "creemos una user story", "agregar story X a feature Y", "arranco la historia tal".
- Hay una pieza atómica de valor identificable dentro de una feature.

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`.
2. Leer `~/.fremi/framework/settings/config.yaml`.
3. Extraer de `methodology.core.yaml`:
   - `feat_cfg = identifiers.feature` (para resolver la feature padre).
   - `story_cfg = identifiers.story` → `prefix`, `id_format`, `folder_format`, `folder_regex`.
   - `wf_cfg = identifiers.workflow_doc` → `prefix`, `id_format`, `filename_format`, `use_compound_filename`, `compound_filename_format`, `items[]` (los 11 docs FW-00..FW-10 con su `required` flag).
   - `slug_cfg = slug`.
   - `paths.features_dir`, `paths.user_stories_subdir`.
4. Extraer de `config.yaml`:
   - `config.story.yaml.docs[]` — mismo listado con `required` y `condition_ref`.
   - `config.story.yaml → conditional_rules` — criterios operativos para `explore_when` y `proposal_when`.

Si alguno de los dos archivos no existe o no parsea → abortar y avisar al usuario.

### Paso 1 — Validar feature padre (Regla 1)

1. Buscar carpeta en `{paths.features_dir}` cuyo nombre matchee `feat_cfg.folder_regex` y empiece por el ID provisto.
2. Si no existe → avisar y proponer `/fremi-feature` primero. No avanzar.
3. Verificar que `{feature_folder}/definition.md` exista y tenga contenido real.

### Paso 2 — Determinar el ID de story

1. Listar carpetas dentro de `{feature_folder}/{paths.user_stories_subdir}/`.
2. Filtrar las que matcheen `story_cfg.folder_regex`.
3. Extraer el número de cada ID existente (parsear según `story_cfg.id_format`).
4. Próximo número = max(existentes) + 1. Si no hay → 1.
5. **Importante:** `story_cfg.scope` es `feature` → numeración **local a la feature**, cada feature arranca desde el 1.
6. Construir el `id` aplicando `story_cfg.id_format` con `{prefix}` y `{number}` (padding según el format spec).
7. No reciclar IDs de stories eliminadas.

### Paso 3 — Normalizar el slug

Aplicar `slug_cfg.transforms` y validar contra `slug_cfg.regex` (mismas reglas que `/fremi-feature`).

### Paso 4 — Evaluar obligatoriedad condicional de FW-00 y FW-02 (Regla 16)

Para cada item con `required === "conditional"` (por default `FW-00_explore` y `FW-02_proposal`):

1. Localizar la regla en `config.story.yaml → conditional_rules[condition_ref]`.
2. Presentar al usuario los criterios `obligatory_if_any[]` y preguntar si aplica **al menos uno**.
3. Si el usuario confirma que aplica → el doc pasa a **obligatorio para esta story**.
4. Si el usuario indica que no aplica → el doc se **omite** (no se crea placeholder vacío).
5. Registrar en el reporte final qué condicionales se crearon y cuáles se omitieron.

### Paso 4.5 — Capturar versión del padre (Regla 17)

Antes de crear los docs, leer el frontmatter de `{feature_folder}/definition.md` y extraer su `version` actual (ej: `"1.3.0"`). Este valor se va a inyectar como `ancestor.version_at_creation` en el frontmatter de cada doc que se cree.

Si `{feature_folder}/definition.md` NO tiene frontmatter (feature vieja pre-Regla 17) → asumir `"0.0.0"` y avisar al usuario que la feature padre necesita migrarse al schema de versionado.

### Paso 5 — Crear el folder y los docs del workflow

Aplicar `story_cfg.folder_format` (default: `{id}_{slug}`) → carpeta de la story.

Crear cada uno de los archivos listados en `wf_cfg.items[]` que sean:
- `required === "always"` — **siempre**.
- `required === "conditional"` **y** el usuario aprobó su creación en Paso 4.

Para cada item a crear:
- Si `wf_cfg.use_compound_filename === false` (default) → usar `item.filename` directo (ej: `FW-01_definition.md`).
- Si `wf_cfg.use_compound_filename === true` → aplicar `wf_cfg.compound_filename_format` con `{feature_id}`, `{story_id}`, `{id}` (= `FW-XX`), `{name}` (= item.name). Ej: `FT-01-HU-01-FW-01_definition.md`.

Estructura resultante (con ambos condicionales activos + configuración default):
```
{paths.features_dir}/{feature_folder}/{paths.user_stories_subdir}/{story_folder}/
├── FW-00_explore.md          (item 0: explore — condicional)
├── FW-01_definition.md       (item 1: definition)
├── FW-02_proposal.md         (item 2: proposal — condicional)
├── FW-03_scope.md            (item 3: scope)
├── FW-04_bdd-userstories.md  (item 4: bdd-userstories)
├── FW-05_sdd-spec.md         (item 5: sdd-spec)
├── FW-06_design.md           (item 6: design)
├── FW-07_tdd-plan.md         (item 7: tdd-plan)
├── FW-08_plan.md             (item 8: plan)
├── FW-09_checkwork.md        (item 9: checkwork — vivo durante implementación)
└── FW-10_closure.md          (item 10: closure)
```

Si el usuario decidió omitir `FW-00_explore` y/o `FW-02_proposal`, esas líneas quedan fuera del layout. Es esperado y correcto.

> **Convención FW-XX_:** el prefijo refleja el orden de ejecución del workflow. La cadena es una progresión de abstracción que siempre baja (abstracto → concreto). **La spec dirige el diseño** (SDD antes que Design). Cada item del JSON trae su `role` y `principio` que se respetan al armar el template.

Cada doc se crea con el template canónico correspondiente de `references/` (relativo a la carpeta del skill: `~/.fremi/framework/skills/story/references/`). Para cada item de `wf_cfg.items[]`, el skill:

1. Carga `references/{filename_sin_md}-template.md` (ej: para item `definition` → `references/FW-01_definition-template.md`).
2. Reemplaza los placeholders del template:
   - `{feature_id}`, `{story_id}`, `{slug}` → con los valores derivados de los pasos anteriores.
   - `<...>` → con la info que el usuario ya proveyó, o se dejan como TODOs para completar.
   - **Frontmatter versionado (Regla 17)**: rellenar `version` inicial (`1.0.0` para snapshots, `0.1.0` para living), `created`/`last_updated` con fecha actual, `ancestor.id` con `{feature_id}`, `ancestor.version_at_creation` con el valor capturado en Paso 4.5.
3. Escribe el archivo en la story con el resultado.

Ver tabla en sección "## Templates" abajo. **No inventar estructura** — todos los `FW-XX_*.md` deben respetar el template correspondiente.

> **Templates faltantes:** al 2026-07-13 los templates para `FW-00_explore-template.md`, `FW-02_proposal-template.md` y `FW-09_checkwork-template.md` **NO existen todavía** en `references/`. Al primer uso, si el archivo falta, el skill genera el doc con una estructura mínima derivada del `role` + `principio` del item en `methodology.core.yaml` y avisa al usuario para crear el template canónico en `references/` en un `EX-NN` posterior.

### Bifurcaciones técnicas durante la story → pausar y preguntar (Regla 3b)

Durante la redacción de cualquier artefacto de la story (especialmente `FW-05_sdd-spec.md` y `FW-06_design.md`), si aparece una **decisión técnica con 2+ caminos viables**:

1. **NO elegir silenciosamente.** Pausar la redacción.
2. Presentar al usuario **2-3 opciones** con pros/contras explícitos en el chat.
3. Esperar la decisión.
4. Invocar `/fremi-story-adr` para registrar la decisión.
5. Continuar la redacción referenciando el `adr-XXX` desde el artefacto donde nació.

Esto es **obligatorio** — ver Regla 3b en `~/.fremi/framework/rules/workflow.md`.

### Principio rector y reglas de frontera (críticas)

Cada artefacto sólo puede consumir decisiones tomadas en los artefactos **anteriores**. Si un contenido depende de una decisión que se toma más adelante, está en el archivo equivocado: se mueve, no se invierte el orden.

| Frontera | Regla |
|---|---|
| **BDD vs SDD** | BDD = qué ve/experimenta el usuario. SDD = contrato técnico de interfaces externas. "Qué código HTTP devuelve la interfaz" es **SDD**; "qué ve el usuario ante tal acción" es **BDD**. |
| **SDD vs Design** | Si un contrato puede escribirse SIN haber decidido la tecnología/estructura → **SDD**. Si SOLO existe porque ya se eligió una librería/capa (wrappers, adaptadores de una librería concreta) → **Design**. |
| **TBDs** | Se resuelven en el artefacto donde nace la decisión, no se arrastran al posterior. |

### Paso 5 — Actualizar la lista en `{feature_folder}/definition.md`

Agregar la story a la lista "User stories planeadas" de la feature:

```markdown
- **{story_id}_{slug}** — <título>. Estado: en planificación.
```

### Paso 6 — Validar sincronía con capas superiores (Regla 12)

Al terminar de armar los docs iniciales de la story (9 obligatorios + los condicionales que aplicaron):

- Verificar que cada **criterio de aceptación**, **escenario BDD** o **componente** declarado refiera a capacidades ya presentes en `{feature_folder}/definition.md` y `{paths.product_dir}/definition.md` (In-scope).
- Si el `FW-03_scope` introduce restricciones que parezcan transversales → señalarlas al usuario para evaluar sync-back hacia producto.
- Si el `FW-04_bdd` o el `FW-05_sdd` declaran capacidades nuevas → idem.
- Si `FW-06_design` propone una decisión técnica que aplique a más de una story (o feature) → señalarla para promover a ADR de producto vía `/fremi-story-adr`.

Si se detecta algo que pertenece arriba, **avisar al usuario**, pausar el desarrollo de la story y proponer el update.

### Paso 7 — Reportar

Decir al usuario:
- ID y slug de la story (formato derivado del JSON).
- Path completo.
- Qué docs condicionales se crearon (FW-00 y/o FW-02) y con qué justificación (`obligatory_if_any` que aplicó); qué condicionales se omitieron.
- Si hubo sync-back: qué docs de capa superior se actualizaron.
- Cuál es el próximo paso: empezar por el primer item creado (`FW-00_explore.md` si fue condicional-activo, o `FW-01_definition.md` en su defecto).

## Nomenclatura interna (también del JSON)

Dentro de la story, los IDs locales se derivan de:
- `identifiers.criterion` (CA-XXX) — en el primer doc del workflow (typically `FW-01_definition.md`).
- `identifiers.scenario` (SC-XXX) — en el doc BDD (typically `FW-04_bdd-userstories.md`).
- `identifiers.test_case` (TC-XXX) — en el doc TDD (typically `FW-07_tdd-plan.md`).
- `identifiers.task` (task-XXX) — en el doc plan (typically `FW-08_plan.md`). Ver skill `/fremi-story-task`.

Numeración secuencial dentro de la story, sin reciclar.

## Templates

Los templates canónicos viven en `references/` (relativo a la carpeta del skill). El skill los lee en el Paso 5 para instanciar cada uno de los docs de la story.

**Cada FW-XX tiene su template específico con sus reglas de uso y restricciones.** No inventar estructura — respetar siempre el template.

| # | Item | Archivo resultante | Template canónico | Dueño del template | Obligatoriedad | Rol |
|---|---|---|---|---|---|---|
| 0 | `explore` | `FW-00_explore.md` | [`references/FW-00_explore-template.md`](references/FW-00_explore-template.md) *(symlink)* | **`/fremi-story-explore`** | Condicional (Regla 16) | Investigación previa: contexto del codebase, alternativas, hallazgos. |
| 1 | `definition` | `FW-01_definition.md` | [`references/FW-01_definition-template.md`](references/FW-01_definition-template.md) | `/fremi-story` | Siempre | Problema / por qué — observable. As a / I want / So that + CA-XXX. **Sin solución técnica.** |
| 2 | `proposal` | `FW-02_proposal.md` | [`references/FW-02_proposal-template.md`](references/FW-02_proposal-template.md) *(symlink)* | **`/fremi-story-proposal`** | Condicional (Regla 16) | Intent + Approach (opciones) + Decisions (ancladas a ADRs) + Impact + Risk + Rollout. |
| 3 | `scope` | `FW-03_scope.md` | [`references/FW-03_scope-template.md`](references/FW-03_scope-template.md) | `/fremi-story` | Siempre | Límites: in-scope / out-of-scope / dependencias / supuestos. **Sin TBDs.** |
| 4 | `bdd-userstories` | `FW-04_bdd-userstories.md` | [`references/FW-04_bdd-userstories-template.md`](references/FW-04_bdd-userstories-template.md) | `/fremi-story` | Siempre | Qué OBSERVABLE — Given/When/Then con SC-XXX. **Sin firmas, sin códigos HTTP, sin librerías** (eso es SDD). |
| 5 | `sdd-spec` | `FW-05_sdd-spec.md` | [`references/FW-05_sdd-spec-template.md`](references/FW-05_sdd-spec-template.md) | `/fremi-story` | Siempre | Qué CONTRACTUAL — interfaces externas, schemas, tabla de errores, RNFs medibles. **Sin libs/wrappers/capas internas** (eso es Design). |
| 6 | `design` | `FW-06_design.md` | [`references/FW-06_design-template.md`](references/FW-06_design-template.md) | `/fremi-story` | Siempre | Cómo ESTRUCTURAL — tecnologías elegidas (con ADR), componentes, wrappers, diagramas, patrones, estructura de archivos. **Satisface SDD, no la redefine.** |
| 7 | `tdd-plan` | `FW-07_tdd-plan.md` | [`references/FW-07_tdd-plan-template.md`](references/FW-07_tdd-plan-template.md) | `/fremi-story` | Siempre | Cómo se VERIFICA — TC-XXX mapeados a SC/SDD. **Test rojo primero (Regla 7).** |
| 8 | `plan` | `FW-08_plan.md` | [`references/FW-08_plan-template.md`](references/FW-08_plan-template.md) | `/fremi-story` | Siempre | En qué ORDEN — task-XXX con criterios verificables (Regla 7b). Usar `/fremi-story-task` para agregar tareas. |
| 9 | `checkwork` | `FW-09_checkwork.md` | [`references/FW-09_checkwork-template.md`](references/FW-09_checkwork-template.md) | `/fremi-story` | Siempre | Estado en vivo — refleja avance de tasks + CAs cubiertos + archivos implementados. Único doc que muta durante la implementación (Regla 13). |
| 10 | `closure` | `FW-10_closure.md` | [`references/FW-10_closure-template.md`](references/FW-10_closure-template.md) | `/fremi-story` | Siempre | Cierre — matriz de trazabilidad CA→SC→SDD→Design→test→código + DoD + sign-off. **Sin esto, la story sigue abierta** (Regla 11). |

> **Nota sobre dueño del template**: `FW-00_explore-template.md` y `FW-02_proposal-template.md` son **symlinks** hacia los skills propios (`/fremi-story-explore`, `/fremi-story-proposal`) que son los dueños canónicos. Los otros 9 templates viven físicamente en `/fremi-story/references/` porque `/fremi-story` es quien los crea (no hay skill dedicado por fase). Si querés editar el template de explore/proposal, editá el archivo del skill dueño — el symlink refleja el cambio automático.

**Para cambiar la estructura** de cualquier `FW-XX_*.md`, editar el template correspondiente — no este SKILL.md. Si la estructura cambia significativamente, hacer un sweep manual de las stories existentes.

**Principio rector:** cada template sólo puede consumir decisiones tomadas en templates anteriores. Si un template depende de uno posterior → está mal y debe corregirse (Regla 6).

## Validaciones

- No crear si feature padre no existe.
- No crear si el slug de story colisiona dentro de la misma feature.
- Si feature no tiene `definition.md` con contenido → forzar a completarlo primero.
- **Todos los docs dentro de la story DEBEN seguir el formato definido en `wf_cfg`.** No inventar nombres.
- Si `methodology.core.yaml` no es legible → **abortar**. No usar fallbacks hardcoded.
