---
name: fremi-sync-check
description: Audita la sincronía entre capas (product ↔ feature ↔ story) y la coherencia de versionado ancestral (Regla 17). Detecta divergencias transversales (Regla 12), gaps de linaje versión padre/hijo, changelogs incoherentes y bumps de padre faltantes. Usar cuando el usuario quiere validar consistencia, después de cambios grandes, o cuando se sospecha que el producto está desactualizado respecto al trabajo real.
---

# /fremi-sync-check — Auditoría de sincronía + versionado

Audita **dos dimensiones** de consistencia del framework:

1. **Sincronía entre capas** (Regla 12 — sync-back) — conceptos declarados en capa inferior que deberían vivir también en capa superior.
2. **Coherencia de versionado ancestral** (Regla 17) — `ancestor.version_at_creation` y `version_at_closure` válidos; changelogs coherentes con cambios; bumps del padre al firmar snapshots.

## Cuándo invocarlo

- Después de completar una feature/story, **antes** del closure.
- Cuando el usuario sospecha que el producto está desactualizado.
- Tras revisión de PR que toca varias capas.
- Periódicamente para mantener salud del flujo (ej: al inicio de cada feature nueva).
- Cuando aparece la sensación de que algo "ya se discutió pero no está documentado donde tiene que estar".
- Tras un bump manual sospechoso o corrección de frontmatter.

