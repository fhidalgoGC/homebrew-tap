---
name: fremi-pipeline-feature
description: Pipeline de auto-ejecución que ENVUELVE el ciclo completo de la capa FEATURE (2 steps del artifact — definition + lifecycle end-to-end). Crea la feature (folder + definition.md + sync-back a producto + bump del plan padre), y luego encadena /fremi-pipeline-story por cada entrada de user_stories_seed[] hasta cerrar todas las stories planeadas. Bugs feature-scope, enablers y ADRs se manejan como stop events durante el lifecycle. Alternativa manual: `/fremi-feature <nombre>` (sólo crea el definition; el usuario decide qué hacer después story por story).
---

# /fremi-pipeline-feature — Pipeline capa FEATURE

Corre en modo **automático** la secuencia COMPLETA declarada en [`~/.fremi/framework/artifacts/feature/workflow.yaml`](../../artifacts/feature/workflow.yaml) — los 2 steps del artifact (`definition` + `lifecycle`) end-to-end.

**Fuente de verdad de la secuencia:** `artifacts/feature/workflow.yaml`. Si un step cambia allí, este pipeline se adapta.

**Alcance del pipeline:** **envelope completo** — abarca los 2 steps del artifact feature:
- **Definition** (step 0) — crear folder + `definition.md` + sync-back a producto (R12) + bump del plan padre (R17).
- **Lifecycle** (step 1) — loop sobre `user_stories_seed[]` encadenando `/fremi-pipeline-story` por cada seed hasta cerrar todas las stories planeadas. Bugs feature-scope, enablers y ADRs se manejan como stop events transversales.

**Diferencia con `/fremi-feature` manual:** manual = crea sólo el definition, vos decidís cada story después; pipeline = crea la feature + cierra todas las stories del seed automáticamente. Ambos producen la feature; cambia el ritmo y el alcance.

## Sintaxis

```
/fremi-pipeline-feature <nombre-descriptivo> [--mode interactive|auto]
```

- `<nombre-descriptivo>`: título de la feature en lenguaje natural. Se convierte a slug según `slug.transforms` del `methodology.core.yaml`.
- `--mode` *(opcional)*: overridea el `execution_mode.pipeline_default` de `config.user.yaml`. El modo se hereda a los sub-pipelines de story encadenados durante lifecycle.

## Modo de ejecución

- **`auto`** *(default para pipelines)*: la IA arma el `definition.md` completo, aplica sync-back si detecta divergencias claras, bumpea el `plan.md` sin preguntar, y arranca a encadenar `/fremi-pipeline-story` por cada seed sin pausa entre stories. Pausa sólo ante stop events reales.
- **`interactive`**: los sub-skills y sub-pipelines siguen en `auto`, pero el pipeline feature pausa **entre steps** — típicamente después de crear el `definition.md` y **entre cada story del seed** durante lifecycle. Útil para revisar cada story antes de arrancar la próxima.

**Regla dura**: dentro del pipeline los sub-pipelines/sub-skills NUNCA reactivan modo interactivo — corren siempre `auto`. Si querés validación por sección dentro de un doc específico, salite del pipeline e invocá el skill suelto.

Consultar `config.user.yaml → execution_mode` para el default.

## Cuándo invocarlo

- La capa producto está lista (con `plan.md` que menciona la feature o la va a mencionar) y se quiere formalizar UNA feature de un tirón.
- Se quiere feature + primera story en un solo comando (`--first-story ...`).

## Cuándo NO invocarlo

- No existe `product/plan.md` ni `product/definition.md` → usar `/fremi-pipeline-product` primero.
- Sólo se quiere registrar un ADR de feature → usar `/fremi-feature-adr FT-XX`.
- Sólo se quiere registrar un bug de feature → usar `/fremi-feature-bug FT-XX`.

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-story` es symlink válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si el framework no está instalado → abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.core.yaml` + `config.feature.yaml` existen y parsean.
- `config.feature.yaml → active: true`.
- `docs/works/product/definition.md` existe **con contenido real** (no template vacío).
- `docs/works/product/plan.md` existe **con contenido real** (aunque tenga 0 features listadas — el pipeline puede agregar la primera).

Si falla alguna → abortar con mensaje claro (ej: "Falta `product/definition.md` — corré `/fremi-pipeline-product` primero").

## Cadena de ejecución (auto)

Al 2026-07-13 la secuencia canónica de la capa feature tiene UN step obligatorio (`/fremi-feature`) más transversales (ADRs, bugs, sub-features vía `/fremi-story`). El pipeline extiende esto con validaciones automáticas:

