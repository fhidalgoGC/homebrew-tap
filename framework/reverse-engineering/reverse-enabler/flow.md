---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-enabler
  version_at_creation: null
---

# Flujo — Skill REVERSE-ENABLER (`/fremi-reverse-enabler`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de reconstrucción.
> **Invocación / documentación:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — las 6 fases genéricas. Este skill las instancia para la capa enabler.

Este documento describe la **narrativa del flujo** que el skill atraviesa cuando corre. Complementa `SKILL.md` (invocación, sintaxis) y `workflow.yaml` (secuencia machine-readable).

---

## Qué hace el skill

Reconstruye los **4 docs del enabler** (`EN-01_definition.md`, `EN-02_design.md`, `EN-03_plan.md`, `EN-04_closure.md`) a partir de infraestructura o fundación técnica **ya montada y funcionando** que no siguió el flow forward del enabler.

**Fuentes típicas que escanea:**
- IaC declarativo: `serverless.yml`, CDK stacks, Terraform, `Dockerfile`.
- Scripts de setup / seed / deploy bajo `scripts/`.
- Dependencies instaladas (`package.json`, `pyproject.toml`).
- Wrappers y adapters bajo `src/lib/`.
- Git history del setup (commits, mensajes, diffs).
- Docs sueltos de provisioning / READMEs.

**Termina con los 4 docs firmados, el padre bumpeado y un reporte de gaps.** No modifica el código ni el IaC.

---

## Scope del enabler

Un enabler puede vivir en 3 contextos, y el scope determina la ubicación de los docs y qué padre se bumpea:

| Scope | Ubicación | Padre bumpeado |
|---|---|---|
| `global` | `docs/works/enablers/EN-XX_<nombre>/` | `product/plan.md` → MINOR |
| `feature` | `docs/works/features/FT-XX/enablers/EN-XX_<nombre>/` | `FT-XX/definition.md` → MINOR |
| `story` | `docs/works/features/FT-XX/user-stories/HU-YY/enablers/EN-XX_<nombre>/` | `{workflow.definition}` → PATCH |

Si el scope no está claro, el skill **pausa y pregunta** antes de arrancar (stop event `scope_ambiguous`).

---

## Arco narrativo

### 1. Descubrimiento — qué artifacts existen

El skill arranca escaneando todos los artifacts sobrevivientes del enabler. El objetivo de esta fase no es producir un doc, sino construir el **mapa de evidencia** que las fases posteriores consumen.

Escanea en este orden de prioridad:
1. **IaC y config** (`serverless.yml`, CDK, Terraform, `Dockerfile`, CI/CD workflows) → identificar recursos declarados (Lambda layers, DBs, buckets, IAM, queues).
2. **Scripts** (`scripts/setup`, `scripts/seed`, `scripts/deploy`) → identificar los pasos de montado.
3. **Dependencies** (`package.json` / `pyproject.toml`) → las libs específicas del enabler.
4. **Wrappers / adapters** (`src/lib/`) → firmas de las APIs internas que expone el enabler.
5. **Git history** del folder del IaC → commits con contexto del setup inicial.

Si no hay ningún artifact identificable → el skill aborta con mensaje claro. No se puede reconstruir de nada.

### 2. Inferencia — mapear artifacts a docs

Con el mapa de evidencia, el skill infiere el contenido de los 4 docs:

| Fragmento encontrado | Doc reconstruido |
|---|---|
| Recursos IaC (Lambda layer, DB, bucket, queue, IAM) | EN-01 → qué habilita + criterios verificables |
| Libs específicas en `package.json` | EN-02 → tecnologías usadas |
| Paths de archivos de IaC | EN-02 → estructura de infra |
| Firmas TS de wrappers en `src/lib/` | EN-02 → firmas de API interna |
| Commits del setup (uno por cambio significativo) | EN-03 → tasks T-XXX con `[x]` |
| Comandos en scripts de setup/seed | EN-03 → criterios verificables por task |
| Features/stories que usan los recursos | EN-01 → vinculaciones |
| Último commit del setup | EN-04 → sign-off date |

