---
name: fremi-pipeline-story
description: Pipeline de auto-ejecución de la capa STORY. Corre la cadena de planificación FW-00..FW-08 (los 9 docs previos a implementación) sin pausar entre pasos, salvo conditionals no-inferibles (Regla 16), bifurcaciones técnicas (Regla 3b), sync-back a feature/producto (Regla 12) o precondiciones ausentes. NO ejecuta código de producción — el pipeline termina en FW-08_plan.md listo para arrancar TDD. Alternativa manual: `/fremi-story <FT> <nombre>` (crea andamio) + invocar cada `/fremi-story-*` sub-skill uno por uno.
---

# /fremi-pipeline-story — Pipeline capa STORY

Corre en modo **automático** la secuencia declarada en [`docs/frmwk/skills/story/config.user.yaml → flow.sequence`](../skills/story/config.user.yaml), desde `/fremi-story-explore` (si aplica) hasta `/fremi-story-plan` inclusive.

**Fuente de verdad de la secuencia:** `config.story.yaml`. Si un step cambia allí, este pipeline se adapta.

**Alcance del pipeline:** planificación completa (FW-00..FW-08). **NO** ejecuta código de producción (los steps 9-12 — `checkwork`, `verify`, `closure-check`, `closure` — pertenecen al ciclo de implementación, que corre task por task con TDD real y no se auto-orquesta en un pipeline). El pipeline termina dejando la story lista para que el usuario arranque a implementar tareas del `FW-08_plan.md` con `/fremi-story-task` + `/fremi-story-checkwork` en modo iterativo.

## Sintaxis

```
/fremi-pipeline-story <FEATURE_ID> <nombre-descriptivo-de-la-story> [--mode interactive|auto]
```

- `<FEATURE_ID>`: ej `FT-03` o `FT-03_reportes-mensuales`. Formato definido en `methodology.json → identifiers.feature.id_format`.
- `<nombre-descriptivo>`: título en lenguaje natural. Se convierte a slug según `slug.transforms`.
- `--mode` *(opcional)*: overridea el `execution_mode.pipeline_default` de `config.story.yaml`.

Si falta cualquiera de los dos primeros → preguntar antes de arrancar.

## Modo de ejecución

- **`auto`** *(default para pipelines)*: la IA llena los 9 docs de planificación (o los 11 si aplican los conditionals) de un tirón. Cada sub-skill interno escribe su doc entero sin pausar, y el pipeline arranca el siguiente sin preguntar. Pausa sólo ante stop events reales.
- **`interactive`**: cada sub-skill interno **sigue corriendo en `auto`** (escribe el FW-XX completo de un tirón, sin validar sección por sección), pero el pipeline pausa **entre steps** — al terminar cada FW-XX reporta lo generado y pregunta si continúa al siguiente. Es "el pipeline con checkpoints por doc": el usuario ve/edita cada FW-XX antes de que se arranque el próximo, sin bombardeo de preguntas dentro de cada sub-skill.

**Regla dura**: dentro del pipeline los sub-skills nunca reactivan modo interactivo — corren siempre `auto`. Si el usuario quiere validación por sección dentro de un doc específico, debe salirse del pipeline e invocar el skill suelto (ej: `/fremi-story-sdd FT-03/HU-05 --mode interactive`).

Consultar `config.story.yaml → execution_mode` para los defaults. Sugerencia: `interactive` a nivel skill suelto (calidad de cada decisión pesa) y `auto` a nivel pipeline (velocidad + revisión final).

## Cuándo invocarlo

- La feature está lista (con `definition.md` real) y se quiere formalizar UNA story completa (planificación) sin ping-pong.
- El usuario tiene claro el problema/usuario/valor esperado y no necesita revisar cada FW-XX antes del siguiente.

## Cuándo NO invocarlo

