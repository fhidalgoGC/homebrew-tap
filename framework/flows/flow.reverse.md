# Flujo — Vía REVERSE (alineación de código pre-existente al framework)

> **Config operativa:** [`docs/frmwk/settings/config.reverse.yaml`](../settings/config.reverse.yaml)
> **Reglas específicas:** [`docs/frmwk/rules/reverse.md`](../rules/reverse.md) — Reglas 25–32.
> **Skills:** `docs/frmwk/reverse-engineering/` (6 skills).
> **Pipelines:** `docs/frmwk/pipelines/pipeline.reverse.*.md` (4 pipelines).
> **Rol:** vía canónica para alinear código pre-existente al framework — reconstruir los docs del flow forward a partir de artifacts sobrevivientes.

---

## Qué produce esta vía

Cada skill reverse produce el conjunto de docs de la capa correspondiente, **exactamente como los produciría el flow forward** — con la única diferencia (por default) de un bloque de frontmatter que declara el origen reverse (Regla 26).

| Skill | Docs producidos | Capa reconstruida |
|---|---|---|
| `/fremi-reverse-product` | `iniciativas.md`, `ideas.md`, `planteamiento.md`, `definition.md`, `strategies.md`, `decisions.md`, `plan.md` | Product (7 docs) |
| `/fremi-reverse-feature` | `FT-XX/definition.md` (+ `decisions.md` si aplica) | Feature |
| `/fremi-reverse-story` | `FW-00..FW-10` (11 docs) | Story |
| `/fremi-reverse-enabler` | `EN-01..EN-04` (4 docs) | Enabler |
| `/fremi-reverse-bug` | `BG-XX_<slug>.md` (1 archivo) | Bug (declara Regla 29) |
| `/fremi-reverse-extra` | `EX-NN_<slug>.md` (1 archivo) | Extra |

---

## Diagrama del flujo (6 fases canónicas)

```
                     TRABAJO EN CÓDIGO YA EXISTENTE
                     ──────────────────────────────
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 1 — DESCUBRIMIENTO                  │
        │  Escanear artifacts sobrevivientes:      │
        │  · código (src/, lib/, functions/)       │
        │  · tests (*.test.ts, *.spec.ts)          │
        │  · git log (commits, PRs)                │
        │  · package.json, tsconfig, IaC           │
        │  · docs sueltos, READMEs, JSDoc          │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 2 — INFERENCIA                      │
        │  Mapear artifacts → docs del flow:       │
        │   test describe/it  → SC-XXX (BDD)       │
        │   Zod schema        → SDD (contratos)    │
        │   package.json+arch → Design (tech)      │
        │   commits           → task-XXX (plan)    │
        │   tests             → TC-XXX (tdd)       │
        │   handler+errors    → tabla de errores   │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 3 — PREGUNTAS DIRIGIDAS  (Regla 27) │
        │  Sólo para gaps NO inferibles:           │
        │   · "So that" del definition             │
        │   · Iniciativa asociada                  │
        │   · Motivación de ADR                    │
        │   · RNFs medibles                        │
        │   · CAs sin test asociado                │
        │  NUNCA inventar. Preguntar o marcar TBD. │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 4 — TIMESTAMPS + LINAJE  (Regla 30) │
        │  Inferir fechas via git:                 │
        │   created = primer commit relacionado    │
        │   last_updated = último commit           │
        │   ancestor.version = versión del padre   │
        │      en la fecha inferida (git blame)    │
        │  Fallback si no hay .git:                │
        │   pedir fechas al usuario o "hoy"        │
        │   con reverse_engineered_confidence: 0.3 │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 5 — ESCRITURA de docs  (Regla 26)   │
        │  Default: --transparent                  │
        │   frontmatter con reverse_engineered:*   │
        │  Override: --stealth (indistinguible)    │
        │  Aplica templates canónicos (symlink en  │
        │  references/ del skill reverse).         │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Fase 6 — BUMP PADRES  (Regla 17 + 30)    │
        │  Al firmar closure inferido:             │
        │   parent_bump_triggers según capa        │
        │   igual que el flow forward              │
        │  (Story cierra → bumpea feature/spec,    │
        │   feature/decisions, feature/definition; │
        │   feature cierra → product/plan; etc.)   │
        └──────────────────────────────────────────┘
                              │
                              ▼
              ARTIFACTS DEL FRAMEWORK COMPLETOS
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │ Reporte al usuario (obligatorio):        │
        │  · Docs generados con versión y ancestor │
        │  · Gaps declarados (Regla 27)            │
        │  · Regla 8 inconstruible si es bug (R29) │
        │  · Confidence de la inferencia           │
        │  · Padres bumpeados                      │
        │  · Sugerencia de revisión humana (R28)   │
        └──────────────────────────────────────────┘
```