---

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`:
   - `paths.*` (product_dir, features_dir, user_stories_subdir).
   - `identifiers.workflow_doc.items[]` — los **11 docs de story** (FW-00..FW-10) con sus `filename` (no hardcodear).
   - `identifiers.feature.folder_regex`, `identifiers.story.folder_regex`, `identifiers.enabler.folder_regex`, `identifiers.bug.filename_regex`, `identifiers.extra.filename_regex`.
   - `identifiers.adr` (con `locations.{product, feature, story}` — 3 scopes de ADR).
   - `principles.sync_back.rule_ref` (Regla 12), `principles.checkwork_live_status.rule_ref` (Regla 13).

2. Leer `~/.fremi/framework/settings/config.core.yaml` (master):
   - `layers.*` — descubrir qué capas están `active`.
   - `versioning.*` — reglas de bump, frontmatter obligatorio, parent_bump_triggers.

3. Leer cada `~/.fremi/framework/settings/config.<capa>.yaml` referenciado:
   - `config.product.yaml`, `config.feature.yaml`, `config.story.yaml`, `config.enabler.yaml`, `config.bug.story.yaml`, `config.bug.feature.yaml`, `config.extra.yaml`.
   - Extraer `docs[]` / `sections[]`, `conditional_rules`, `flow` — para saber qué se espera en cada capa.

Si algún archivo no parsea → abortar y avisar.

---

### Paso 1 — Cargar snapshot de capas superiores

Leer y extraer:
- `docs/works/product/definition.md` → Restricciones, In-scope, Out-of-scope, Glosario, Criterios de éxito. **Extraer `version` del frontmatter**.
- `docs/works/product/decisions.md` → ADRs globales (`ADR-XXX`). **Extraer `version` y `changelog`**.
- `docs/works/product/iniciativas.md` → init-XXX, hipótesis, MVP, capacidades. **Extraer `version`**.
- `docs/works/product/plan.md` → roadmap de features. **Extraer `version`**.
- `docs/works/product/strategies.md` → estrategia elegida. **Extraer `version`**.
- `docs/works/product/planteamiento.md` → approach. **Extraer `version`**.
- `docs/works/product/ideas.md` → **Extraer `version`**.

---

### Paso 2 — Escanear capas inferiores

Iterar todos los artifacts:

- Cada feature en `docs/works/features/*/`:
  - `feature/definition.md` (living) — versión + changelog.
  - `feature/decisions.md` (si existe, living) — ADRs locales + changelog.
  - (Futuro) `feature/spec.md` (living) — spec agregada.
  - Cada story dentro (`FT-XX/user-stories/HU-YY/`):
    - Los **11 docs** FW-00..FW-10 (o los que existan según condicionales).
    - `HU-YY/bugs/BG-XX_*.md` — bugs scope story.
    - `HU-YY/decisions.md` (living, delta) — ADRs locales a la story.
    - `HU-YY/enablers/*/EN-*.md` — enablers scope story.
  - `FT-XX/bugs/BG-XX_*.md` — bugs scope feature.
  - `FT-XX/enablers/*/EN-*.md` — enablers scope feature.

- `docs/works/enablers/*/EN-*.md` — enablers globales.
- `docs/works/extra/EX-*.md` — extras globales.

Para cada archivo: extraer **frontmatter** (`version`, `doc_type`, `ancestor.*`, `last_updated`) y **changelog** si es living.

---

### Paso 3 — Aplicar heurísticas de detección de divergencia

Los chequeos se dividen en **DOS TIERS** — la separación es dura: NUNCA elevar un hallazgo heurístico a nivel deterministic sin evidencia dura, y NUNCA reportar un hallazgo bajo el umbral de confianza (§3.10).

**TIER 1 — DETERMINISTIC** (siempre confiables — comparación exacta de valores estructurados):
- §3.1 Refs cruzadas inválidas (Tipo I)
- §3.2 Coherencia de versionado ancestral (Tipo V)
- §3.3 Changelogs (Tipo CL)
- §3.4 Bumps del padre al firmar snapshots (Tipo B)

**TIER 2 — HEURISTIC** (dependen de detección de lenguaje — reportan con `confidence` + `evidence`):
- §3.5 Restricciones transversales (Tipo R)
- §3.6 ADRs a promover (Tipo A)
- §3.7 Capacidades sin declarar (Tipo C)
- §3.8 Glosario faltante (Tipo G)
- §3.9 MVP desactualizado (Tipo M)

Un hallazgo heurístico **NO se reporta** si su confianza está debajo del umbral configurado (§3.10 default: 0.75) o si está silenciado en `.fremi/sync-check-mute.yaml` (§3.11).

---

#### 3.1 Refs cruzadas inválidas (Tipo I) — DETERMINISTIC

Chequeo puramente estructural — leer archivos, comparar IDs, reportar si falta:
- Stories que referencian un `init-XXX` que no existe en `product/iniciativas.md`.
- Stories/features que referencian un `ADR-XXX` que no existe en los 3 scopes (`product/decisions.md`, `FT-XX/decisions.md`, `HU-YY/decisions.md`).
- Features sin entrada en `product/plan.md`.
- ADRs que referencian docs ya archivados/borrados.

Confianza: **1.0** por definición — es comparación de IDs contra el filesystem.

#### 3.2 Coherencia de versionado ancestral (Tipo V) — DETERMINISTIC

Sobre `frontmatter.version` y `frontmatter.ancestor.*`:
- **V-1**: `ancestor.version_at_creation` no aparece jamás en el changelog del padre → linaje inexistente.
- **V-2**: `ancestor.version_at_closure < version_at_creation` → linaje temporal imposible.
- **V-3**: snapshot cerrado con `ancestor.version_at_closure: null` → viola Regla 17.
- **V-4**: doc `living` sin sección `## Changelog`.
- **V-5**: `frontmatter.last_updated` anterior a la fecha del último entry del changelog.

Confianza: **1.0** por definición — comparación de números y fechas.

#### 3.3 Changelogs (Tipo CL) — DETERMINISTIC

Parseo estructurado del bloque `## Changelog` al pie de cada doc living:
- **CL-1**: `frontmatter.version` ≠ versión de la última entry del changelog.
- **CL-2**: entry sin sufijo `[origen: <skill-invocado | artifact-hijo>]` reconocible.
- **CL-3**: gap de versión (v1.0 → v1.2 sin v1.1 registrada).

Confianza: **1.0**.

#### 3.4 Bumps del padre al firmar snapshots (Tipo B) — DETERMINISTIC

Para cada snapshot cerrado, cruzar contra `config.core.yaml → versioning.parent_bump_triggers.<evento>`:
- Story cerrada → `feature/definition.md`, `feature/spec.md` (si existe), `feature/decisions.md` (si hay ADR local) — cada uno debió bumpear MINOR/MAJOR según qué agregó/modificó.
- Feature cerrada → `product/plan.md` (mark completed) + `product/definition.md` (patch/minor/major según impacto).
- Enabler cerrado → padre según scope (global/feature/story).
- Bug cerrado → padre (story o feature).