- La feature no existe → correr `/fremi-pipeline-feature <nombre>` primero.
- El usuario está en modo exploratorio y quiere validar cada doc antes → usar `/fremi-story` + sub-skills manuales.
- Se está trabajando la implementación (código) → usar `/fremi-story-task` + `/fremi-story-checkwork` iterativos; **este pipeline no ejecuta código**.
- Sólo se quiere una task nueva en una story existente → `/fremi-story-task`.

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-install-framework` es symlink válido y `CLAUDE.md` referencia `docs/frmwk/rules/workflow.md`. Si el framework no está instalado → abortar con: "Corré `/fremi-install-framework` antes de invocar el pipeline". **No auto-instalar.**
- `docs/frmwk/settings/methodology.json` + `config.story.yaml` existen y parsean.
- `config.story.yaml → active: true`.
- Feature `{FEATURE_ID}` existe en `docs/works/features/` y su `definition.md` tiene contenido real (no template vacío).
- Feature `definition.md` tiene frontmatter con `version` (Regla 17). Si no → avisar y proponer migrarla antes.

Si falla alguna → abortar con mensaje claro.

## Cadena de ejecución (auto)

Al 2026-07-13 la secuencia canónica cubierta por este pipeline (steps 0..8 de `config.story.yaml → flow.sequence`):

| # | Sub-skill invocado | Produce | Obligatoriedad | Notas |
|---|---|---|---|---|
| 0 | `/fremi-story-explore` | `FW-00_explore.md` | Condicional (`explore_when`) | Evaluado automáticamente (ver stop events #1). |
| 1 | `/fremi-story-definition` | `FW-01_definition.md` | Siempre | Formato `As a / I want / So that` + CA-XXX. |
| 2 | `/fremi-story-proposal` | `FW-02_proposal.md` | Condicional (`proposal_when`) | Evaluado automáticamente (ver stop events #1). |
| 3 | `/fremi-story-scope` | `FW-03_scope.md` | Siempre | In-scope / out-of-scope / dependencias / supuestos. |
| 4 | `/fremi-story-bdd` | `FW-04_bdd-userstories.md` | Siempre | SC-XXX Given/When/Then (happy + al menos 1 borde). |
| 5 | `/fremi-story-sdd` | `FW-05_sdd-spec.md` | Siempre | Contratos externos, schemas, tabla de errores, RNFs medibles. **Posible stop event Regla 3b.** |
| 6 | `/fremi-story-design` | `FW-06_design.md` | Siempre | Tecnología, wrappers, capas internas. **Posible stop event Regla 3b.** |
| 7 | `/fremi-story-tdd` | `FW-07_tdd-plan.md` | Siempre | TC-XXX mapeados a SC/SDD. |
| 8 | `/fremi-story-plan` | `FW-08_plan.md` | Siempre | task-XXX con criterios verificables (Regla 7b). |

**Fuera del alcance del pipeline** (se corren después, en el ciclo de implementación):
- Step 9 — `/fremi-story-checkwork` (living durante implementación).
- Step 10 — `/fremi-story-verify` (verify final).
- Step 11 — `/fremi-story-closure-check` (auditoría antes de firmar).
- Step 12 — `/fremi-story-closure` (firma final).

### Paso 0 — Andamio inicial

Antes de correr el paso 1, el pipeline invoca `/fremi-story <FEATURE_ID> <nombre>` (orquestador) para:
- Determinar el próximo `HU-XX` local a la feature.
- Crear el folder de la story.
- Instanciar los templates iniciales (los 9 obligatorios + los 2 condicionales si aplican, ver stop events).
- Capturar `ancestor.version_at_creation` desde el `definition.md` de la feature.
- Actualizar la lista de "User stories planeadas" en el `definition.md` de la feature.

Después de esto, el pipeline llena cada FW-XX invocando el sub-skill correspondiente en orden.

## Stop events específicos de esta capa

Además de los stop events genéricos del [README](README.md), este pipeline pausa cuando:

1. **Conditional rule no inferible (Regla 16).** Antes del step 0 (explore) y del step 2 (proposal), el pipeline evalúa `explore_when` y `proposal_when` de `config.story.yaml`. **Autoevalúa** cuando la información inicial permite inferir con confianza (ej: "migración de X a Y" → explore obligatorio). **Pausa y pregunta** cuando la información es ambigua — típicamente en stories de tamaño medio donde no está claro si aplica el criterio "3+ archivos", "contrato externo nuevo", etc.
2. **Bifurcación técnica en SDD/Design (Regla 3b).** Aparecen 2+ approaches viables (elección de protocolo, librería, wrapper, adapter…). Presenta opciones (pros/contras), espera decisión, registra `ADR-XXX` vía `/fremi-story-adr` (delta local; se merge al feature al cerrar la story vía Regla 17). **Antes** de continuar el artefacto donde nació la decisión.
3. **Sync-back a feature/producto (Regla 12).** Durante `FW-03_scope`, `FW-04_bdd` o `FW-05_sdd` el pipeline detecta que un contenido pertenece a la feature o al producto (capacidad nueva, restricción transversal, término técnico global). Pausa, presenta la divergencia, pregunta si actualizar arriba antes de continuar.
4. **CAs contradictorios o ambiguos.** Si al armar `FW-01_definition` un CA no puede ser mapeado luego a un escenario BDD observable, pausar y pedir clarificación al usuario.
5. **`FW-05_sdd` sin datos para RNFs medibles.** La spec exige RNFs medibles (latencia, throughput, tamaños). Si no se conocen del contexto, pedir al usuario 1-2 valores tentativos.
6. **`FW-06_design` requiere elección de tecnología no en Design de producto.** El stack global de `product/strategies.md` no cubre la elección específica → subir a Regla 3b + registrar ADR.
7. **`FW-08_plan` con 0 tasks derivables.** El diseño no permite descomponer en tareas atómicas con criterios de completitud (Regla 7b). Pedir al usuario que aclare unidades de trabajo.

**Anti-patrones (NO pausar por esto):**
- ❌ Confirmar wording de cada CA / SC / TC.
- ❌ Preguntar cuántas tasks poner en el plan.
- ❌ Preguntar si un test cubre un CA específico — se mapea y listo.
- ❌ Pedir feedback tras cada FW-XX completado.

## Reglas del framework que aplican durante la ejecución

- **Regla 1** — No avanzar sin feature `definition.md`.
- **Regla 2** — El pipeline **no** escribe código; sólo docs.
- **Regla 3b** — Toda bifurcación técnica produce ADR antes de continuar.
- **Regla 6** — Cadena BDD → SDD → Design se respeta estrictamente. Cada artefacto sólo consume decisiones de artefactos previos.
- **Regla 7b** — El `FW-08_plan.md` producido tiene tasks con criterios verificables (comando exit 0, test, archivo, métrica).
- **Regla 12** — Sync-back activo: no dejar divergencias silenciosas hacia feature/producto.
- **Regla 16** — Conditionals `FW-00/FW-02` evaluados por `config.story.yaml`. Si aplican → se crean; si no → se omiten (sin placeholder vacío).
- **Regla 17** — Todos los docs creados llevan frontmatter versionado + `ancestor.version_at_creation` = versión del `definition.md` de la feature al momento de crear.

## Después del pipeline

Al terminar exitosamente, la story queda con toda la planificación lista:

```
docs/works/features/FT-XX_<slug>/user-stories/HU-YY_<nombre>/
├── FW-00_explore.md           (si aplicó explore_when)
├── FW-01_definition.md        (v1.0.0, snapshot)
├── FW-02_proposal.md          (si aplicó proposal_when)
├── FW-03_scope.md
├── FW-04_bdd-userstories.md   (con SC-XXX)
├── FW-05_sdd-spec.md          (con contratos + RNFs)
├── FW-06_design.md            (con tech + ADRs referenciados)
├── FW-07_tdd-plan.md          (con TC-XXX mapeados)
├── FW-08_plan.md              (con task-XXX + criterios verificables)
├── FW-09_checkwork.md         (v0.1.0, living, vacío listo para arrancar impl)
└── FW-10_closure.md           (template vacío, para firmar al cerrar)
```
(+ `decisions.md` local si hubo ADRs de story)

**Próximo paso natural:** arrancar la primera task del `FW-08_plan.md`:
1. Ir a la primera task-XXX en estado `[ ]`.
2. Escribir el test rojo (Regla 7).
3. Marcar la task `[/]` en `FW-08` y en `FW-09` vía `/fremi-story-checkwork`.
4. Implementar el fix mínimo.
5. Cerrar la task (`[x]`) y actualizar `FW-09` con evidencia.
6. Repetir hasta 100% → `/fremi-story-verify` → `/fremi-story-closure-check` → `/fremi-story-closure`.

## Reporte final (obligatorio)

Al terminar, la IA reporta:

1. **Story creada**: `FT-XX/HU-YY_<slug>` + path completo.
2. **Docs producidos**: lista con versión de cada uno.
3. **Docs condicionales**:
   - `FW-00_explore` — creado / omitido (con justificación).
   - `FW-02_proposal` — creado / omitido (con justificación).
4. **Bifurcaciones resueltas**: lista de ADRs generados durante el pipeline con scope (story / feature / producto) y título.
5. **Sync-back realizado** (si hubo): qué se actualizó en feature/producto.
6. **Ancestor version**: versión del `feature/definition.md` en la que nace la story.
7. **Stop events**: preguntas hechas + respuestas registradas.
8. **Snapshot del `FW-08_plan.md`**: cantidad de tasks + primer task-XXX sugerido para arrancar.
9. **Próximo paso**: arrancar `task-001` con TDD (test rojo) o revisar el plan antes de codear.

## Referencias

- Config operativa: [`docs/frmwk/skills/story/config.user.yaml`](../skills/story/config.user.yaml)
- Reglas: [`docs/frmwk/rules/workflow.md`](../rules/workflow.md) — Reglas 1, 2, 3b, 6, 7b, 12, 16, 17.
- Flujo descriptivo: [`docs/frmwk/flows/flow.story.md`](../flows/flow.story.md)
- Orquestador manual: [`/fremi-story`](../skills/story/SKILL.md)
- Sub-skills: `docs/frmwk/skills/story/skills/`
- Pipeline padre: [`/fremi-pipeline-feature`](pipeline.feature.md) (puede encadenar este pipeline con `--first-story`)
