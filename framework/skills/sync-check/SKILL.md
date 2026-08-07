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

#### 3.1 Restricciones que no están en producto (Tipo R)

Buscar en `story/FW-03_scope.md`, `story/FW-06_design.md`, `story/FW-04_bdd-userstories.md`, `feature/definition.md`:
- Frases de restricción transversal: "El servicio NO debe...", "El sistema siempre...", "Toda request debe...", "En ningún caso...".
- Comparar contra `product/definition.md` (sección Restricciones globales). Si no aparece → **divergencia tipo R**.

#### 3.2 ADRs que deberían ser globales (Tipo A)

Para cada ADR en `FT-XX/decisions.md` o `HU-YY/decisions.md`:
- ¿La decisión menciona stack, runtime, librerías generales, contratos de API, formato común?
- ¿El ADR impacta ≥ 2 features?
- Si aplica → **divergencia tipo A** (promover a `product/decisions.md` vía `/fremi-product-adr` y marcar el local como "Reemplazado por ADR-XXX").

#### 3.3 Capacidades nuevas mencionadas pero no declaradas (Tipo C)

Buscar en features/stories menciones de capacidades: adapters, formatos, modos de delivery, autenticación, etc.
- Comparar contra `product/definition.md` (In-scope) e `iniciativas.md` (Capacidades).
- Si aparece abajo pero no arriba → **divergencia tipo C**.

#### 3.4 Términos transversales sin glosario (Tipo G)

Identificar términos técnicos que aparecen en ≥ 2 docs y no están en `product/definition.md` (Glosario).
→ **divergencia tipo G**.

#### 3.5 Cambios al MVP no reflejados (Tipo M)

Comparar `product/iniciativas.md` (sección MVP) contra features/stories existentes:
- Capacidad del MVP sin feature/story que la implemente → **gap MVP**.
- Capacidad implementada que el MVP no menciona → **divergencia tipo M**.

#### 3.6 Refs cruzadas inválidas (Tipo I)

- Stories que referencian un `init-XXX` que no existe.
- Stories/features que referencian un `ADR-XXX` que no existe (en ninguno de los 3 scopes).
- Features sin entrada en `product/plan.md`.
- ADRs que referencian docs ya archivados/borrados.

#### 3.7 Coherencia de versionado ancestral (Tipo V — Regla 17)

Para cada artifact con `ancestor.*` en su frontmatter:

- **`ancestor.version_at_creation`** debe ser una versión que EXISTIÓ en el changelog del padre en algún momento. Si el padre nunca tuvo esa versión → **Tipo V-1** (versión ancestral inexistente).
- **`ancestor.version_at_closure`** (para snapshots cerrados) debe ser **≥** `version_at_creation` (el padre no puede estar en una versión "anterior" al momento de cierre). Si es menor → **Tipo V-2** (linaje temporal roto).
- Si un snapshot está **cerrado** (firmado) pero `version_at_closure` es `null` → **Tipo V-3** (closure sin bump del padre — viola Regla 17).
- Si un doc **living** no tiene `changelog` al pie → **Tipo V-4** (living sin changelog).
- Si `last_updated` en frontmatter es anterior a la fecha del último entry del changelog → **Tipo V-5** (metadata desactualizada).

#### 3.8 Changelogs incoherentes con cambios (Tipo CL)

Para cada doc living:
- ¿La versión declarada en frontmatter coincide con la última entry del changelog? Si no → **Tipo CL-1**.
- ¿Cada entry del changelog referencia un `[origen: ...]` válido (skill invocado, artifact hijo)? Si no → **Tipo CL-2**.
- ¿Hay versiones "saltadas" en el changelog (v1.0 → v1.2 sin v1.1)? → **Tipo CL-3** (rastro histórico incompleto).

#### 3.9 Bumps del padre al firmar snapshots (Tipo B — Regla 17)

Para cada snapshot cerrado (con `version_at_closure` rellenado):
- Consultar `config.yaml → versioning.parent_bump_triggers.<evento>` para saber qué padres debían bumpearse.
- Verificar que la versión declarada en `version_at_closure` es EFECTIVAMENTE la versión final del padre (leer frontmatter del padre).
- Si el padre no fue bumpeado o quedó en una versión distinta → **Tipo B**.

**Casos específicos**:
- Story cerrada → `feature/definition.md` (y `feature/spec.md`, `feature/decisions.md` cuando existan) debieron bumpearse según qué agregó/modificó la story.
- Feature cerrada → `product/plan.md` y `product/definition.md`.
- Enabler cerrado → padre según scope.
- Bug cerrado → padre (story o feature según scope del bug).

