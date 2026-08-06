# `~/.fremi/framework/framework/reverse-engineering/` — Vía formal de alineación de código pre-existente

> **Actualizado 2026-08-05:** reverse-engineering es una **vía de primera clase** del framework (Regla 25), no procedimiento excepcional. Se ejerce cuando existe código en producción sin sus docs del flow. Tiene reglas propias (`rules/reverse.md`, Reglas 25-32), su flow (`flows/flow.reverse.md`), config (`settings/config.reverse.yaml`), 6 skills y 4 pipelines.
>
> **Spelling**: `reverse-engineering` (con doble "e"). El pedido original mencionaba `reverse-enginering` — se corrigió.

Skills que **reconstruyen** los documentos del flujo del framework **partiendo de artifacts existentes** (código, tests, docs sueltos, commits) — como si el flujo se hubiera seguido desde el principio. **Default mode: `transparent`** (Regla 26) — cada doc queda marcado con `reverse_engineered:*` en el frontmatter para trazabilidad histórica visible.

---

## Cuándo se usa

Cuando existe **trabajo real** (código en producción, tests corriendo, funcionalidad activa) pero **no existen los docs del flujo** que deberían haber precedido:

1. **Usuario le pidió al agente "hazme el endpoint X"** — el agente escribió código sin crear la story completa.
2. **Feature legacy** — código que nació antes del framework, sin BDD/SDD/TDD formales.
3. **Bug fixeado sin ciclo Regla 8** — se aplicó fix directo sin registrar el bug.
4. **Tooling manual** — cambios en scripts/IaC/tooling que no se documentaron como `EX-NN`.
5. **Product implícito** — el producto está en producción pero nunca se declararon iniciativas/definition formalmente.

---

## Skills disponibles

| Skill | Rol | Objetivo |
|---|---|---|
| [`reverse-story/`](./fremi-reverse-story/SKILL.md) | Reconstruir cadena FW-01..FW-10 de una story | A partir de código + tests |
| [`reverse-feature/`](./fremi-reverse-feature/SKILL.md) | Reconstruir `FT-XX/definition.md` (+ decisions) | A partir de stories existentes o código |
| [`reverse-bug/`](./fremi-reverse-bug/SKILL.md) | Reconstruir `BG-XX_<slug>.md` (story o feature) | A partir de fix ya aplicado |
| [`reverse-enabler/`](./fremi-reverse-enabler/SKILL.md) | Reconstruir EN-01..EN-04 | A partir de infra/tooling ya montado |
| [`reverse-product/`](./fremi-reverse-product/SKILL.md) | Reconstruir capa producto (iniciativas → plan) | A partir de features existentes |
| [`reverse-extra/`](./fremi-reverse-extra/SKILL.md) | Reconstruir `EX-NN_<slug>.md` | A partir de tooling/scripts ya cambiados |

---

## Cómo funciona (concepto general)

**Fases comunes a todos los sub-skills**:

### Fase 1 — Descubrimiento

Escanear los artifacts sobrevivientes:
- **Código** — archivos en `src/`, `lib/`, etc.
- **Tests** — archivos `*.test.ts`, `*.spec.ts`.
- **Commits git** — historial relacionado con el trabajo.
- **PR descriptions** — si hay integración con GitHub/GitLab.
- **Comentarios / JSDoc** — pistas sobre intención.
- **Docs sueltos** — READMEs, notas.

### Fase 2 — Inferencia

De cada artifact sobreviviente, inferir el contenido de los docs del flow:

| Doc a reconstruir | Fuente de inferencia |
|---|---|
| `FW-01_definition` (definition) | Descripción del código + input del usuario para el "So that" |
| `FW-03_scope` | Diff del código vs. tests (qué SÍ, qué NO) |
| `FW-04_bdd` (Given/When/Then) | Estructura `describe/it` de los tests |
| `FW-05_sdd` (contratos) | Types TS / Zod schemas / rutas HTTP / códigos de error |
| `FW-06_design` (tech) | package.json + estructura de archivos + patterns observados |
| `FW-07_tdd` (TC-XXX) | Enumeración de tests existentes |
| `FW-08_plan` (task-XXX) | Historial de commits (uno por task inferida) |
| `FW-09_checkwork` (100%) | Todo cerrado (el código ya está) |
| `FW-10_closure` | Matriz de trazabilidad reconstruida + sign-off |

