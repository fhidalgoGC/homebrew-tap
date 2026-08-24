---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-reverse-enabler
  version_at_creation: null
---

# Flujo — Pipeline REVERSE-ENABLER (`/fremi-pipeline-reverse-enabler`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Skill subyacente:** [`~/.fremi/framework/reverse-engineering/reverse-enabler/SKILL.md`](../../reverse-engineering/reverse-enabler/SKILL.md) — lógica de inferencia de los 4 docs del enabler.
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md).

Este documento describe la **narrativa del flujo** que el pipeline atraviesa cuando corre.

---

## Qué hace el pipeline

Reconstruye en modo **automático** los 4 docs canónicos de un enabler cuya infraestructura o tooling ya está en producción:

- `EN-01_definition.md` — qué habilita + vinculaciones con features/stories + criterios técnicos.
- `EN-02_design.md` — decisiones técnicas + ADRs retroactivos + estructura IaC.
- `EN-03_plan.md` — tasks-T-XXX inferidas de commits (todas marcadas `[x]`).
- `EN-04_closure.md` — sign-off + qué quedó habilitado + evidencia verificable.

Scope configurable: `global` (default), `feature`, o `story`.

**Termina con el enabler completamente formalizado en el framework.** No ejecuta ni modifica infra.

---

## Cuándo usarlo

| Situación | Acción |
|---|---|
| IaC montado (serverless.yml, CDK, terraform) sin doc formal | `/fremi-pipeline-reverse-enabler <nombre>` |
| Package/library instalado como fundación (ej: Chromium layer) sin `EN-XX` | `--scope global` |
| CI/CD pipeline armado sin doc | `/fremi-pipeline-reverse-enabler ci-cd-pipeline` |
| Migración de infra completada sin registrar (ej: Node 20 → Node 24) | `--from-git-history` |
| Enabler dentro de una feature específica | `--scope feature FT-XX` |

**NO usar** para infra nueva que aún está siendo montada — usar el flow forward de enabler (`/fremi-enabler`).

---

## Alcance del pipeline

| # | Fase (id) | Qué hace | Produce |
|---|---|---|---|
| −1 | `verify_preconditions` (preflight) | Verifica R25 + R24 + artifacts identificables | — (aborta si falla) |
| −2 | `resolve_scope_and_parent` (preflight) | Determina scope + path destino + EN-XX libre | — |
| −3 | `identify_iac_artifacts` (preflight) | Confirma existencia de al menos 1 artifact del enabler | — (aborta si falla) |
| 0 | `identify` | Escanea IaC + deps + scripts + git log | Inventario en memoria |
| 1 | `scan` | Mapea artifacts → 4 docs del enabler | Mapeos en memoria |
| 2 | `evaluate` | Preguntas dirigidas (R27): scope, vinculaciones, rationale ADRs | Respuestas / TBDs |
| 3 | `reconstruct` | Escribe los 4 docs EN-01..EN-04 con timestamps inferidos (R26, R30) | EN-01..EN-04 |
| 4 | `report_gaps` | Declara gaps al usuario (R28) | Reporte de warnings |
| 5 | `close_lineage` | Bumpea padre según scope (R17) | Versión bumpeada |

---

## Arco narrativo

### 1. Preflight — verificar antes de tocar archivos

Antes de cualquier escaneo, el pipeline verifica:

- Framework instalado (Regla 24).
- La infra/tooling está en producción o mergeada a main — no experimental (Regla 25).
- Al menos un artifact del enabler es identificable (IaC file, package, layer, script, workflow).
- El padre existe si scope != global.
- La carpeta `EN-XX_<nombre>/` **no** existe ya con docs reales.
- El próximo `EN-XX` global está calculado (busca en todos los scopes del proyecto).

Si falla cualquier check → pipeline aborta antes de tocar ningún archivo.

### 2. Descubrimiento — inventario del enabler

La fase `identify` escanea:

```
IaC:           serverless.yml, CDK, terraform, Dockerfile, .github/workflows/*
               → recursos declarados (Lambda layers, DBs, buckets, IAM)
Dependencies:  package.json / pyproject.toml — libs específicas del enabler
Scripts:       scripts/ — comandos de setup, seed, deploy
Git:           commits del setup inicial del enabler (con --from-git-history)
Docs:          README de setup, docs de provisioning sueltos
```

Resultado: inventario completo en memoria que alimenta la inferencia.

### 3. Inferencia — mapear artifacts a los 4 docs

La fase `scan` produce los mapeos concretos:

| Artifact escaneado | Doc que alimenta |
|---|---|
| Recursos IaC declarados (layers, DBs, buckets) | `EN-01` — qué capacidad habilita |
| Libs de `package.json` / deps específicas | `EN-02` — tecnologías usadas |
| Estructura de archivos IaC + paths | `EN-02` — estructura del enabler |
| Wrappers TS en `src/lib/` | `EN-02` — firmas de uso expuesto |
| Commits git del setup | `EN-03` — tasks-T-XXX (todos `[x]`) |
| IaC diff + instalación de packages | `EN-04` — evidencia del enabler montado |

**Nota crítica sobre diseño:** el IaC describe el estado final, no las alternativas consideradas. Si hay evidencia de comparación real en commits (ej: un PR que descarta CDK y elige Serverless Framework) → mencionar en `EN-02`. Si no hay evidencia → no inventar comparación.

### 4. Preguntas dirigidas — gaps no-inferibles (Regla 27)

La fase `evaluate` pregunta al usuario lo que el IaC no puede revelar:

1. **Scope del enabler** — si afecta varias features, ¿es global o feature-específico? Recomendación: cuando hay duda, `global`.
2. **Vinculaciones** — qué features/stories habilita este enabler. Validar con el usuario — no inferir "porque parece".
3. **Motivación de ADRs** — el IaC muestra la decisión implementada, no el porqué. Preguntar rationale o marcar TBD.
4. **Numeración EN-XX** — confirmar el próximo número libre en el proyecto (evitar conflictos si se descubren varios enablers a la vez).
5. **Origen de bug de infra** — si el enabler nació como fix de un incidente, marcar Regla 29.

En modo `interactive`: pregunta cada gap apenas lo detecta.
En modo `auto`: acumula todos los gaps y los pregunta juntos al final de la fase.

### 5. Reconstrucción — escribir los 4 docs

La fase `reconstruct` escribe los 4 docs en orden:

**`EN-01_definition.md`** — qué habilita el enabler:
- Capacidad técnica habilitada (de IaC + libs + descripción del usuario).
- Vinculaciones a features/stories (validadas en `evaluate`).
- Criterios técnicos verificables (comandos CLI que confirman estado — ej: `aws lambda get-layer-version`).

**`EN-02_design.md`** — cómo está implementado:
- Tecnologías + librerías del IaC y `package.json`.
- Estructura: paths de archivos de infra.
- Firmas TS de wrappers si hay en `src/lib/`.
- ADRs retroactivos (si hay bifurcaciones evidentes) marcados `discovered_during_reverse: true`.

**`EN-03_plan.md`** — tareas del setup:
- Tasks-T-XXX inferidas de commits git, una por commit significativo.
- Todas marcadas `[x]` — el enabler ya está montado.
- Criterios verificables: comandos CLI que comprueban cada tarea (ej: `psql <db> -c "select 1"`).

**`EN-04_closure.md`** — cierre:
- Qué quedó habilitado (de EN-01).
- Features/stories desbloqueadas.
- Evidencia: PR/commits del setup + comandos con exit 0.
- Sign-off: fecha del último commit del setup (con `--from-git-history`) o fecha actual.

**Modo `--transparent`** (default, Regla 26): cada doc incluye:

```yaml
reverse_engineered: true
reverse_engineered_at: YYYY-MM-DD
reverse_engineered_source: iac-files+git-log+package-json
reverse_engineered_confidence: 0.82
```

**Modo `--stealth`** (override explícito): los docs quedan indistinguibles del flow forward. Requiere confirmación explícita y ADR de justificación.

### 6. Reporte de gaps y cierre de linaje

Al terminar la escritura:

- `report_gaps` declara vinculaciones pendientes de validar, ADRs con rationale TBD, y áreas para revisión humana (Regla 28).
- `close_lineage` bumpea el padre según scope (Regla 17):
  - `global` → bumpea `product/plan.md` MINOR.
  - `feature` → bumpea `FT-XX/definition.md`.
  - `story` → bumpea el `{workflow.definition}` de la story PATCH.

### 7. Stop events — dónde pausa el pipeline

El pipeline pausa (no aborta) ante 9 condiciones — ver `workflow.yaml → stop_events`:

1. **`scope_ambiguous`** — el enabler afecta varias features y no está claro el scope correcto.
2. **`en_number_conflict`** — múltiples enablers descubiertos sin numeración asignada → serializar.
3. **`linked_features_not_clear`** — vinculaciones con features/stories no identificables del IaC.
4. **`adr_retroactive_inferred`** — bifurcación técnica evidente → ADR retroactivo (Regla 3b).
5. **`enabler_from_bug_fix`** — enabler nació de un bug de infra → marcar Regla 29.
6. **`iac_only_describes_final_state`** — advertencia: `EN-02` puede estar incompleto sin git history.
7. **`git_history_absent`** — `--from-git-history` pedido pero sin commits identificables.
8. **`low_confidence`** — score cae bajo el umbral; docs marcados `needs_review: true`.
9. **`stealth_without_adr`** — `--stealth` sin ADR de justificación → confirmar explícitamente.

**Anti-patrones — el pipeline NO debe pausar por esto:**
- Confirmar el nombre de cada task-T-XXX individualmente.
- Pedir feedback tras cada doc completado (en modo `auto`).
- Preguntar si el enabler "debería" tener un ADR cuando no hay bifurcación evidente.

---

## Diferencia con `/fremi-reverse-enabler` manual

| Aspecto | `/fremi-pipeline-reverse-enabler` (auto) | `/fremi-reverse-enabler` manual |
|---|---|---|
| Alcance | Mismo — ambos producen los 4 docs EN-01..EN-04 + bump padre | Igual |
| Orquestación | El pipeline envuelve las 6 fases en modo auto/interactive | El skill es invocación directa |
| Preflight | Explícito — calcula EN-XX, verifica scope y padre antes de arrancar | Hace lo mismo en su Paso 0 |
| Cuándo conviene | Cuando querés el flujo completo con paradas de interactive | Cuando tenés más control manual |

El pipeline y el skill suelto producen el mismo output — el pipeline es la orquestación completa; el skill es la unidad atómica invocable directamente.

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- **R25** — Infra/tooling en producción (no experimental en curso).
- Al menos 1 artifact del enabler identificable.
- Padre existe si scope != global.
- Carpeta `EN-XX_<nombre>/` no existe ya con docs reales.
- `config.reverse.core.yaml → active: true`.

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: infra en producción.
- **R26** — Default `--transparent` — marca de origen reverse en frontmatter.
- **R27** — Gaps no-inferibles → preguntar, nunca inventar.
- **R28** — Reverse no reemplaza revisión humana.
- **R30** — Regla 17 aplica retroactivamente con timestamps inferidos.
- **R31** — Infra en curso → abortar; reverse sólo para trabajo pre-existente.
- **R32** — Ratio reverse/forward reportado.
- **R17** — Bumpear padre al cerrar el enabler (según scope).
- **R15** — Enabler canónico — Regla 25 confirma reverse como vía formal de alineación.
- **R3b** — ADRs retroactivos por decisiones técnicas del enabler.
- **R29** — Si el enabler nació de un bug de infra → marcar test rojo no reconstruible.

---

## Estado final después del pipeline

**Scope global:**
```
docs/works/enablers/{enabler_folder}/
├── EN-01_definition.md   (v1.0.0 snapshot — reverse_engineered:*)
├── EN-02_design.md       (v1.0.0 snapshot — ADRs retroactivos si aplica)
├── EN-03_plan.md         (v1.0.0 snapshot — tasks-T-XXX todas [x])
└── EN-04_closure.md      (v1.0.0 snapshot — FIRMADO)
```

**Scope feature:**
```
docs/works/features/{feature_folder}/enablers/{enabler_folder}/
├── EN-01_definition.md
├── EN-02_design.md
├── EN-03_plan.md
└── EN-04_closure.md
```

**Scope story:**
```
docs/works/features/{feature_folder}/user-stories/{story_folder}/enablers/{enabler_folder}/
├── EN-01_definition.md
├── EN-02_design.md
├── EN-03_plan.md
└── EN-04_closure.md
```

**Próximos pasos naturales:**
1. Revisar el reporte final — especialmente vinculaciones y ADRs retroactivos.
2. Validar que las features/stories listadas como habilitadas realmente dependen del enabler.
3. Correr los criterios verificables del `EN-03_plan.md` para confirmar que la infra funciona.
4. Completar el rationale de ADRs retroactivos si quedaron TBD.
5. Correr `/fremi-sync-check` para verificar coherencia global del framework.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Skill subyacente: [`/fremi-reverse-enabler`](../../reverse-engineering/reverse-enabler/SKILL.md)
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../../reverse-engineering/rules/reverse.md) — Reglas 25–32
- Regla 15 (enabler lifecycle): [`~/.fremi/framework/rules/workflow.md`](../../rules/workflow.md)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del pipeline reverse-enabler.