Reportar **Tipo B** si `snapshot.ancestor.version_at_closure ≠ parent.version` en el momento del cierre.

Confianza: **1.0**.

---

#### 3.5 Restricciones transversales (Tipo R) — HEURISTIC

**Regla dura antes de reportar** — TODAS estas condiciones se cumplen:
1. La frase aparece en una sección explícitamente marcada como restricción/constraint (título `## Restrictions`, `## Restricciones`, `## Constraints`, o bullet dentro de esas secciones). **No** grepear prose libre.
2. La misma restricción (por hash normalizado — lowercase, sin puntuación) aparece en **≥ 2 docs distintos** bajo capas diferentes (story + feature, o 2 features distintas).
3. La restricción **no** aparece ya listada en `product/definition.md → ## Restrictions`.
4. La restricción **no** está en el mute file (§3.11).

**Confianza** — asignar según señales:
- 3 o más docs distintos + sección marcada + sin mute → **0.9**.
- 2 docs + sección marcada + sin mute → **0.75** (umbral mínimo).
- 1 doc o grep en prose libre → **NO reportar**.

Cada hallazgo debe incluir en el reporte:
- `evidence.docs` — lista de paths + line numbers donde aparece.
- `evidence.normalized_phrase` — la restricción normalizada.
- `suggested_action` — texto exacto a agregar a `product/definition.md`.
- `mute_key` — hash para agregar al mute file si es falso positivo.

#### 3.6 ADRs a promover (Tipo A) — HEURISTIC

**Regla dura** — TODAS se cumplen:
1. El ADR ya está aceptado (`## Estado: Aceptada`).
2. El texto del ADR menciona **explícitamente** stack global / runtime / librería general / contrato de API compartido / formato de datos común. Chequear contra un vocabulario mínimo declarado en `~/.fremi/framework/settings/config.core.yaml → sync_check.global_scope_terms` (default: `["stack", "runtime", "librería base", "database", "queue", "framework de testing", "auth", "formato de payload"]`).
3. Uso del ADR (búsqueda de `ADR-XXX` en otros docs) demuestra impacto en **≥ 2 features distintas**.
4. No hay ADR global equivalente ya registrado en `product/decisions.md`.
5. No está en el mute file.

**Confianza:**
- 3+ features impactadas + vocabulario global claro → **0.9**.
- 2 features + vocabulario global → **0.75** (umbral).
- Solo 1 feature o vocabulario ambiguo → **NO reportar**.

Cada hallazgo incluye:
- `evidence.impacted_features` — lista de features donde se referencia.
- `evidence.global_terms_matched` — qué términos del vocabulario global aparecieron.
- `suggested_action` — comando exacto: `/fremi-product-adr` con el título propuesto.

#### 3.7 Capacidades sin declarar (Tipo C) — HEURISTIC

**Regla dura**:
1. La capacidad se declara con un identificador **explícito** (bullet con nombre) en al menos una story/feature — no una mención al pasar.
2. El **mismo identificador** aparece en ≥ 2 features distintas.
3. El identificador **no** aparece en `product/definition.md → ## In-scope` ni en `iniciativas.md → Capacidades` (comparación case-insensitive, tolerando plural).
4. No está en mute file.

**Confianza:**
- 3+ features + identificador exacto → **0.9**.
- 2 features + identificador exacto → **0.75** (umbral).
- Match difuso (paráfrasis, sinónimos) → **NO reportar** (demasiado ruidoso).

#### 3.8 Glosario faltante (Tipo G) — HEURISTIC

**Regla dura** (más estricta que antes — antes decía "≥ 2 docs", ahora ≥ 3):
1. Término técnico (sustantivo compuesto o acrónimo mayúscula) que aparece en **≥ 3 docs distintos** bajo capas diferentes.
2. El término **no** está en `product/definition.md → ## Glosario` (case-insensitive).
3. El término **no** está en la lista de "términos comunes del lenguaje" declarada en config (`sync_check.common_vocabulary_ignore`) — palabras como "API", "backend", "response", que no ameritan glosario.
4. No está en mute file.

**Confianza:**
- ≥ 4 docs + término técnico claro → **0.85**.
- 3 docs → **0.75** (umbral).
- 2 docs → **NO reportar**.

