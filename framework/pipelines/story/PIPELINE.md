---
name: fremi-pipeline-story
description: Pipeline de auto-ejecución que ENVUELVE el ciclo completo de la capa STORY (14 steps del artifact — desde explore hasta closure firmado). Corre la cadena end-to-end incluyendo apply autónomo (TDD task por task), verify, closure-check y firma del closure. Pausa sólo ante stop events reales — conditionals no-inferibles (Regla 16), bifurcaciones técnicas (Regla 3b), sync-back a feature/producto (Regla 12), test failing persistente (R7), gaps detectados durante apply, closure-check con CRITICAL (Regla 11). Alternativa manual: `/fremi-story <FT> <nombre>` (crea andamio) + invocar cada `/fremi-story-*` sub-skill uno por uno paso a paso.
---

# /fremi-pipeline-story — Pipeline capa STORY

Corre en modo **automático** la secuencia COMPLETA declarada en [`~/.fremi/framework/artifacts/story/workflow.yaml`](../../artifacts/story/workflow.yaml), desde `/fremi-story-explore` (si aplica) hasta el `closure` firmado.

**Fuente de verdad de la secuencia:** `artifacts/story/workflow.yaml` (14 steps). Si un step cambia allí, este pipeline se adapta.

**Alcance del pipeline:** **envelope completo** — abarca los 14 steps del artifact story:
- **Planificación** (steps 0..8) — FW-00 a FW-08.
- **Implementación** (step 9 — apply) — TDD real task por task (Regla 7 test rojo primero).
- **Living checkwork** (step 10) — actualizado durante toda la implementación (Regla 13).
- **Verify** (step 11) — corrida final de suite.
- **Closure-check** (step 12) — auditoría antes de firmar (Regla 11).
- **Closure** (step 13) — firma del FW-10 + bump de la feature padre (Regla 17).

**Diferencia con `/fremi-story` manual:** manual = step por step, vos decidís cuándo avanzar; pipeline = todos los steps end-to-end, la IA avanza sola hasta cerrar la story. Ambos producen el mismo resultado final; cambia el ritmo.

## Sintaxis

```
/fremi-pipeline-story <FEATURE_ID> <nombre-descriptivo-de-la-story> [--mode interactive|auto]
```

- `<FEATURE_ID>`: ej `FT-03` o `FT-03_reportes-mensuales`. Formato definido en `methodology.core.yaml → identifiers.feature.id_format`.
- `<nombre-descriptivo>`: título en lenguaje natural. Se convierte a slug según `slug.transforms`.
- `--mode` *(opcional)*: overridea el `execution_mode.pipeline_default` de `config.story.yaml`.

Si falta cualquiera de los dos primeros → preguntar antes de arrancar.

## Modo de ejecución

- **`auto`** *(default para pipelines)*: la IA corre los 14 steps end-to-end. Cada sub-skill interno escribe su doc entero sin pausar, la implementación arranca sin preguntar cuando el plan está listo, y el pipeline firma el closure al final. Pausa sólo ante stop events reales.
- **`interactive`**: cada sub-skill interno **sigue corriendo en `auto`** (escribe el FW-XX completo de un tirón, sin validar sección por sección), pero el pipeline pausa **entre steps** — al terminar cada FW-XX reporta lo generado y pregunta si continúa al siguiente. Es "el pipeline con checkpoints por doc": el usuario ve/edita cada FW-XX antes de que se arranque el próximo, sin bombardeo de preguntas dentro de cada sub-skill.

**Regla dura**: dentro del pipeline los sub-skills nunca reactivan modo interactivo — corren siempre `auto`. Si el usuario quiere validación por sección dentro de un doc específico, debe salirse del pipeline e invocar el skill suelto (ej: `/fremi-story-sdd FT-03/HU-05 --mode interactive`).

Consultar `config.story.yaml → execution_mode` para los defaults. Sugerencia: `interactive` a nivel skill suelto (calidad de cada decisión pesa) y `auto` a nivel pipeline (velocidad + revisión final).

## Cuándo invocarlo

- La feature está lista (con `definition.md` real) y se quiere formalizar UNA story completa (planificación) sin ping-pong.
- El usuario tiene claro el problema/usuario/valor esperado y no necesita revisar cada FW-XX antes del siguiente.

## Cuándo NO invocarlo

- La feature no existe → correr `/fremi-pipeline-feature <nombre>` primero.
- El usuario está en modo exploratorio y quiere validar cada doc antes → usar `/fremi-story` + sub-skills manuales.
- Sólo se quiere agregar una task a una story existente → usar `/fremi-story-task` directo.
- Sólo se quiere una task nueva en una story existente → `/fremi-story-task`.

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-story` es symlink válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si el framework no está instalado → abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.core.yaml` + `config.story.yaml` existen y parsean.
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

Además de los stop events genéricos del [README](../README.md), este pipeline pausa cuando:

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

- Config operativa: [`~/.fremi/framework/artifacts/story/config.user.yaml`](../../artifacts/story/config.user.yaml)
- Reglas: [`~/.fremi/framework/rules/workflow.md`](../../rules/workflow.md) — Reglas 1, 2, 3b, 6, 7b, 12, 16, 17.
- Flujo descriptivo: [`~/.fremi/framework/artifacts/story/flow.md`](../../artifacts/story/flow.md)
- Orquestador manual: [`/fremi-story`](../../artifacts/story/SKILL.md)
- Sub-skills: `~/.fremi/framework/artifacts/story/skills/`
- Pipeline padre: [`/fremi-pipeline-feature`](pipeline.feature.md) (puede encadenar este pipeline con `--first-story`)