**Regla de oro de la inferencia**: el IaC muestra el estado final, no las alternativas consideradas. Cuando el diff histórico sugiere que hubo bifurcaciones técnicas (ej: dos approachs de IaC en commits distintos), se marca para generar ADR retroactivo (Regla 3b) — no se silencia.

### 3. Preguntas dirigidas — gaps no inferibles (Regla 27)

Reverse **infiere del código y pregunta al usuario**. Nunca inventa. Los gaps típicos del enabler que requieren pregunta:

- **¿Qué capacidad habilita exactamente?** Si el IaC declara una Lambda layer pero el scope de la capacidad (ej: "generar PDFs", "procesar imágenes") no está en los commits ni en el README → pregunta obligatoria.
- **¿Qué features/stories dependen de esta capacidad?** El skill detecta candidatos (archivos que referencian los recursos del enabler) pero necesita confirmación humana antes de escribirlos en EN-01.
- **Motivación de decisiones técnicas (ADRs retroactivos)** — si aparecen 2+ approaches posibles en el history, el skill pausa y pide el rationale. No inventa el "por qué se eligió X".
- **RNFs medibles** — latencia de cold-start, capacidad de throughput, límites de tamaño — no derivables del IaC en general.

Los pipelines interactive pausan en cada gap; los automáticos acumulan las preguntas y las hacen todas al terminar la fase.

### 4. Timestamps y linaje (Regla 30)

El skill infiere fechas via `git log` para construir el frontmatter versionado (Regla 17):

```bash
# Fecha de creación del archivo IaC principal
git log --diff-filter=A --follow --format="%ai" -- <iac-file> | tail -1

# Fecha del último cambio significativo
git log -1 --format="%ai" -- <iac-file>

# Versión del padre en la fecha del setup (según scope)
git blame -- <archivo-padre> | grep "^version:"
```

**Si no hay `.git`**: el skill pausa, pide las fechas al usuario manualmente, o setea todo a "hoy" con `reverse_engineered_confidence: 0.3` como señal fuerte de baja confianza.

El `ancestor.version_at_creation` se resuelve según scope: la versión de `product/plan.md` (global), `FT-XX/definition.md` (feature) o `{workflow.definition}` (story) al momento inferido del setup.

### 5. Escritura de los 4 docs (Regla 26)

Con toda la información recopilada, el skill escribe los 4 docs usando los templates canónicos del artifact enabler.

**Modo `--transparent` (default, R26):** el frontmatter incluye el bloque de trazabilidad:

```yaml
reverse_engineered: true
reverse_engineered_at: 2026-08-11
reverse_engineered_source: git-history+iac+scripts
reverse_engineered_confidence: 0.85
```

**Modo `--stealth` (override explícito):** el bloque se omite y los docs quedan indistinguibles del flow forward. Cambiar el default a stealth a nivel proyecto requiere ADR (Regla 26).

**ADRs retroactivos**: si durante la inferencia se detectaron bifurcaciones técnicas sin ADR, el skill genera el ADR en el scope correcto (Regla R3b, R20) marcado con `discovered_during_reverse: true`.

Todos los docs se crean como `v1.0.0` snapshot.

### 6. Bump del padre (Regla 17 + R30)

Al completar EN-04_closure, el skill aplica `parent_bump_triggers` exactamente como lo haría el flow forward:

- **Global**: `product/plan.md` → MINOR bump.
- **Feature**: `FT-XX/definition.md` → MINOR bump.
- **Story**: `{workflow.definition}` → PATCH bump.

Reverse no exime del bump de padres.

---

## Stop events — dónde pausa el skill

Ver `workflow.yaml → stop_events` para el detalle machine-readable. Resumen narrativo:

1. **`scope_ambiguous`** — el enabler no encaja claramente en global / feature / story. Pausa antes de arrancar.
2. **`enabler_numbering_conflict`** — existe ya un EN-XX similar. Confirmar si actualizar o crear nuevo.
3. **`linkages_unclear`** — las features/stories vinculadas no están claras. Presentar candidatos y confirmar.
4. **`retroactive_adr_bifurcation`** — bifurcaciones técnicas históricas sin ADR. Pedir rationale al usuario.
5. **`git_history_missing`** — no hay `.git` o commits identificables. Pedir fechas manualmente.
6. **`low_confidence`** — inferencia < 0.5 en secciones críticas. Reportar al usuario antes de firmar EN-04.
7. **`criteria_not_verifiable`** — criterios técnicos del EN-01 sin comandos concretos de verificación.