Este es el tipo con más falsos positivos históricos — el umbral se subió a 3 docs y se agregó `common_vocabulary_ignore` explícitamente para bajar el ruido.

#### 3.9 MVP desactualizado (Tipo M) — HEURISTIC

**Regla dura**:
1. `product/iniciativas.md` tiene una sección `## MVP` con bullets identificados (no prose libre).
2. Para cada bullet del MVP:
   - Buscar features/stories que lo implementen (por texto del bullet o por link explícito `→ FT-XX`).
   - Si no se encuentra ninguna → **M-gap** (MVP declara capacidad sin feature).
3. Para cada feature marcada `completed`:
   - Buscar si su capacidad está en el MVP.
   - Si NO está → **M-drift** (implementado algo no-MVP).

**Confianza:**
- Bullets con links explícitos rotos → **0.95** (casi deterministic).
- Match por texto sin link → **0.75** (umbral).
- Match ambiguo → **NO reportar**.

#### 3.10 Umbral de confianza global

Config `~/.fremi/framework/settings/config.core.yaml → sync_check.confidence_threshold` (default: **0.75**).

Cualquier hallazgo heurístico con `confidence < threshold` → **NO se incluye** en el reporte principal. Se guarda en un log secundario opcional (`.fremi/sync-check-debug.log`) sólo si el usuario pasó `--debug` al invocar el skill. Sin `--debug`, se descartan silenciosamente.

Overridable por invocación: `/fremi-sync-check --min-confidence 0.9` para ser aún más estricto.

#### 3.11 Mute file — silenciar falsos positivos conocidos

Ubicación: `.fremi/sync-check-mute.yaml` (per-project). Formato:

```yaml
schema: fremi-sync-check-mute
schema_version: 1

# Silenciar hallazgos individuales por su mute_key (hash reportado
# por el skill). El skill lo respeta sin preguntar.
muted_findings:
  - key: R-a1b2c3d4
    reason: "La restricción es intencionalmente local — no aplica al producto entero."
    muted_by: fhidalgo
    muted_at: 2026-08-07

# Silenciar tipos de hallazgo por término específico.
muted_terms:
  glossary:
    - "SDD"          # ya está en el ADR-014, no necesita glosario
    - "TDD"
  capabilities:
    - "webhook-delivery"   # capacidad interna, no del in-scope público

# Silenciar tipos de hallazgo por área.
muted_scopes:
  - path: docs/works/features/FT-05_experimental/**
    types: [R, C, G]
    reason: "Feature experimental — no aplican reglas de sync-back."
```

**Regla dura**: antes de reportar CUALQUIER hallazgo heurístico (Tier 2), el skill DEBE:
1. Buscar el `mute_key` en `muted_findings`. Si está → silenciar sin reportar.
2. Buscar el término normalizado en `muted_terms.<tipo>`. Si está → silenciar.
3. Verificar si el path del artifact matchea algún `muted_scopes` para ese tipo. Si sí → silenciar.

Los hallazgos silenciados se cuentan en el reporte final (línea `Silenced by mute file: N`) para que el usuario sepa que existen, sin ruido.

Si no existe `.fremi/sync-check-mute.yaml`, el skill NO lo crea automáticamente — solo lo lee si está presente. Para crearlo por primera vez, el usuario copia el template de `~/.fremi/framework/skills/sync-check/references/sync-check-mute.template.yaml`.

---

### Paso 4 — Reportar

**Regla dura del reporte**: los hallazgos deterministic (Tier 1) van SIEMPRE. Los heurísticos (Tier 2) van con `confidence` visible y `evidence` completa. Un hallazgo heurístico sin `evidence` explícita es un bug del skill — no se reporta.

Formato:

```markdown
## sync-check — Auditoría de sincronía + versionado

### Estado general
🟢 Sincronizado             (sin divergencias significativas)
🟡 Pequeños desajustes      (1-3 gaps menores en R/G, o V-4/V-5)
🔴 Divergencia significativa (cualquier hallazgo Tier 1 en V-1/V-2/V-3/B, o ≥ 4 hallazgos Tier 2 confirmados)

Muted by config: N   (hallazgos silenciados por .fremi/sync-check-mute.yaml)
Suppressed (low confidence): N   (usá --debug para verlos)

---

### 🔒 Tier 1 — Deterministic (confidence 1.0)

#### Tipo I — Refs cruzadas inválidas
- `HU-03/FW-05_sdd-spec.md:42` cita `init-007` que no existe en `product/iniciativas.md`.
- `FT-02/definition.md:15` referencia `ADR-023` que no existe en ningún scope.

#### Tipo V — Versionado ancestral (Regla 17)
- V-1: `HU-04/FW-05_sdd-spec.md` declara `ancestor.version_at_creation: "2.5.0"` pero `FT-01/definition.md` nunca tuvo v2.5.0 (máximo histórico: v2.3.0).
- V-2: `HU-02/FW-10_closure.md` `version_at_closure (v1.0.0) < version_at_creation (v1.5.0)`.
- V-3: `HU-01/FW-10_closure.md` firmado con `version_at_closure: null`.
- V-4: `product/plan.md` es living pero sin `## Changelog`.
- V-5: `FT-03/definition.md` `last_updated: 2026-05-10` pero última entry del changelog es 2026-07-01.

#### Tipo CL — Changelogs
- CL-1: `FT-01/decisions.md` frontmatter `version: 1.4.0` pero última entry del changelog es v1.3.0.
- CL-2: `product/plan.md` v1.2.0 entry sin `[origen: ...]`.
- CL-3: `FT-02/definition.md` salta de v1.0.0 a v1.2.0.

#### Tipo B — Bumps del padre no aplicados
- `HU-04` cerrada con nuevos requirements pero `FT-01/definition.md` no bumpeó MINOR (según `parent_bump_triggers.story_closes`). Padre quedó en v2.1.0 en vez de v2.2.0.

---

### 🔍 Tier 2 — Heuristic (confidence explícita + evidencia)

Cada hallazgo incluye `mute_key` — copiar al mute file para silenciar futuros reportes.

#### Tipo R — Restricciones transversales (Regla 12)
- **confidence: 0.9** — mute_key: `R-a1b2c3d4`
  - Frase: "Toda request debe incluir header X-Trace-ID"
  - Aparece en: `FT-01/HU-02/FW-03_scope.md:12`, `FT-01/HU-05/FW-06_design.md:34`, `FT-03/definition.md:8`
  - Sugerencia: agregar a `product/definition.md → ## Restrictions`

#### Tipo A — ADRs a promover
- **confidence: 0.85** — mute_key: `A-e5f6g7h8`
  - ADR: `FT-01/decisions.md → ADR-004: Uso de Zod para validación de payloads`
  - Global terms matched: `payload`, `framework de testing`
  - Impacted features: `FT-01`, `FT-02`, `FT-04`
  - Sugerencia: `/fremi-product-adr` con título "Zod como validador transversal"

#### Tipo C — Capacidades sin declarar
- (0 hallazgos con confidence ≥ 0.75)

#### Tipo G — Glosario faltante
- **confidence: 0.75** — mute_key: `G-i9j0k1l2`
  - Término: "IdempotencyKey"
  - Aparece en: `FT-01/HU-01/FW-05_sdd-spec.md:20`, `FT-01/HU-02/FW-06_design.md:15`, `FT-02/HU-01/FW-04_bdd-userstories.md:33`
  - Sugerencia: agregar entrada al glosario de `product/definition.md`

#### Tipo M — MVP desactualizado
- (0 hallazgos con confidence ≥ 0.75)

---

### Acciones sugeridas (por severidad)

**CRITICAL** (Tier 1):
1. Corregir V-3: bumpear `FT-01/definition.md` retroactivamente y rellenar `version_at_closure` del closure de HU-01.
2. Corregir B: bumpear `FT-01/definition.md` de v2.1.0 a v2.2.0 y actualizar changelog.
3. Corregir I: resolver `init-007` faltante en `HU-03/FW-05`.

**HIGH** (Tier 2 con confidence ≥ 0.85):
4. Revisar Tipo A: promover ADR-004 de FT-01 a global si confirmás el análisis.
5. Revisar Tipo R (confidence 0.9): agregar restricción "X-Trace-ID" al producto.

