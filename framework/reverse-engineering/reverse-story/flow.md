---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-engineering/flow.md
  version_at_creation: null
---

# Flujo — Skill REVERSE-STORY (`/fremi-reverse-story`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de ejecución.
> **Invocación / documentación de skill:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — describe las 6 fases genéricas. Este documento detalla cómo ese arco se materializa en la capa story.

---

## Qué hace este skill

Reconstruye la **cadena completa de una user story** — todos los docs del flow (desde explore hasta closure) — a partir de artifacts ya existentes: código en `src/`, tests, historia de commits y docs sueltos. El resultado es indistinguible de una story planificada con el flow forward, excepto (por default) por el bloque `reverse_engineered:*` en el frontmatter (Regla 26).

**Cuándo invocarlo:**
- Existe código funcional en producción sin carpeta `FT-XX/user-stories/HU-YY_*/`.
- Un agente escribió código sin crear la story — hay que regularizar.
- Se está migrando código legacy al framework.

**Cuándo NO invocarlo:**
- El trabajo está en curso → usar el flow forward (`/fremi-story`, sub-skills).
- La story ya tiene docs → usar `/fremi-sync-check` para detectar divergencias.

---

## Alcance — docs que produce

| # | Doc (token) | Obligatoriedad | Fuente principal de inferencia |
|---|---|---|---|
| 0 | `{workflow.explore}` | Condicional (R16) | git log — ¿hay iteración o investigación previa? |
| 1 | `{workflow.definition}` | Siempre | PR title + commits; "So that" → preguntar usuario |
| 2 | `{workflow.proposal}` | Condicional (R16) | Estructura del código — ¿introduce contrato nuevo? |
| 3 | `{workflow.scope}` | Siempre | Exports del código + it.skip() + TODO comments |
| 4 | `{workflow.bdd}` | Siempre | Bloques describe/it de tests |
| 5 | `{workflow.sdd}` | Siempre | Rutas HTTP + schemas Zod/TS + status codes |
| 6 | `{workflow.design}` | Siempre | package.json + estructura de carpetas + capas internas |
| 7 | `{workflow.tdd}` | Siempre | Archivos de test existentes |
| 8 | `{workflow.plan}` | Siempre | Commits git + archivos creados |
| 9 | `{workflow.checkwork}` | Siempre (living) | Derivado del plan — 100% cerrado |
| 10 | `{workflow.closure}` | Siempre | Derivado de todos los docs — firmado |

---

## Arco narrativo

### Fase 0 — Cargar configuración

El skill lee los archivos de configuración necesarios:
- `methodology.core.yaml` — para resolver tokens `{workflow.*}`.
- `config.user.yaml` del artifact story — para conocer el orden de la cadena y las conditional rules.
- `config.reverse.core.yaml` — defaults de reverse (modo, confidence).

Si alguno falta → abortar antes de empezar.

### Fase 1 — Identificar el trabajo huérfano

El skill confirma el contexto del trabajo a reconstruir:
- Verifica que la carpeta `FT-XX/user-stories/HU-YY_*/` NO existe — si existe, aborta (ya hay docs; usar `/fremi-sync-check`).
- Si los paths del código, tests o commits no están claros, pregunta al usuario antes de escanear.
- Verifica que `FT-XX/definition.md` existe con contenido real (precondición dura — R25).

### Fase 2 — Escanear artifacts sobrevivientes

Con los paths confirmados, el skill recolecta la evidencia:

- **Código**: exports, types, funciones públicas, endpoints declarados.
- **Tests**: bloques `describe/it`, assertions, recuento por tipo (unit/integration/e2e).
- **Git**: `git log --follow --oneline` para obtener fecha del primer commit (`created`), fecha del último (`last_updated`) y mensajes de commit (candidatos a `task-XXX`).
- **Docs sueltos**: README del módulo, JSDoc, comentarios inline.

El escaneo produce un reporte interno que alimenta la inferencia.

### Fase 3 — Evaluar condicionales (Regla 16)

Antes de construir docs, el skill decide si los opcionales aplican:

