---
name: fremi-pipeline-reverse-story
description: Pipeline de auto-ejecución de la VÍA REVERSE para la capa STORY. Reconstruye los 11 docs FW-00..FW-10 de una story a partir de código, tests y commits ya existentes (Regla 25). Corre en modo transparent por default (Regla 26) — cada doc lleva frontmatter reverse_engineered:*. Pausa ante gaps no-inferibles (Regla 27), bifurcaciones inferidas (Regla 3b) o precondiciones ausentes. NO ejecuta código de producción — sólo reconstruye docs. Aplica Regla 29 si el trabajo incluye bugs previos. Alternativa manual: `/fremi-reverse-story FT-XX HU-YY` para skill suelto.
---

# /fremi-pipeline-reverse-story — Pipeline REVERSE capa STORY

Corre en modo **automático** la cadena de reconstrucción para UNA story cuyo código ya existe pero cuyos docs FW-00..FW-10 no fueron creados por el flow forward.

**Fuente de verdad de la secuencia:** [`docs/frmwk/settings/config.reverse.yaml`](../settings/config.reverse.yaml) — declara skills, defaults y policies transversales. **Fuente de verdad del flujo:** [`docs/frmwk/flows/flow.reverse.md`](../flows/flow.reverse.md) — 6 fases canónicas.

**Alcance del pipeline:** planificación completa (FW-00..FW-08) + `FW-09_checkwork` marcado 100% (todo cerrado — el código ya existe) + `FW-10_closure` firmado con matriz de trazabilidad reconstruida. **NO** ejecuta código nuevo — la implementación ya está en producción.

## Sintaxis

```
/fremi-pipeline-reverse-story <FEATURE_ID> <HU_ID_o_nombre> [--mode interactive|auto] [--stealth] [--from-git-history] [--dry-run]
```

- `<FEATURE_ID>`: ej `FT-03`. La feature padre debe existir (aunque sea recién reverse-engineerada).
- `<HU_ID_o_nombre>`: `HU-05` si ya existe carpeta / nombre en lenguaje natural si se está creando el HU en la corrida.
- `--mode` *(opcional, default `interactive` — recomendación de `config.reverse.yaml`)*: interactive pausa entre docs; auto corre todo.
- `--stealth` *(opcional, requiere justificación explícita)*: sobreescribe el default `transparent` (Regla 26). Los docs quedan indistinguibles del flow forward.
- `--from-git-history` *(opcional pero recomendado)*: usa `git log` para inferir fechas + `task-XXX` del plan.
- `--dry-run` *(opcional)*: sólo reporta qué haría, no escribe archivos.

## Precondiciones duras (abortan el pipeline)

