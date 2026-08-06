---
name: fremi-story-closure-check
description: Audita el cierre de una user story (FW-10_closure.md) y reporta gaps de trazabilidad. Úsalo antes de firmar el closure de una story, cuando el usuario diga que terminó una story, o cuando pregunte si "ya está lista" / "está cerrada" / "está done". Verifica que cada criterio, escenario BDD, contrato SDD y test esté trazado a código real.
---

# /fremi-story-closure-check — Auditoría de cierre de user story

Este skill audita una user story para verificar que está **realmente terminada** según la Regla 11 (`~/.fremi/framework/rules/workflow.md`).

Reporta:
- Qué hay trazado y qué falta.
- Si la story está lista para sign-off o tiene gaps abiertos.

---

## Cuándo invocarlo

- El usuario dice: "terminé la story X", "ya está lista", "cerrá la story", "está done".
- Antes de firmar el `FW-10_closure.md` de una story.
- Cuando se quiere saber el estado real (no nominal) de cierre.
- Antes de mover a la siguiente story.

---

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.json`.
2. Leer `~/.fremi/framework/settings/config.yaml`.
3. Extraer de `methodology.json`:
   - `wf_items = identifiers.workflow_doc.items[]` — lista de los 11 docs (FW-00..FW-10) con sus `filename`, `role`, `principio`, `required` y `condition_ref`. Estos son los nombres a leer en el Paso 2.
   - `layers.story.files_in_order` + `layers.story.conditional_files` — orden canónico y qué archivos son opcionales.
   - `identifiers.criterion`, `identifiers.scenario`, `identifiers.test_case`, `identifiers.task` — para parsear IDs internos.
   - `identifiers.adr` — para buscar ADRs aplicables.
   - `paths.product_dir`, `paths.features_dir`, `paths.user_stories_subdir`.
4. Extraer de `config.yaml`:
   - `config.story.yaml → conditional_rules` — criterios que definen cuándo `FW-00_explore` y `FW-02_proposal` deben existir.

Si alguno de los dos archivos no parsea → abortar.

### Paso 1 — Identificar la story a auditar

Determinar la ruta:
```
docs/works/features/<feature>/user-stories/<story>/
```

Si el usuario no la indica, listar todas las stories existentes y pedir cuál auditar. Si hay sólo una en progreso (con código tocado recientemente), asumirla.

### Paso 2 — Leer los documentos de la story

Iterar `wf_items` (del JSON) en orden y leer cada `item.filename` de la carpeta de la story. Con la configuración default los archivos son:

| Item | Filename | Obligatoriedad | Qué extraer |
|---|---|---|---|
| `explore` | `FW-00_explore.md` | Condicional | Si existe: hallazgos, alternativas listadas, decisiones que habilita/bloquea |
| `definition` | `FW-01_definition.md` | Siempre | Criterios de aceptación (IDs según `identifiers.criterion.regex`) |
| `proposal` | `FW-02_proposal.md` | Condicional | Si existe: Intent, Approach elegido, Decisions (referencias a ADR-XXX), Impact, Risk |
| `scope` | `FW-03_scope.md` | Siempre | Listas In-scope / Out-of-scope / dependencias |
| `bdd-userstories` | `FW-04_bdd-userstories.md` | Siempre | Escenarios Gherkin (`Scenario:` con IDs según `identifiers.scenario.regex`) |
| `sdd-spec` | `FW-05_sdd-spec.md` | Siempre | Contratos externos (endpoints, schemas, códigos/errores expuestos) |
| `design` | `FW-06_design.md` | Siempre | Librerías elegidas, componentes/módulos, contratos internos, patrones |
| `tdd-plan` | `FW-07_tdd-plan.md` | Siempre | Items con estado de checkbox (IDs según `identifiers.test_case.regex`) |
| `plan` | `FW-08_plan.md` | Siempre | Tareas con estado y criterios (IDs según `identifiers.task.regex`) |
| `checkwork` | `FW-09_checkwork.md` | Siempre | % progreso, tasks cerradas, CAs cubiertos, archivos implementados |
| `closure` | `FW-10_closure.md` | Siempre | Si existe, parsear matriz de trazabilidad |

**Sobre los condicionales**: ausencia de `FW-00_explore.md` o `FW-02_proposal.md` **NO es un gap** si el criterio de obligatoriedad de `config.yaml` no aplicaba a la story. El closure-check pregunta:

1. ¿Existe el archivo? → auditar su completitud como cualquier otro doc.
2. ¿No existe? → evaluar contra `config.story.yaml → conditional_rules[condition_ref].obligatory_if_any`. Si algún criterio aplica a la story (ej: la story cambia comportamiento visible al usuario → debería haber tenido proposal) → **reportar como CRITICAL** ("archivo requerido según config.yaml y no fue creado"). Si ningún criterio aplica → **omitir del reporte** como esperado.

Si el `wf_items` del JSON cambia (ej: filename compuesto), iterar igual usando el `filename` de cada item — no asumir nombres fijos.

### Paso 3 — Verificar trazabilidad

#### 3.1 Criterios de aceptación
Por cada criterio de `FW-01_definition.md`:
- ¿Aparece en la matriz de `FW-10_closure.md`?
- ¿Tiene escenario BDD, contrato SDD, test e implementación asociados?

**Gap si:** falta cualquier columna o no está en la matriz.

#### 3.2 Escenarios BDD
Por cada `Scenario:` en `FW-04_bdd-userstories.md`:
- Buscar el nombre/texto del scenario en el codebase (típicamente `tests/`, `spec/`, `__tests__/`).
- Verificar que existe un test que lo referencia.

**Gap si:** ningún test menciona el scenario o un identificador equivalente.

#### 3.3 Contratos SDD
Por cada contrato en `FW-05_sdd-spec.md` (endpoint, modelo, error code, etc.):
- Buscar en el código por el identificador (ruta del endpoint, nombre del schema, código de error).

**Gap si:** no se encuentra implementación en código de producción.

#### 3.4 Items de TDD
Por cada `- [ ]` (no marcado) en `FW-07_tdd-plan.md`:
- Reportar como pendiente.

**Gap si:** hay items sin marcar `[x]`.

#### 3.5 ADRs respetados
Por cada ADR aplicable (en `product/decisions.md` y `feature/decisions.md`):
- Verificar superficialmente que la decisión sigue vigente en el código.
- Esto es heurístico — buena fe — pero si se ve una violación clara, reportarla.

#### 3.6 Scope respetado
Por cada item de **Out-of-scope** en `FW-03_scope.md`:
- Buscar señales de que se implementó igual (componentes/endpoints/funciones que matcheen).
- Si se encuentran → reportar violación de scope.

#### 3.7 Design técnico implementado
Por cada componente/módulo/archivo declarado en `FW-06_design.md`:
- Verificar que existe la pieza correspondiente en el código (archivo, clase, función, módulo).
- Verificar que los patrones declarados aparecen aplicados (ej: si `FW-06_design.md` dice "Repository pattern para acceso a DB", existe una capa repository).
- **Gap si:** una pieza del diseño técnico no tiene contraparte en código.

#### 3.8 Tareas del plan completadas y verificables
Por cada tarea `T-XXX` en `FW-08_plan.md`:
- ¿Tiene mapeo a SDD/BDD/TDD? Si no → tarea huérfana, reportar.
- ¿Tiene al menos un criterio verificable de detección? Si no → tarea inválida (viola Regla 7b).
- ¿Está marcada `[x]`? Si no → tarea pendiente.
- Si está `[x]`, intentar correr los criterios automatizables (comandos, tests) y verificar que pasan. Si fallan → reportar como "marcada hecha pero no pasa verificación".

**Gap si:** alguna tarea está sin marcar, sin mapeo, sin criterio verificable, o marcada pero con criterios que no pasan.

#### 3.9 Sincronía con capas superiores (Regla 12)

Antes de declarar la story DONE, verificar que **no haya divergencia silenciosa** con producto/feature:

- Restricciones del `FW-03_scope.md` que sean transversales y no estén en `product/definition.md` → gap.
- Decisiones técnicas del `FW-06_design.md` o tareas del `FW-08_plan.md` que apliquen a más de una story y no tengan ADR en `product/decisions.md` o `FT-XX/decisions.md` → gap.
- Capacidades referenciadas en BDD/SDD que no estén declaradas en `product/definition.md` (In-scope) o `feature/definition.md` (Alcance) → gap.
- Términos transversales sin glosario → gap menor.

**Gap si:** se detecta cualquiera de los anteriores. La story no cierra hasta resolver (subiendo al docs apropiado o justificando explícitamente que es local).

Para auditoría completa de sincronía a nivel proyecto, complementar con `/fremi-sync-check`.

### Paso 4 — Verificar el `FW-10_closure.md`

Si `FW-10_closure.md` existe:
- ¿Tiene matriz de trazabilidad? ¿Está completa?
- ¿Checklist DoD con todos los items?
- ¿Evidencia (PR/commits)?
- ¿Sign-off con fecha?

Si no existe: reportar como gap principal y proponer un esqueleto.

### Paso 4.5 — Verificar bumps del padre (Regla 17)

Consultar `config.yaml → versioning.parent_bump_triggers.story_closes` para saber qué padres deben haberse bumpeado al firmar. Auditar:

1. **`FT-XX/definition.md` (o `FT-XX/spec.md` cuando exista como living)** — comparar la versión actual con la registrada en `ancestor.version_at_creation` del `FW-10_closure.md`. Si la story:
   - Agregó requirements nuevos → esperado MINOR bump del living spec del padre.
   - Modificó requirements existentes → esperado MAJOR bump.
   - Sólo aclaró → esperado PATCH (o sin bump).
2. **`FT-XX/decisions.md` (cuando exista como living)** — si la story tiene ADRs nuevos, esperar MINOR bump por cada ADR.
3. **Frontmatter del `FW-10_closure.md`** — `ancestor.version_at_closure` debe estar rellenado con la versión final del padre.
4. **Changelog del padre** — cada bump debe tener entry apuntando a esta story como origen.

Gap si:
- El padre NO fue bumpeado y la story sí introdujo cambios de contrato.
- `ancestor.version_at_closure` está en `null` o vacío.
- El changelog del padre no referencia esta story.

### Paso 5 — Reportar

Formato del reporte:

```
## Closure check — <story-name>