**Anti-patrones — el skill NO debe pausar por esto:**
- Confirmar wording de cada sección de los docs (genera texto, no valida por párrafo).
- Preguntar cuántos commits registrar como tasks (los registra todos y lo reporta).
- Solicitar aprobación entre cada doc (escribe los 4 en secuencia, luego reporta).

---

## Reporte final (obligatorio)

Al terminar exitosamente, el skill reporta:

```
▶ Enabler reconstruido: EN-XX_<nombre>
▶ Scope: global | feature | story
▶ Ubicación: <path completo>

▶ Docs creados:
  - EN-01_definition.md  v1.0.0  ancestor: <scope-parent>@vA.B.C
  - EN-02_design.md      v1.0.0  ancestor: <scope-parent>@vA.B.C
  - EN-03_plan.md        v1.0.0  ancestor: <scope-parent>@vA.B.C
  - EN-04_closure.md     v1.0.0  ancestor: <scope-parent>@vA.B.C

▶ Confidence global: 0.XX

▶ Gaps declarados (R27):
  ⚠ <gap 1> — [no resuelto / resuelto por usuario]
  ⚠ <gap 2> — ...

▶ ADRs retroactivos generados:
  - ADR-XXX: <decisión> (scope: <global|feature|story>, discovered_during_reverse: true)

▶ Padre bumpeado: <path> vA.B.C → vA.B.D

▶ Modo: transparent (default) | stealth (override explícito)

▶ Revisión humana recomendada (R28):
  · EN-02 design: bifurcaciones históricas — validar ADRs generados.
  · EN-03 tasks: criterios verificables — ejecutar comandos para confirmar.
  · EN-01 vinculaciones: inferidas de archivos — confirmar dependencias reales.
```

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- `methodology.core.yaml` + `config.enabler.yaml` existen y parsean.
- **R25** — El enabler (IaC/scripts/deps) está mergeado o en producción. No aplica a trabajo en curso.
- Scope identificable o declarable por el usuario.
- Existen artifacts del enabler (IaC, scripts, o commits) para reconstruir.

Si falla cualquiera → abortar con mensaje claro. No auto-instalar el framework.

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: trabajo mergeado/producción.
- **R26** — Default transparent: trazabilidad histórica visible.
- **R27** — Preguntas dirigidas para gaps no inferibles.
- **R28** — Reverse produce base, no verdad final.
- **R30** — R17 (versionado) aplica con timestamps inferidos; bump igual al flow forward.
- **R31** — No se usa para enablers en curso → usar flow forward.
- **R32** — Ratio reverse/forward como señal de salud.
- **R17** — Frontmatter versionado + ancestor por scope.
- **R15** — Enabler es artefacto opcional; verificar criterio de activación.
- **R3b** — Bifurcaciones históricas → ADR retroactivo marcado como tal.
- **R24** — Framework instalado.

---

## Estado final después del skill

El enabler queda reconstruido con los 4 docs firmados:

```
docs/works/<scope>/EN-XX_<nombre>/
├── EN-01_definition.md    (v1.0.0, snapshot — qué habilita + criterios)
├── EN-02_design.md        (v1.0.0, snapshot — tech + estructura + ADRs)
├── EN-03_plan.md          (v1.0.0, snapshot — tasks [x] + criterios verificables)
└── EN-04_closure.md       (v1.0.0, snapshot — signed-off)
```

El repo queda **indistinguible del que dejaría el flow forward** en términos de completitud de artifacts, excepto por el bloque `reverse_engineered.*` en el frontmatter (en modo `transparent`).

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- Reglas reverse (R25-R32): [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md)
- Flujo canónico reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Artifact enabler forward: [`~/.fremi/framework/artifacts/enabler/SKILL.md`](../../artifacts/enabler/SKILL.md)
- Config reverse global: [`~/.fremi/framework/settings/config.reverse.core.yaml`](../../settings/config.reverse.core.yaml)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: flujo narrativo del skill reverse-enabler.