| # | Acción | Tipo | Notas |
|---|---|---|---|
| 1 | **Delega en `/fremi-feature <nombre>`** | Skill | Crea folder + `definition.md` desde template + captura `ancestor.version_at_creation` del `plan.md` actual + valida slug. |
| 2 | **Auto-sync-back a producto (Regla 12)** | Validación | El pipeline lee el `definition.md` recién creado y evalúa: ¿cada capacidad referenciada está en `product/definition.md`? ¿cada restricción transversal? ¿términos técnicos en glosario? Si detecta divergencia → **stop event** (ver abajo). |
| 3 | **Bump `product/plan.md` (Regla 17)** | Automático | MINOR bump por nueva feature agregada al roadmap. Entry en changelog con `origen: /fremi-pipeline-feature`. Ya lo hace `/fremi-feature` internamente — el pipeline sólo verifica. |
| 4 | **(Opcional) Encadenar `/fremi-pipeline-story`** | Sub-pipeline | Sólo si se pasó `--first-story <nombre>`. Delega a [`/fremi-pipeline-story`](pipeline.story.md) con el `FEATURE_ID` recién creado. |

## Stop events específicos de esta capa

Además de los stop events genéricos del [README](../README.md), este pipeline pausa cuando:

1. **Sync-back a producto necesario (Regla 12).** El pipeline detecta que la feature introduce una capacidad, restricción o término que **no** está en `product/definition.md` y **parece transversal**. Presenta al usuario el gap y propone: (a) actualizar `product/definition.md` antes de continuar, o (b) marcar como específico de la feature y proceder. Espera decisión.
2. **Bifurcación técnica en `definition.md` (Regla 3b).** El usuario dio información que implica 2+ approaches viables para satisfacer la feature (ej: "generar reporte" = PDF vs. HTML vs. API JSON). Presenta opciones, espera decisión, registra `ADR-XXX` en el scope apropiado (producto o feature) vía `/fremi-product-adr` o `/fremi-feature-adr` según Regla 20.
3. **Feature colisiona con existente.** El slug o la funcionalidad matchea una feature ya presente en el plan. Preguntar si el usuario quiere: (a) usar la feature existente, (b) crear con slug alternativo, (c) marcar la anterior como reemplazada.
4. **`plan.md` de producto no menciona la feature ni permite deducir prioridad.** El pipeline puede agregarla igual, pero necesita saber prioridad tentativa (alta/media/baja) para la entry del roadmap.

**Anti-patrones (NO pausar por esto):**
- ❌ Confirmar el orden exacto de capacidades listadas.
- ❌ Preguntar por wording del título.
- ❌ Preguntar si se hace el bump de `plan.md` — es obligatorio (Regla 17), se hace sin preguntar.

## Reglas del framework que aplican durante la ejecución

- **Regla 1** — No avanzar sin `product/definition.md` + `product/plan.md`.
- **Regla 3b** — Toda bifurcación produce ADR antes de continuar.
- **Regla 12** — Sync-back activo: no dejar divergencias silenciosas.
- **Regla 17** — Bump del `plan.md` padre + captura `ancestor.version_at_creation` en el `definition.md` de la feature.
- **Regla 20** — ADRs al scope correcto: transversales → producto; locales → feature.

## Después del pipeline

Al terminar exitosamente, sin `--first-story`:

```
docs/works/features/FT-XX_<slug>/
└── definition.md   (v0.1.0, con frontmatter versionado + capacidades declaradas)

docs/works/product/plan.md   (bump MINOR — feature agregada al roadmap)
```

Al terminar con `--first-story <nombre>`, además:

```
docs/works/features/FT-XX_<slug>/user-stories/HU-01_<nombre-story>/
├── FW-01_definition.md
├── FW-03_scope.md
├── FW-04_bdd-userstories.md
├── FW-05_sdd-spec.md
├── FW-06_design.md
├── FW-07_tdd-plan.md
├── FW-08_plan.md
├── FW-09_checkwork.md
└── FW-10_closure.md (vacío, para firmar al cerrar)
```
(+ `FW-00_explore.md` y/o `FW-02_proposal.md` si los conditionals aplicaron)

## Reporte final (obligatorio)

Al terminar, la IA reporta:

1. **Feature creada**: ID + slug + path completo.
2. **Versión inicial** del `definition.md` + `ancestor.version_at_creation` (versión del `plan.md` al momento de crear).
3. **Bump del `plan.md`**: versión anterior → versión nueva.
4. **Sync-back realizado** (si hubo): qué se actualizó en producto.
5. **ADRs registrados** durante el pipeline (si hubo).
6. **Stop events**: preguntas hechas + respuestas registradas.
7. **Si se usó `--first-story`**: resumen del sub-pipeline de story (ver `pipeline.story.md` para su reporte).
8. **Próximo paso sugerido**: `/fremi-pipeline-story FT-XX <nombre-story>` para primera story, o `/fremi-story FT-XX <nombre>` si se prefiere modo manual.

## Referencias

- Config operativa: [`~/.fremi/framework/artifacts/feature/config.user.yaml`](../../artifacts/feature/config.user.yaml)
- Reglas: [`~/.fremi/framework/rules/workflow.md`](../../rules/workflow.md) — Reglas 1, 3b, 12, 17, 20.
- Flujo descriptivo: [`~/.fremi/framework/artifacts/feature/flow.md`](../../artifacts/feature/flow.md)
- Skill manual: [`/fremi-feature`](../../artifacts/feature/SKILL.md)
- Pipeline encadenable: [`/fremi-pipeline-story`](pipeline.story.md)