### Estado general
🟢 LISTA PARA SIGN-OFF      (todo verde)
🟡 LISTA CON ADVERTENCIAS    (gaps menores)
🔴 NO LISTA                  (gaps críticos)

### Trazabilidad
✅ Criterios de aceptación: X/Y cubiertos
✅ Scope respetado (sin items out-of-scope implementados)
✅ Design técnico implementado: X/Y piezas
✅ Escenarios BDD con test:  X/Y
⚠️  Contratos SDD implementados: X/Y
✅ Items TDD marcados:        X/Y
✅ Tareas del plan [x] con criterios verificados: X/Y
✅ Sincronía con capas superiores (Regla 12): N divergencias detectadas

### Gaps detectados
1. Criterio CA-3 no aparece en la matriz de FW-10_closure.md
2. Scenario "Usuario sube archivo corrupto" no tiene test asociado
3. Contrato GET /reports/:id no encontrado en código
4. FW-07_tdd-plan.md tiene 2 items sin marcar:
   - [ ] handles missing column headers
   - [ ] empty file returns empty array

### Closure.md
✅ Existe
⚠️  Falta sign-off (sin fecha)

### Próximos pasos
- Cerrar los gaps listados arriba.
- Completar matriz en FW-10_closure.md.
- Firmar con fecha cuando esté todo verde.
```

---

## Heurísticas de búsqueda

Para mapear escenarios BDD a tests:
- Buscar el texto del `Scenario:` (case-insensitive).
- Buscar palabras clave únicas del scenario.
- Buscar en archivos `*.test.*`, `*.spec.*`, `tests/`, `__tests__/`, `spec/`, `features/`.

Para mapear contratos SDD a código:
- Endpoints HTTP: buscar la ruta (`/reports`, `POST /reports`, etc.).
- Resolvers/Mutations GraphQL: buscar el nombre del resolver.
- Modelos: buscar el nombre del schema/tipo.
- Códigos de error: buscar el string del código.

Para detectar items pendientes en `FW-07_tdd-plan.md`:
- Contar `- [ ]` vs `- [x]`.

---

## Limitaciones

Este skill es **heurístico**, no formal:
- No verifica si los tests realmente pasan (eso lo hace el runner).
- No mide coverage (eso es responsabilidad del tooling: jest --coverage, etc.).
- No detecta violaciones sutiles de ADRs.

Para una verificación dura, complementar con:
- `npm test` / `vitest run` / `jest --coverage`
- Lint y type-check.
- Revisión humana del PR.

El skill ayuda a **encontrar lo obvio** que se haya escapado.