---

## Detalle por fase

### Fase 1 — Descubrimiento

Escanear los artifacts sobrevivientes del trabajo. La skill decide qué fuentes usar según el skill invocado:

| Skill | Fuentes primarias | Fuentes secundarias |
|---|---|---|
| `/fremi-reverse-story` | `src/functions/<lambda>/`, `test/functions/<lambda>/`, commits del path | package.json, docs sueltos, PR descriptions |
| `/fremi-reverse-feature` | Stories existentes de la feature, código común, README de feature | git log del folder de la feature |
| `/fremi-reverse-bug` | Commit del fix (identificado por keyword "fix:", "bug:", etc.), diff | Tests agregados junto al fix, issue tracker |
| `/fremi-reverse-enabler` | IaC files (serverless.yml, CDK, terraform), scripts de tooling, package.json deps | Config files, CI/CD workflows |
| `/fremi-reverse-product` | `docs/works/features/`, `package.json`, `README.md`, `CLAUDE.md` | Todo el árbol de features + git log de root |
| `/fremi-reverse-extra` | Scripts en `scripts/`, cambios de `docs/frmwk/`, mejoras a tooling | Commits de refactor, config changes |

### Fase 2 — Inferencia

Mapeos concretos artifact → doc:

| Fragmento del código/tests | Doc reconstruido |
|---|---|
| Estructura `describe('...') → it('...')` de tests | Escenarios BDD `SC-XXX` (Given/When/Then reconstruido del wording) |
| Schema Zod / interface TS de request/response | Sección de contratos en `FW-05_sdd-spec.md` |
| Códigos HTTP retornados por el handler | Tabla de errores en `FW-05_sdd-spec.md` |
| Dependencias de `package.json` + estructura de carpetas | Sección "Tecnologías elegidas" en `FW-06_design.md` |
| Wrappers, adapters, capas internas del handler | Sección "Estructura interna" en `FW-06_design.md` |
| Commits git (uno por cambio significativo) | `task-XXX` en `FW-08_plan.md` con estado `[x]` |
| Enumeración de tests existentes | `TC-XXX` en `FW-07_tdd-plan.md` con mapeo a SC-XXX |
| README de la lambda / feature | Base para `FW-01_definition.md` (excepto `So that` — Regla 27) |
| IaC + variables de entorno | Sección "Infraestructura" en `EN-02_design.md` |

### Fase 3 — Preguntas dirigidas (Regla 27)

**Regla dura**: reverse **infiere del código** y **pregunta al usuario**. **NUNCA inventa**.

Gaps típicos que requieren pregunta al usuario:

- `As a <rol> / I want <acción> / So that <beneficio>` — el `So that` no se deriva del código. Preguntar.
- Iniciativa asociada (`init-XXX`) — a qué hipótesis de negocio pertenece. Preguntar o marcar sin vincular.
- Motivación de un ADR — el código muestra la decisión implementada; no el porqué. Preguntar.
- CAs obvios sin test — ¿gap de test o CA fantasma?
- RNFs medibles (latencia, throughput, tamaños) — pedir 1-2 valores al usuario.

Los pipelines interactive pausan aquí; los pipelines auto acumulan preguntas y las hacen todas juntas al terminar la fase.

### Fase 4 — Timestamps + linaje (Regla 30)

Inferencia de fechas via `git log`:

```bash
# Fecha de creación del archivo/módulo
git log --diff-filter=A --follow --format="%ai" -- <archivo> | tail -1

# Fecha del último cambio
git log -1 --format="%ai" -- <archivo>

# Versión del padre en una fecha específica
git blame -L <línea-frontmatter-version>,+1 -- <archivo-padre>
```

**Si no hay `.git`**: reverse pide al usuario las fechas manualmente, o setea todo a "hoy" con `reverse_engineered_confidence: 0.3` como señal fuerte de baja confianza.

### Fase 5 — Escritura (Regla 26)

Default `--transparent`: el frontmatter incluye el bloque:

```yaml
reverse_engineered: true
reverse_engineered_at: 2026-08-05
reverse_engineered_source: git-history+tests
reverse_engineered_confidence: 0.85
```

Con `--stealth` (override explícito, requiere justificación por proyecto), el bloque se omite y el doc queda indistinguible de uno producido por el flow forward.

Templates: los skills reverse consumen los templates canónicos de los skills productores via symlinks en su `references/` (Regla 19).

### Fase 6 — Bump padres (Regla 30 + 17)

Al firmar closure reconstruido, aplicar `parent_bump_triggers` de `config.yaml` **igual que el flow forward**. Reverse no exime del bump.

Ejemplo: reverse-engineering de una story cerrada → bumpear `feature/spec.md`, `feature/decisions.md`, `feature/definition.md` según reglas.

---

## Cuándo invocar cada skill

| Situación | Skill | Modo típico |
|---|---|---|
| Endpoint sin story | `/fremi-reverse-story FT-XX HU-YY` o `/fremi-pipeline-reverse-story` | `transparent` interactive |
| Feature entera sin docs | `/fremi-pipeline-reverse-feature FT-XX` | `transparent` interactive |
| Producto sin capa formalizada | `/fremi-pipeline-reverse-product` | `transparent` interactive (recomendado siempre — riesgo alto de racionalización post-hoc) |
| Bug fixeado sin ciclo Regla 8 | `/fremi-reverse-bug FT-XX/HU-YY <slug>` | `transparent` (declara Regla 29) |
| Infra/tooling montado sin enabler | `/fremi-pipeline-reverse-enabler` | `transparent` |
| Tooling/refactor sin EX | `/fremi-reverse-extra <slug>` | `transparent` |

---

## Reglas del framework que aplican durante reverse

| Regla | Aplicación en reverse |
|---|---|
| **Regla 1** (orden de etapas) | Reverse produce los docs en orden lógico, no salta etapas. |
| **Regla 3b** (bifurcaciones → ADR) | Si al inferir Design aparece que se tomó una decisión con opciones viables, se registra ADR retroactivo (marcado `discovered_during_reverse: true`). |
| **Regla 6** (BDD → SDD → Design) | Se reconstruye respetando el orden de dependencias. |
| **Regla 8** (test rojo primero) | **NO reconstruible retroactivamente** — ver Regla 29. |
| **Regla 10** (docs son fuente de verdad) | Reverse re-alinea código y docs; después del reverse, los docs son verdad. |
| **Regla 12** (sync-back) | Si durante reverse aparece que algo pertenece a capa superior, se sube (igual que forward). |
| **Regla 17** (versionado + linaje) | Aplica con timestamps inferidos — ver Fase 4. |
| **Regla 24** (framework instalado) | Precondición dura de todas las skills reverse. |
| **Regla 25–32** (reglas específicas de reverse) | Ver [`docs/frmwk/rules/reverse.md`](../rules/reverse.md). |

---

## Reporte final (obligatorio en todo skill/pipeline reverse)

1. **Docs generados**: lista con path, versión, ancestor.
2. **Confidence**: valor global de la corrida (promedio ponderado de la confianza por fase).
3. **Gaps declarados** (Regla 27): items sin resolver + tipo (falta `So that`, falta iniciativa, CA sin test, etc.).
4. **Regla 8 status** (solo en reverse-bug): declarada inconstruible retroactivamente.
5. **Padres bumpeados**: qué documento subió y a qué versión.
6. **Modo usado**: `transparent` (default) o `stealth` (con nota de que fue override explícito).
7. **Recomendación de revisión humana** (Regla 28): áreas donde el usuario debe validar.

---

## Referencias

- Reglas del flow forward: [`docs/frmwk/rules/workflow.md`](../rules/workflow.md).
- Reglas específicas de reverse: [`docs/frmwk/rules/reverse.md`](../rules/reverse.md).
- Config operativo: [`docs/frmwk/settings/config.reverse.yaml`](../settings/config.reverse.yaml).
- Skills: [`docs/frmwk/reverse-engineering/`](../reverse-engineering/).
- Pipelines: [`docs/frmwk/pipelines/`](../pipelines/) — buscar `pipeline.reverse.*.md`.
- Flow forward por capa: `docs/frmwk/flows/flow.product.md`, `flow.feature.md`, `flow.story.md`, etc.
