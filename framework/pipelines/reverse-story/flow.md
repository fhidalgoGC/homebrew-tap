---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-reverse-story
  version_at_creation: null
---

# Flujo — Pipeline REVERSE-STORY (`/fremi-pipeline-reverse-story`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Skill subyacente:** [`~/.fremi/framework/reverse-engineering/reverse-story/SKILL.md`](../../reverse-engineering/reverse-story/SKILL.md) — lógica de inferencia por doc.
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md) — las 6 fases que este pipeline ejecuta.

Este documento describe la **narrativa del flujo** que el pipeline atraviesa cuando corre. Complementa `PIPELINE.md` (invocación, sintaxis) y `workflow.yaml` (secuencia machine-readable).

---

## Qué hace el pipeline

Reconstruye en modo **automático** la cadena completa de docs de una story (todos los docs FW-00..FW-10, 11 archivos) a partir de código, tests y commits ya existentes en producción, sin pausar entre fases, salvo:

- Precondiciones ausentes (aborta).
- Stop events reales (gaps no-inferibles, confidence baja, bifurcaciones técnicas — ver abajo).

**Termina con la story completamente formalizada en el framework.** No ejecuta código nuevo — la implementación ya está en producción.

---

## Alcance del pipeline

| # | Fase (id) | Qué hace | Produce |
|---|---|---|---|
| −1 | `verify_preconditions` (preflight) | Verifica R25 + R24 + scope del código | — (aborta si falla) |
| −2 | `determine_story_scope` (preflight) | Resuelve path de código, confirma HU no existe | — |
| 1 | `identify` | Escanea código + tests + git log + docs sueltos | Inventario en memoria |
| 2 | `scan` | Mapea artifacts → docs del flow (SCs, contratos, tech, tasks) | Mapeos en memoria |
| 3 | `evaluate` | Preguntas dirigidas para gaps no-inferibles (R27) | Respuestas del usuario / TBDs |
| 4 | `reconstruct` | Escribe los 11 docs FW-XX con timestamps inferidos (R26, R30) | FW-00..FW-10 |
| 5 | `report_gaps` | Declara gaps al usuario (R28) | Reporte de warnings |
| 6 | `close_lineage` | Bumpea padres feature/spec + decisions + definition (R17) | Versiones bumpeadas |

**Dentro del alcance** (a diferencia del pipeline forward):
- `checkwork` — reconstruido al 100% (todo cerrado — el código ya existe).
- `closure` — firmado con matriz de trazabilidad reconstruida.

---

## Arco narrativo

### 1. Preflight — verificar antes de tocar archivos

Antes de cualquier escaneo, el pipeline verifica las precondiciones duras (Regla 25 + Regla 24):

- Framework instalado (`.claude/skills/fremi-reverse-story` symlink + `CLAUDE.md` referencia `workflow.md`).
- El código de la story está mergeado a main o en branch de release confirmado — no en rama experimental.
- La feature padre existe (con `definition.md` real o reverse-engineerada).
- El código identificable existe en `src/functions/<lambda>/` o equivalente.
- La carpeta de story **NO** existe ya con docs FW-XX — reverse no sobreescribe.

Si falla cualquier check → pipeline aborta antes de tocar ningún archivo.

### 2. Descubrimiento — escanear artifacts sobrevivientes

La fase `identify` escanea todas las fuentes disponibles del trabajo:

```
Código:   src/functions/<lambda>/ — exports, tipos, endpoints
Tests:    test/functions/<lambda>/ — describe/it blocks, assertions
Git:      git log --follow <archivos> — fecha primer commit, fecha último, mensajes
Docs:     README.md, JSDoc, comentarios inline del módulo
```

El resultado es un inventario en memoria que alimenta la fase de inferencia.

### 3. Inferencia — mapear artifacts a docs del flow

La fase `scan` produce los mapeos concretos:

| Artifact escaneado | Doc que alimenta |
|---|---|
| Bloques `describe/it` de tests | `{workflow.bdd}` — escenarios SC-XXX (Given/When/Then) |
| Schemas Zod / interfaces TS | `{workflow.sdd}` — contratos de request/response |
| Códigos HTTP del handler | `{workflow.sdd}` — tabla de errores |
| `package.json` + estructura de archivos | `{workflow.design}` — tecnologías + componentes |
| Commits git | `{workflow.plan}` — task-XXX (todos `[x]`) |
| Tests existentes enumerados | `{workflow.tdd}` — TC-XXX con mapeo a SC-XXX |
| README / PR title / commit inicial | `{workflow.definition}` — base del As a / I want |

### 4. Preguntas dirigidas — gaps no-inferibles (Regla 27)

La fase `evaluate` es donde el pipeline para a preguntar al usuario lo que el código no puede revelar:

1. **`So that` del definition** — el propósito de negocio no se infiere del código. Preguntar o marcar TBD.
2. **Iniciativa asociada** — a qué hipótesis de negocio (`init-XXX`) pertenece este trabajo.
3. **Motivación de ADRs** — el código muestra la decisión, no el porqué. Preguntar el rationale.
4. **CAs sin test** — si hay un CA obvio sin cobertura de tests, ¿es gap real o CA fantasma?
5. **RNFs medibles** — latencia, throughput, tamaños de payload — pedir valores tentativos.

En modo `interactive`: el pipeline pausa y pregunta cada gap apenas lo detecta.
En modo `auto`: acumula todos los gaps y los pregunta juntos al final de la fase.

**Regla dura:** nunca inventar. Si el usuario no puede responder → marcar TBD con nota de gap explícita.

### 5. Reconstrucción — escribir los 11 docs

La fase `reconstruct` escribe todos los docs con contenido inferido + respuestas de la fase anterior:

- Todos los docs de story (`{workflow.explore}` condicional, `{workflow.definition}` hasta `{workflow.closure}`).
- `{workflow.checkwork}` con 100% de progreso (todas las tasks `[x]`).
- `{workflow.closure}` firmado con matriz de trazabilidad reconstruida + fecha del último commit.
- Frontmatter completo con timestamps inferidos del git history (Regla 30).

**Modo `--transparent`** (default, Regla 26): cada doc incluye el bloque:

```yaml
reverse_engineered: true
reverse_engineered_at: YYYY-MM-DD
reverse_engineered_source: git-history+tests+code
reverse_engineered_confidence: 0.85
```

**Modo `--stealth`** (override explícito): los docs quedan indistinguibles del flow forward (sin el bloque `reverse_engineered:*`). Requiere justificación en ADR a nivel proyecto.

### 6. Reporte de gaps y cierre de linaje

Al terminar la escritura:

- `report_gaps` declara todos los TBDs, warnings y áreas de revisión humana (Regla 28).
- `close_lineage` bumpea los padres igual que el flow forward: `feature/spec.md`, `feature/decisions.md`, `feature/definition.md` según `parent_bump_triggers.story_closes` (Regla 17 + Regla 30).

### 7. Stop events — dónde pausa el pipeline

El pipeline pausa (no aborta) ante 7 condiciones — ver `workflow.yaml → stop_events`:

1. **`gap_non_inferrable`** — durante `evaluate`, cuando un dato de negocio no se puede inferir del código (Regla 27).
2. **`technical_bifurcation_inferred`** — durante `scan` o `reconstruct`, cuando el código evidencia una elección técnica entre alternativas (Regla 3b → ADR retroactivo).
3. **`ca_test_contradiction`** — durante `scan`, cuando un test y un schema asumen comportamientos contradictorios.
4. **`git_history_absent`** — con `--from-git-history` pedido pero `.git` ausente o sin commits del path.
5. **`low_confidence`** — cuando el score calculado cae bajo el umbral mínimo configurado (default 0.5); los docs se marcarán `needs_review: true`.
6. **`reverse_ratio_exceeded`** — al final, si el ratio reverse/forward del proyecto superó el umbral (Regla 32 — notificación, no bloqueo).
7. **`stealth_without_adr`** — antes de `reconstruct`, si se usó `--stealth` sin ADR que lo justifique (Regla 26).