---

### Paso 4 — Reportar

Formato:

```markdown
## sync-check — Auditoría de sincronía + versionado

### Estado general
🟢 Sincronizado             (sin divergencias significativas)
🟡 Pequeños desajustes      (1-3 gaps menores en R/G, o V-4/V-5)
🔴 Divergencia significativa (≥ 4 gaps, o cualquier V-1/V-2/V-3/B — Regla 17 violada)

### Divergencias de sincronía (Regla 12)

#### Tipo R — Restricciones transversales sin reflejo en producto
- ...

#### Tipo A — ADRs a promover a global
- ...

#### Tipo C — Capacidades referenciadas sin declarar
- ...

#### Tipo G — Términos sin glosario
- ...

#### Tipo M — MVP desactualizado
- ...

#### Tipo I — Refs cruzadas inválidas
- ...

### Divergencias de versionado (Regla 17)

#### Tipo V — Coherencia ancestral
- V-1: `HU-04/FW-05_sdd-spec.md` declara `ancestor.version_at_creation: "2.5.0"` pero `FT-01/definition.md` nunca tuvo v2.5.0 (máximo histórico: v2.3.0).
- V-2: `HU-02/FW-10_closure.md` tiene `version_at_closure < version_at_creation`.
- V-3: `HU-01/FW-10_closure.md` firmado con `version_at_closure: null` — padre no fue bumpeado.
- V-4: `product/plan.md` es living pero no tiene `## Changelog`.
- V-5: `FT-03/definition.md` `last_updated: 2026-05-10` pero última entry del changelog es 2026-07-01.

#### Tipo CL — Changelogs
- CL-1: `FT-01/decisions.md` frontmatter dice `version: 1.4.0` pero última entry del changelog es v1.3.0.
- CL-2: Entry en `product/plan.md` sin `[origen: ...]`.
- CL-3: `FT-02/definition.md` salta de v1.0.0 a v1.2.0 sin registrar v1.1.0.

#### Tipo B — Bumps del padre no aplicados
- B: `HU-04` cerrada con nuevos requirements pero `FT-01/definition.md` no bumpeó MINOR (según `parent_bump_triggers.story_closes`).

### Acciones sugeridas
1. Actualizar `product/definition.md` Restricciones con los N puntos del tipo R.
2. Promover ADR-014 de FT-01 a `product/decisions.md`.
3. Corregir V-3: bumpear `FT-01/definition.md` retroactivamente y rellenar `version_at_closure` del closure de HU-01.
4. ...
```

---

### Paso 5 — Próximos pasos para el usuario

Reportar:
- Qué docs habría que tocar y con qué skill invocable.
- Si hay cambios "obvios" (ej: agregar al glosario, rellenar `version_at_closure`), ofrecer hacerlos automáticamente con confirmación.
- Si los cambios requieren juicio (ej: promover ADR), dejarlo al usuario decidir.

---

## Prioridad de gravedad

| Prioridad | Tipos | Motivo |
|---|---|---|
| **CRITICAL** | V-1, V-2, V-3, B | Regla 17 violada — linaje ancestral roto |
| **HIGH** | A, I, M | Regla 12 violada / integridad referencial rota |
| **MEDIUM** | R, C, CL-1, CL-2, V-5 | Divergencia semántica o metadata inconsistente |
| **LOW** | G, CL-3, V-4 | Higiene documental |

---

## Limitaciones

- **Heurístico, no formal**: depende de detectar patrones de lenguaje y referencias. Puede dar falsos positivos.
- **No reemplaza juicio humano**: no toda restricción local es transversal; el skill flagea, el humano decide.
- **No verifica semántica profunda**: si dos features usan el mismo término con sentidos distintos, esta skill puede no detectarlo.
- **Regla 17 depende del frontmatter**: si un doc no tiene frontmatter versionado (pre-Regla 17), el skill lo reporta como Tipo V-4 y sugiere migración.

Para uso de mayor profundidad: complementar con revisión humana periódica.

---

## Referencias

- Regla 12 (sync-back) en `~/.fremi/framework/rules/workflow.md`.
- Regla 17 (versionado + linaje) en `~/.fremi/framework/rules/workflow.md`.
- `~/.fremi/framework/settings/config.core.yaml` — master (versioning + phase_rules).
- `~/.fremi/framework/settings/config.<capa>.yaml` — 7 archivos per-capa.
- `~/.fremi/framework/settings/methodology.core.yaml` — nomenclatura y ubicaciones.