- **`{workflow.explore}`**: ¿el git log muestra iteración o investigación previa? Si los commits sugieren múltiples enfoques o backtracking → generar. Si no → omitir.
- **`{workflow.proposal}`**: ¿el código introduce un contrato externo nuevo, cambia comportamiento visible, o afecta 3+ archivos? Si sí → generar. Si no → omitir.

### Fase 4 — Reconstruir docs + preguntas dirigidas (Regla 27)

El núcleo del skill: construye cada doc a partir del escaneo, respetando el orden de dependencias del flow forward (BDD → SDD → Design, Regla 6).

**Regla dura (R27)**: el skill infiere del código y **pregunta al usuario**. **Nunca inventa**.

Gaps que siempre requieren pregunta o marcación TBD:
1. **`So that`** del `{workflow.definition}` — el propósito de negocio no se deriva del código. Preguntar o marcar TBD.
2. **Iniciativa asociada** (`init-XXX`) — preguntar o marcar sin vincular con warning.
3. **Motivación de ADRs retroactivos** — el código muestra la decisión; no el porqué. Preguntar.
4. **Key Invariants** en el `{workflow.design}` — preguntar al usuario.
5. **CAs sin test** — preguntar: ¿gap real o CA fantasma?
6. **RNFs medibles** — pedir valores al usuario si no están en tests de performance.

El skill acumula las preguntas y las hace al usuario en bloques cohesivos — no una por una en cada doc.

### Fase 5 — Timestamps + linaje (Regla 17, R30)

Para cada doc producido, el skill aplica el frontmatter de Regla 17 con timestamps inferidos:

- `created` = fecha del primer commit relacionado (`git log --diff-filter=A --follow --format=%ai -- <archivo> | tail -1`).
- `last_updated` = fecha del último commit.
- `version` = `1.0.0` para snapshots; `0.1.0` para `{workflow.checkwork}` (living).
- `ancestor.version_at_creation` = versión actual de `FT-XX/definition.md`.

**Si no hay `.git`**: el skill pide al usuario que provea fechas, o usa "hoy" con `reverse_engineered_confidence: 0.3`.

**Modo `--transparent`** (default): agrega al frontmatter:
```yaml
reverse_engineered: true
reverse_engineered_at: YYYY-MM-DD
reverse_engineered_source: git-history+tests
reverse_engineered_confidence: 0.85
```

**Modo `--stealth`** (override explícito): omite el bloque. Los docs quedan indistinguibles del flow forward. Sólo usar con justificación en ADR de proyecto (R26).

### Fase 6 — Bumpear padre + reporte (Regla 17, R30)

Al firmar el closure reconstruido, el skill aplica `parent_bump_triggers.story_closes` igual que el flow forward:
- MINOR bump de `FT-XX/definition.md` si la story agrega requirements nuevos a la feature.
- Entry de changelog en el padre: `[origen: HU-YY — reverse-engineered]`.
- Rellena `ancestor.version_at_closure` en el `{workflow.closure}`.

Luego emite el reporte final al usuario.

---

## Stop events — dónde pausa el skill

El skill pausa (no aborta) ante condiciones que requieren input del usuario (R27):

| Stop event | Cuándo aparece | Acción |
|---|---|---|
| `so_that_not_inferrable` | No hay PR title ni README que explique el beneficio de negocio | Pedir al usuario el "So that" |
| `initiative_unknown` | No se puede inferir la iniciativa asociada | Pedir init-XXX o marcar sin vincular |
| `adr_rationale_missing` | El código muestra una elección técnica sin motivación | Pedir motivación al usuario |
| `rnf_values_missing` | La spec necesita RNFs medibles no encontrados en tests | Pedir valores al usuario |
| `ca_without_test_detected` | Comportamiento en código sin cobertura de test | Preguntar si es gap o CA fantasma |
| `git_history_missing` | No se encuentra `.git` | Pedir fechas manuales o asumir hoy con confidence 0.3 |
| `low_confidence` | Confianza global < 0.5 | Advertir; recomendar revisión profunda |