**Anti-patrones — el pipeline NO debe pausar por esto:**
- Confirmar wording de cada SC/TC individualmente.
- Preguntar cuántas tasks inferir de cada commit.
- Pedir feedback tras cada doc completado.

---

## Diferencia con `/fremi-reverse-story` manual

| Aspecto | `/fremi-pipeline-reverse-story` (auto) | `/fremi-reverse-story` manual |
|---|---|---|
| Alcance | 6 fases completas → 11 docs + bump padres | Skill suelto — mismo proceso pero con más control de invocación |
| Modo | `interactive` por default (pausa entre fases) | Elige al invocar (`--interactive`) |
| Gestión de gaps | Acumula en auto / pregunta uno a uno en interactive | Igual al pipeline |
| Cuándo conviene | Story con código claro y tests bien organizados | Story donde querés controlar cada fase con más atención |

**Nota:** el pipeline invoca `/fremi-reverse-story` internamente — no es un orquestador separado, es el mismo skill con la orquestación de fases envuelta.

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- **R25** — Código mergeado a main / en producción (no branch experimental).
- **R1** — Feature padre existe con `definition.md` real.
- Código de la story identificable en el repo.
- Carpeta de story NO existe ya con docs FW-XX.
- `config.reverse.core.yaml → active: true`.

Si falla cualquiera → abortar con mensaje claro. **No auto-instalar el framework.**

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: trabajo en producción.
- **R26** — Default `--transparent` — marca de origen reverse en frontmatter.
- **R27** — Gaps no-inferibles → preguntar, nunca inventar.
- **R28** — Reverse no reemplaza revisión humana.
- **R30** — Regla 17 aplica retroactivamente con timestamps inferidos de git.
- **R31** — Código en curso → abortar; reverse sólo para trabajo pre-existente.
- **R32** — Ratio reverse/forward reportado como señal de salud.
- **R17** — Bumpear padres al cerrar (igual que flow forward).
- **R3b** — Bifurcaciones técnicas descubiertas → ADR retroactivo.

---

## Estado final después del pipeline

La story queda con toda la cadena reconstruida:

```
docs/works/features/{feature_folder}/user-stories/{story_folder}/
├── {workflow.explore}        (si se detectó iteración en commits — con reverse_engineered:*)
├── {workflow.definition}     (v1.0.0 snapshot — CAs derivados de tests)
├── {workflow.proposal}       (si se detectó contrato nuevo o 3+ archivos afectados)
├── {workflow.scope}          (in-scope = endpoints/funciones; out-of-scope = skips + TODOs)
├── {workflow.bdd}            (SC-XXX derivados de describe/it blocks)
├── {workflow.sdd}            (contratos Zod/TS + tabla errores + RNFs preguntados)
├── {workflow.design}         (tech de package.json + patterns observados)
├── {workflow.tdd}            (TC-XXX = tests existentes, todos [x])
├── {workflow.plan}           (task-XXX = commits, todos [x])
├── {workflow.checkwork}      (100% — todo cerrado, código ya en prod)
└── {workflow.closure}        (FIRMADO — matriz de trazabilidad reconstruida)
```

**Próximos pasos naturales:**
1. Revisar el reporte final — especialmente gaps declarados.
2. Completar el `So that` si quedó TBD.
3. Vincular a una iniciativa (`init-XXX`) si quedó sin vincular.
4. Revisar los SC-XXX — validar que reflejan negocio y no sólo "cómo lo implementó el dev".
5. Si aparecieron bugs previos sin registrar → correr `/fremi-reverse-bug` para cada uno.
6. Correr `/fremi-sync-check` para verificar coherencia con el resto del framework.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md)
- Skill subyacente: [`/fremi-reverse-story`](../../reverse-engineering/reverse-story/SKILL.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../../reverse-engineering/rules/reverse.md) — Reglas 25–32
- Pipeline padre: [`/fremi-pipeline-reverse-feature`](../reverse-feature/PIPELINE.md)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del pipeline reverse-story.