**MEDIUM** (Tier 2 con confidence 0.75-0.85):
6. Revisar Tipo G: agregar "IdempotencyKey" al glosario o silenciarlo con `G-i9j0k1l2` en mute file si es intencionalmente interno.
```

---

### Paso 5 — Próximos pasos para el usuario

Reportar:
- Qué docs habría que tocar y con qué skill invocable.
- Si hay cambios "obvios" (ej: agregar al glosario, rellenar `version_at_closure`), ofrecer hacerlos automáticamente con confirmación.
- Si los cambios requieren juicio (ej: promover ADR), dejarlo al usuario decidir.

---

## Sintaxis

```
/fremi-sync-check [--min-confidence N] [--debug]
```

- `--min-confidence N` (0.0–1.0, default 0.75) — sube el umbral de confianza. Con 0.9 solo hallazgos casi-seguros.
- `--debug` — incluye hallazgos abajo del umbral en un log separado (`.fremi/sync-check-debug.log`). Útil para calibrar el mute file y ver qué se está descartando.

## Prioridad de gravedad

Deterministic (Tier 1) va SIEMPRE a la severidad del tipo. Heuristic (Tier 2) NUNCA sube arriba de HIGH (por definición — es señal, no certeza).

| Prioridad | Tipos | Tier | Motivo |
|---|---|---|---|
| **CRITICAL** | V-1, V-2, V-3, B | 1 | Regla 17 violada — linaje ancestral roto |
| **HIGH** | I | 1 | Integridad referencial rota (deterministic) |
| **HIGH** | A, M | 2 (≥ 0.85) | Regla 12 violada con alta confianza |
| **MEDIUM** | CL-1, CL-2, V-5 | 1 | Metadata inconsistente |
| **MEDIUM** | R, C, G, A, M | 2 (0.75–0.85) | Sugerencia heurística — revisá |
| **LOW** | CL-3, V-4 | 1 | Higiene documental |

Nota: **ningún hallazgo Tier 2 llega a CRITICAL**, aunque tenga confianza 1.0 — el diseño reserva CRITICAL para reglas duras que no requieren juicio.

---

## Limitaciones (honestas)

### Tier 1 — Deterministic
- **Regla 17 depende del frontmatter**: si un doc no tiene frontmatter versionado (pre-Regla 17), el skill lo reporta como V-4 y sugiere migración.
- Nada más — si el frontmatter parsea y las refs cruzadas están íntegras, Tier 1 es confiable.

### Tier 2 — Heuristic
- **Requiere estructura**: si los docs mezclan restricciones en prose libre sin sección `## Restrictions`, Tipo R no las detecta (por diseño — antes daba falsos positivos por grep).
- **No reemplaza juicio humano**: el flag es "revisá esto"; el humano decide si promover, silenciar o descartar.
- **No verifica semántica profunda**: dos features usando el mismo término con sentidos distintos → no detectable a nivel léxico.
- **Confianza es señal, no certeza**: 0.9 significa "muy probable", no "confirmado".

### Estrategias para bajar falsos positivos aún más

1. **Estructurar los docs** — poner restricciones bajo `## Restrictions`, capacidades bajo `## Capabilities`, glosario bajo `## Glosario`. El skill sólo mira ahí.
2. **Mantener el mute file** — la primera vez que aparece un falso positivo válido (ej: término interno del proyecto), copiar el `mute_key` al `.fremi/sync-check-mute.yaml` con la razón. Nunca más volvés a verlo.
3. **Subir el `confidence_threshold`** — para runs pre-release o CI, `--min-confidence 0.9` deja solo los hallazgos casi-seguros.
4. **Correr en modo `--debug`** cuando querés ver todo (incluyendo los que quedaron abajo del umbral) — útil una vez cada tanto para calibrar.

---

## Referencias

- Regla 12 (sync-back) en `~/.fremi/framework/rules/workflow.md`.
- Regla 17 (versionado + linaje) en `~/.fremi/framework/rules/workflow.md`.
- `~/.fremi/framework/settings/config.core.yaml` — master (versioning + phase_rules).
- `~/.fremi/framework/settings/config.<capa>.yaml` — 7 archivos per-capa.
- `~/.fremi/framework/settings/methodology.core.yaml` — nomenclatura y ubicaciones.