**Anti-patrones — el skill NO debe pausar por esto:**
- Confirmar wording de cada CA / SC / TC individualmente.
- Pedir aprobación de cada doc antes del siguiente.
- Preguntar cuántos tasks poner en el plan.

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R25** — Trabajo pre-existente y mergeado; no para trabajo en curso.
- **R24** — Framework instalado (`.claude/skills/fremi-reverse-story` symlink + `CLAUDE.md`).
- Feature `FT-XX` existe con `definition.md` de contenido real.
- Carpeta `HU-YY_*/` NO existe ya (si existe, no hay nada que reconstruir).
- `methodology.core.yaml` presente y parseable.

---

## Transparent vs. stealth — el trade-off

**Usar `--transparent`** (default, R26) cuando:
- La trazabilidad histórica importa (auditorías, compliance, retrospectivas).
- El equipo quiere saber qué fue planificado vs qué fue derivado del código.
- Hay incertidumbre sobre si el BDD captura la intención de negocio real (lo cual es casi siempre).

**Usar `--stealth`** sólo cuando:
- El proyecto tiene una decisión explícita de "borrar" la deuda histórica con consciencia del trade-off.
- Existe un ADR de proyecto que lo justifica.
- Se acepta que `/fremi-sync-check` no podrá distinguir docs reverse-engineered de docs del flow forward.

---

## Advertencias de revisión humana (Regla 28)

El output de reverse es **base**, no verdad final. El usuario debe revisar:

- Los SCs de BDD reconstruidos — reflejan "cómo el dev lo implementó", no necesariamente "qué esperaba el negocio".
- Los edge cases que NO aparecen en tests — son gaps invisibles al reverse.
- El wording del `{workflow.definition}` — reverse tiende a producir descripciones técnicas; el "So that" debe sonar a negocio.
- Los ADRs retroactivos — confirmar si la decisión fue real o accidental.

**Regla 8 no reconstruible (R29)**: si hubo bugs previos detectados en el código, la corrección tampoco puede reconstruir el ciclo "test rojo primero". El skill declara esta limitación explícitamente en el reporte.

---

## Estado final después del skill

La story queda con toda la cadena de docs completa:

```
docs/works/features/{FT-XX}_<slug>/user-stories/{HU-YY}_<nombre>/
├── {workflow.explore}      (si git history sugirió iteración)
├── {workflow.definition}   (v1.0.0, snapshot)
├── {workflow.proposal}     (si introdujo contrato nuevo)
├── {workflow.scope}        (v1.0.0)
├── {workflow.bdd}          (SC-XXX derivados de tests)
├── {workflow.sdd}          (contratos + errores)
├── {workflow.design}       (tech + layers)
├── {workflow.tdd}          (TC-XXX existentes, todos [x])
├── {workflow.plan}         (task-XXX inferidas, todas [x])
├── {workflow.checkwork}    (v0.1.0, living, 100% cerrado)
└── {workflow.closure}      (firmado)
```

`FT-XX/definition.md` bumpeado con entry `[origen: HU-YY — reverse-engineered]`.

**Próximo paso natural**: revisar los gaps reportados + correr `/fremi-sync-check` para verificar coherencia con el resto del framework.

---

## Reglas activas durante la ejecución

- **R25** — Precondiciones de reverse: trabajo pre-existente, framework instalado, capa identificable.
- **R26** — Frontmatter transparent por default.
- **R27** — Preguntar gaps no-inferibles; nunca inventar.
- **R28** — El output es base, no verdad final.
- **R29** — Regla 8 inconstruible retroactivamente.
- **R30** — Regla 17 con timestamps inferidos + bump de padre al cerrar.
- **R31** — Reverse sólo para trabajo pre-existente.
- **R17** — Frontmatter versionado + ancestor.
- **R16** — Conditionals explore y proposal evaluados.
- **R6** — Cadena BDD → SDD → Design respetada.
- **R3b** — Bifurcaciones inferidas → ADR con `discovered_during_reverse: true`.
- **R12** — Sync-back activo: contenido de capa superior → proponer subir.
- **R24** — Framework instalado.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md) — R25–R32
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Artifact subyacente: [`~/.fremi/framework/artifacts/story/flow.md`](../../artifacts/story/flow.md)
- Flow normal: `/fremi-story` + sub-skills

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del skill reverse-story.