### Fase 3 — Preguntas dirigidas

Cuando la información **no se puede inferir del código** (motivación de negocio, iniciativa asociada, CA que no está cubierto por tests), el skill hace preguntas específicas al usuario. NO inventa.

### Fase 4 — Aplicar Regla 17 con timestamps inferidos

- `created` = fecha del primer commit relacionado (via `git log`), o fecha actual si no hay historial.
- `last_updated` = fecha del último commit relacionado, o actual.
- Versión: inicial (v1.0.0 para snapshots, v0.1.0 para living).
- `ancestor.version_at_creation` = versión del padre en la fecha inferida (usando git blame o versión actual como fallback).
- Changelog: entradas retroactivas por commit si el doc es living.

### Fase 5 — Escribir docs

- **Modo `--stealth`** (default): los docs se ven exactamente como si hubieran sido creados normalmente. Sin flag `reverse_engineered` en el frontmatter. **Indetectable**.
- **Modo `--transparent`**: agrega `reverse_engineered: true` y `reverse_engineered_at: YYYY-MM-DD` en el frontmatter para trazabilidad.

### Fase 6 — Bumpear padres (Regla 17)

Al firmar closure (FW-10 o EN-04), aplicar `parent_bump_triggers` como si fuera normal.

---

## Modos operativos

| Flag | Comportamiento |
|---|---|
| (default `--transparent`) | Marca `reverse_engineered: true` + fecha + fuente + confidence en el frontmatter. Trazabilidad histórica visible (Regla 26). |
| `--stealth` | Override explícito — indetectable, los docs se ven idénticos a los del flujo normal. Requiere justificación por ADR a nivel proyecto para hacerlo default (Regla 26). |
| `--dry-run` | Sólo reporta qué haría, no escribe archivos |
| `--interactive` | Hace preguntas paso a paso al usuario (default en modo conversacional) |
| `--from-git-history` | Usa `git log` como fuente principal para inferir fechas y tareas |

---

## Trade-offs y advertencias

### ⚠️ El código ya existe → la spec derivada refleja el código, no la intención original

- El BDD reconstruido de tests puede tener SC-XXX que en realidad son "cómo lo implementó el dev" en vez de "cómo lo especifica el negocio".
- Un test que pasa no significa que el scenario sea correcto — sólo que el código y el test coinciden.
- Los edge cases que el dev NO pensó → no aparecen en tests → no se reconstruyen como SC-XXX. Quedan como gaps invisibles.

### ⚠️ Ingeniería inversa NO reemplaza revisión humana

- El skill genera **una base** de docs. El usuario debe revisar y corregir gaps.
- **Especialmente** el "So that" del `FW-01_definition` — el propósito de negocio NO se puede inferir del código.
- La Iniciativa asociada (init-XXX) tampoco.

### ⚠️ Modo `--stealth` es override explícito — default es `--transparent`

- El **default es `transparent`** (Regla 26) — los docs quedan marcados como reverse-engineered en el frontmatter.
- `--stealth` sigue disponible pero requiere **decisión explícita del proyecto** (ADR a nivel proyecto para cambiar el default).
- Un `/fremi-sync-check` posterior distingue docs reverse-engineered de los normales por el bloque `reverse_engineered:*` — sólo en `--stealth` se pierde esa distinción.

### ⚠️ Regla 8 (test rojo primero) NO se puede reverse-engineerar

- Si el código ya funciona y los tests pasan, no hay "test rojo primero" que reconstruir.
- Para bugs: si el fix ya está aplicado y verde, no se puede recrear el test rojo pre-fix.
- El skill reporta esta limitación al usar `/fremi-reverse-bug`.

### ⚠️ Reverse no se usa para trabajo nuevo (Regla 31)

