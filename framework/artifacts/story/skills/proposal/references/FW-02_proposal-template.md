# Template — `FW-02_proposal.md` de una story

> **Doc CONDICIONAL.** Obligatorio cuando aplica al menos uno de los criterios declarados en `~/.fremi/framework/settings/config.core.yaml → conditional_rules.proposal_when`. Omitir si no aplica.
>
> **Propósito**: puente entre `FW-01_definition.md` (por qué existe la story) y `FW-03_scope.md` (alcance detallado). Declara el **intent técnico**, el **approach elegido** (con opciones si hubo bifurcación), las **decisions numeradas** (cada una anclada a un ADR), el **impact** (archivos afectados con delta LOC) y el **risk** de la story.
>
> **Regla de frontera**: no repetir criterios de aceptación de negocio (van en definition). No listar todos los in/out-of-scope (va en scope). Sí explicar el CÓMO alto nivel y las DECISIONES técnicas antes de bajar a scope detallado + BDD.

---

# Proposal — {feature_id} / {story_id} — <título de la story>

**Fecha**: <YYYY-MM-DD>
**Trigger**: <qué criterio de `proposal_when` disparó este doc>
**Explore de referencia**: `FW-00_explore.md` (si existe) — <resumen ejecutivo del hallazgo clave>

---

## 1. Intent

<Un párrafo declarando qué se va a construir técnicamente. Concreto y sin ambigüedad. Ej: "Migrar `getList` de tickets de la fake-service al endpoint real `/loads/laboratory/list`, rewrite del builder de filtros a la DSL de Silosys, y añadir filtro client-side de laboratory.">

## 2. Scope (resumen)

Este proposal cubre la solución técnica de la story `{story_id}`. El **detalle** de in/out-of-scope vive en `FW-03_scope.md`. Acá va sólo el **encuadre**:

- **Foco técnico**: <endpoints/módulos/capas afectados>.
- **Alcance de PR**: <si es un PR único, o si el usuario decidió chained PRs — ver `config.yaml → phase_rules.tasks`>.

## 3. Approach — Opción elegida: <nombre corto>

<Describir el approach elegido — cómo se resuelve el intent.>

### Rationale

<Por qué esta opción y no las otras. Aterrizar los criterios: complejidad, consistencia con el codebase, riesgo, testabilidad, mantenibilidad, reversibilidad.>

### Alternativas descartadas

- **Opción A — <nombre>**: <por qué se descartó>
- **Opción B — <nombre>**: <por qué se descartó>
- (Si no hubo alternativas viables, decir "no aplicaron alternativas — approach único razonable").

## 4. Decisions

<Cada decision técnica va acá numerada + anclada a un ADR (Regla 3 + Regla 3b). Sin ADR, la decisión no está registrada.>

### Decision 1 — <título corto>
- **Acción**: <qué se decide hacer>
- **Rationale**: <por qué>
- **ADR**: aplica ADR-XXX en `docs/works/product/decisions.md` (o `FT-XX/decisions.md` si es local).

### Decision 2 — <título corto>
- **Acción**: …
- **Rationale**: …
- **ADR**: aplica ADR-YYY.

## 5. Known Limitations

<Cosas que ESTA story NO va a resolver y son conocidas de antemano. Cada una con síntoma + severidad + aceptación explícita del usuario.>

- **Limitation 1**: <descripción>. **Síntoma**: …. **Severidad**: baja / media / alta. **Aceptación**: <"aceptada por el usuario para este PR" o "documentada para follow-up en HU-ZZ">.

## 6. Impact — Archivos afectados

<Tabla de archivos que van a cambiarse, con delta estimado de LOC.>

| Archivo | Cambio | Delta LOC estimado |
|---|---|---|
| `src/functions/<X>/handler.ts` | <descripción> | +40 / -10 |
| `src/functions/<X>/schemas/xxx.ts` | <descripción> | +12 |
| `src/functions/<X>/test/unit-test/xxx.test.ts` | rewrite | +80 / -60 |

**Total estimado**: ~<X> LOC en <N> archivos.

## 7. Acceptance Criteria

<Referencias directas a los CA-XXX del `FW-01_definition.md`. NO redefinirlos — solo enumerar cuáles cubre este proposal.>

- CA-001 (definition) → cubierto por Decision 1 + archivos de sección 6.
- CA-002 (definition) → cubierto por Decision 2 + test x.
- …

## 8. Rollout

<Cómo se despliega el cambio. Si es un swap directo, decirlo. Si hay flag, canary, o migración de datos, describirlo.>

- **Modo**: <"swap directo" / "detrás de feature flag" / "gradual con canary">.
- **Riesgo de regresión**: <bajo / medio / alto> — <por qué>.
- **Plan de rollback**: <cómo se revierte si algo falla>.

## 9. Risk

<Riesgos residuales — asuntos identificados que podrían fallar aunque el approach sea correcto.>

| Riesgo | Severidad | Aceptación / Mitigación |
|---|---|---|
| <ej: pagination-total mismatch> | medio | aceptado para este PR; follow-up en HU-YY |
| <ej: performance regression> | bajo | mitigado por test x |

## 10. Skills / rules aplicables

<Referenciar skills y rules del framework/proyecto que se van a respetar durante la implementación.>

- `docs/project/rules/lambda-http-function-structure.mdc` — <por qué aplica>
- Skill `/fremi-story-adr` — para registrar Decisions 1 y 2.
- Skill `/fremi-story-verify` — antes de firmar closure.