- **Regla 24** — Framework instalado.
- **Regla 25** — Trabajo mergeado/en producción. Si el código está en un branch experimental sigue cambiando → abortar, sugerir esperar a merge.
- Feature `<FEATURE_ID>` existe (con `definition.md` real o reverse-engineerada previamente).
- El código correspondiente a la story existe: `src/functions/<lambda>/` o equivalente identificable.
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3` (política `git_history.fallback_when_missing`).

## Cadena de ejecución

Al 2026-08-05, la cadena de reconstrucción es:

| # | Fase | Sub-skill invocado | Produce |
|---|---|---|---|
| 0 | Descubrimiento | (inline) | Inventario de código + tests + commits + package.json |
| 1 | Inferencia BDD/SDD/Design | (inline, precede escritura) | Mapeos artifact → doc en memoria |
| 2 | Preguntas dirigidas (Regla 27) | (inline) | Respuestas del usuario para gaps no-inferibles |
| 3 | Escritura de docs | `/fremi-reverse-story` (interno) | Los 11 docs FW-00..FW-10 |
| 4 | Bump padre | (inline) | `feature/spec.md` + `feature/decisions.md` + `feature/definition.md` bumpeados |
| 5 | Reporte final | (inline) | Confidence, gaps, Regla 8 status, revisión recomendada |

## Stop events específicos

Además de los stop events genéricos del [README](README.md), pausa cuando:

1. **Gap no-inferible** (Regla 27) — `So that`, iniciativa, motivación ADR, RNFs, CAs sin test. En interactive pregunta ahora; en auto acumula y pregunta al final de fase 2.
2. **Bifurcación técnica inferida** (Regla 3b) — el código muestra que se eligió una librería/pattern entre alternativas viables. Registrar ADR retroactivo (marcado `discovered_during_reverse: true`) — preguntar al usuario si esa fue la decisión real o accidental.
3. **CAs contradictorios entre tests y schemas** — un test asume comportamiento X, el schema exige Y. Pausar y pedir criterio al usuario.
4. **Sin git history** — con `--from-git-history` pedido pero `.git` ausente. Preguntar si continuar con `confidence: 0.3` o abortar.
5. **Confidence < `min_threshold`** — bajo 0.5 en `config.reverse.yaml`. Pausar y avisar al usuario que la corrida producirá docs marcados `needs_review: true`.
6. **Regla 32 activada** — ratio reverse/forward superó umbral. Pausar y notificar (no bloquea).

## Reglas del framework que aplican

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps, no inventar.
- **Regla 28** — reverse no reemplaza revisión humana — reportar áreas a revisar.
- **Regla 30** — versionado con timestamps inferidos.
- **Regla 17** — bumpear padres al firmar closure inferido.
- **Regla 31** — si el código sigue cambiando, no es reverse: abortar.

## Después del pipeline

La story queda con toda la cadena reconstruida:

```
docs/works/features/FT-XX/user-stories/HU-YY_<slug>/
├── FW-00_explore.md            (si aplicó — con reverse_engineered:*)
├── FW-01_definition.md         (v1.0.0 snapshot — con reverse_engineered:*)
├── FW-02_proposal.md           (si aplicó)
├── FW-03_scope.md
├── FW-04_bdd-userstories.md    (SC-XXX derivados de tests)
├── FW-05_sdd-spec.md           (contratos + tabla de errores + RNFs — RNFs preguntados)
├── FW-06_design.md             (tech inferido de package.json + patterns observados)
├── FW-07_tdd-plan.md           (TC-XXX = tests existentes)
├── FW-08_plan.md               (task-XXX = commits, todos [x])
├── FW-09_checkwork.md          (100% — todo cerrado, código ya en prod)
└── FW-10_closure.md            (firmado — matriz de trazabilidad reconstruida)
```

**Próximos pasos naturales:**
1. Revisar el reporte final — especialmente gaps declarados.
2. Corregir a mano el `So that` del `FW-01_definition` si quedó TBD.
3. Vincular la story a una iniciativa si quedó sin vincular.
4. Revisar los `SC-XXX` — validar que reflejan negocio y no sólo "cómo el dev lo implementó".
5. Si aparecieron bugs previos sin registrar → correr `/fremi-reverse-bug FT-XX/HU-YY` para cada uno.

## Reporte final (obligatorio)

1. **Story reconstruida**: `FT-XX/HU-YY_<slug>` + path completo.
2. **Docs producidos**: lista con versión, ancestor, modo (transparent/stealth).
3. **Confidence global**: valor 0.0-1.0 (promedio ponderado).
4. **Modo usado**: transparent (default) o stealth (con nota de override explícito).
5. **Gaps declarados** (Regla 27): items sin resolver + fallback aplicado.
6. **Bifurcaciones descubiertas**: ADRs retroactivos generados + scope.
7. **Padres bumpeados**: qué versión subieron `feature/spec.md`, `feature/decisions.md`, `feature/definition.md`.
8. **Regla 8 status**: N/A para story (aplica sólo a bugs — Regla 29). Si durante reverse aparecen bugs previos → recomienda `/fremi-reverse-bug`.
9. **Áreas de revisión humana** (Regla 28): So that, SC-XXX contra negocio, ADRs retroactivos.

## Referencias

- Config operativo: [`docs/frmwk/settings/config.reverse.yaml`](../settings/config.reverse.yaml)
- Reglas específicas: [`docs/frmwk/rules/reverse.md`](../rules/reverse.md) — Reglas 25-32.
- Flujo descriptivo: [`docs/frmwk/flows/flow.reverse.md`](../flows/flow.reverse.md)
- Skill suelto: [`/fremi-reverse-story`](../reverse-engineering/reverse-story/SKILL.md)
- Pipeline padre: [`/fremi-pipeline-reverse-feature`](pipeline.reverse.feature.md)
- README de pipelines: [`README.md`](README.md)