Reverse alinea código **pre-existente** al framework. Para trabajo nuevo se usa el flow forward (`/fremi-pipeline-*` o skills sueltos). Si el equipo usa reverse rutinariamente para "regularizar" trabajo reciente que arrancó fuera del flow, la disciplina forward está rota — corregir eso, no compensar con reverse.

El hook `check-reverse-alignment.sh` reporta el **ratio reverse/forward** del proyecto (Regla 32):
- \>15% reverse → warning
- \>30% reverse → crítico

---

## Ejemplo típico

```
Usuario: "Implementé el endpoint POST /reports/csv anoche sin hacer la story.
          Ya está en producción. Reconstruíme la story."

Agente: /fremi-reverse-story FT-05 HU-XX

Skill:
  1. Escanea src/functions/reports/ y test/functions/reports/
  2. Descubre: handler, schemas Zod, 12 tests unitarios, 2 e2e
  3. Infiere:
     - FW-01_definition: "As a analista..." (pregunta al user por el "So that")
     - FW-03_scope: in-scope de código + out-of-scope de tests skip
     - FW-04_bdd: 14 escenarios derivados de tests
     - FW-05_sdd: contratos de schemas + tabla de errores del handler
     - FW-06_design: Puppeteer/csv-parser detectados en package.json
     - FW-07_tdd: 14 TC-XXX reconstruidos
     - FW-08_plan: 5 tareas inferidas de git commits
     - FW-09_checkwork: 100% cerrado
     - FW-10_closure: matriz reconstruida + sign-off <YYYY-MM-DD>
  4. Bumpea FT-05/definition.md MINOR
  5. Reporta: "Story reconstruida. Revisar 3 CAs sin test asociado en FW-01."
```

---

## Cuándo NO usar reverse-engineering

| Caso | Alternativa correcta |
|---|---|
| Trabajo nuevo que va a arrancar | Usar el flujo normal (`/fremi-story`, `/fremi-feature`, etc.) |
| Bug con fix aún no aplicado | `/fremi-story-bug` o `/fremi-feature-bug` normal + test rojo primero (Regla 8) |
| Refactor sin cambio de comportamiento | Regla 9 — no requiere docs nuevos |
| El equipo usa el framework para todo el trabajo nuevo | ✅ No hace falta reverse-engineering — sólo aplica a trabajo huérfano |

---

## Pipelines

Para reconstruir capas enteras (múltiples docs) en cadena, usar los 4 pipelines dedicados:

| Pipeline | Reconstruye |
|---|---|
| [`/fremi-pipeline-reverse-product`](../pipelines/pipeline.reverse.product.md) | Capa producto (7 docs) + encadena reverse-feature |
| [`/fremi-pipeline-reverse-feature`](../pipelines/pipeline.reverse.feature.md) | `FT-XX/definition.md` (+ decisions) + encadena reverse-story |
| [`/fremi-pipeline-reverse-story`](../pipelines/pipeline.reverse.story.md) | 11 docs FW-00..FW-10 de una story |
| [`/fremi-pipeline-reverse-enabler`](../pipelines/pipeline.reverse.enabler.md) | 4 docs EN-01..EN-04 de un enabler |

**Bug** y **Extra** son 1 archivo — se invoca el skill suelto (`/fremi-reverse-bug`, `/fremi-reverse-extra`), sin pipeline.

## Referencias

- **Reglas específicas de reverse:** [`../rules/reverse.md`](../rules/reverse.md) — Reglas 25-32.
- **Flujo canónico:** [`../flows/flow.reverse.md`](../flows/flow.reverse.md) — 6 fases.
- **Config operativa:** [`../settings/config.reverse.yaml`](../settings/config.reverse.yaml) — defaults, skills declarados, policies.
- **Hook de validación:** [`../hooks/check-reverse-alignment.sh`](../hooks/check-reverse-alignment.sh) — reporta ratio, chequea confidence, recuerda parent bump.
- Regla 10 (docs son fuente de verdad) en [`../rules/workflow.md`](../rules/workflow.md).
- Regla 17 (versionado + linaje) en [`../rules/workflow.md`](../rules/workflow.md).
- Skills operativos normales: [`../skills/`](../skills/).
- Configs operativas: [`../settings/config.<capa>.yaml`](../settings/).
