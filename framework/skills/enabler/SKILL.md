---
name: fremi-enabler
description: Crea un nuevo enabler (trabajo técnico habilitador, sin comportamiento user-facing) con sus 4 docs en cadena liviana (definition → design → plan → closure). Soporta 3 ubicaciones — global, dentro de feature o dentro de story — según el alcance declarado al crearlo. Lee la nomenclatura desde docs/frmwk/settings/methodology.json. Usar cuando el usuario identifica un trabajo de plataforma/infra/fundación que habilita capacidad futura.
---

# /fremi-enabler — Crear un nuevo enabler

Crea el folder de un enabler con los **4 docs en plantilla** (cadena liviana: definition → design → plan → closure), todos prefijados según `docs/frmwk/settings/methodology.json`.

> **Importante:** este skill NO tiene prefijos hardcoded. Lee `identifiers.enabler`, `identifiers.enabler_doc` y `identifiers.enabler_doc.items[]` del JSON.
>
> **Regla 17 — Living Versioning**: los 4 docs del enabler son **snapshot**. Al crear cada uno, el skill:
> 1. Captura la versión actual del padre (product/plan.md si global; FT-XX/definition.md si feature-scoped; FT-XX/HU-YY/FW-01_definition.md si story-scoped).
> 2. Inyecta el frontmatter con `version: 1.0.0`, `doc_type: snapshot`, `ancestor.id` y `ancestor.version_at_creation`.
> 3. Al firmar `EN-04_closure.md`, verifica bump del padre (según `config.yaml → versioning.parent_bump_triggers.enabler_closes`) y rellena `ancestor.version_at_closure`.

## Sintaxis

```
/fremi-enabler <nombre-descriptivo>                          # global (default)
/fremi-enabler <nombre-descriptivo> --feature <FT-XX>        # dentro de feature
/fremi-enabler <nombre-descriptivo> --story <FT-XX/HU-YY>    # dentro de story
```

- `<nombre-descriptivo>`: texto libre. Se normaliza a kebab-case según `slug.transforms`.
- `--feature <FT-XX>`: ID de feature padre o slug completo. El enabler queda dentro de esa feature.
- `--story <FT-XX/HU-YY>`: feature + story padre. El enabler queda dentro de esa story.

Sin flag → enabler **global** (en `docs/works/enablers/`).

Si falta el nombre descriptivo → preguntárselo al usuario.

## Cuándo invocarlo

- Usuario dice "necesitamos habilitar X", "antes de la feature Y hay que migrar Z", "esto es plataforma, no feature".
- Hay un trabajo técnico identificable que **no entrega valor user-facing por sí solo** pero habilita que otras features/stories puedan existir o cumplir sus contratos.
- **NO invocar automáticamente al crear feature.** Los enablers son opcionales (Regla 15). Sólo si el usuario lo pide explícitamente o si analizando la feature/story se identifica un trabajo claramente habilitador.

## Cuándo NO usar `/fremi-enabler`

| Caso | Skill correcto |
|---|---|
| Endpoint nuevo / capacidad user-facing | `/fremi-feature` o `/fremi-story` |
| Tooling / scripts / refactor sin habilitar nada nuevo | `EX-NN_<slug>.md` en `docs/works/extra/` |
| Defecto en código de producción | `/fremi-story-bug` o `/fremi-feature-bug` dentro de la story afectada |
| Cambio en docs / metodología | `docs/frmwk/` directo (o `EX-NN` si se documenta como work item) |

Si el "enabler" propuesto entrega valor user-facing → en realidad es feature/story. Si no habilita ninguna capacidad futura → en realidad es `extra/`.

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `docs/frmwk/settings/methodology.json`.
2. Extraer:
   - `en_cfg = identifiers.enabler` → `prefix`, `id_format`, `folder_format`, `placements`.
   - `en_doc_cfg = identifiers.enabler_doc` → `prefix`, `id_format`, `filename_format`, `items[]`.
   - `slug_cfg = slug`.
   - `paths.enablers_dir_global`, `paths.enablers_subdir`, `paths.features_dir`, `paths.user_stories_subdir`.
   - `feat_cfg = identifiers.feature`, `story_cfg = identifiers.story` (para validar el padre si se pasa flag).

Si el JSON no existe o no parsea → abortar y avisar al usuario.

### Paso 1 — Determinar el placement (global / feature / story)

Según los flags recibidos:

- **Sin flag** → placement = `global`. Ubicación = `paths.enablers_dir_global`.
- **`--feature FT-XX`** → placement = `feature`.
  1. Buscar carpeta en `paths.features_dir` que empiece por `FT-XX` y matchee `feat_cfg.folder_regex`.
  2. Si no existe → avisar y proponer `/fremi-feature` primero. No avanzar.
  3. Ubicación = `paths.features_dir/{feature_folder}/{paths.enablers_subdir}`.
- **`--story FT-XX/HU-YY`** → placement = `story`.
  1. Resolver feature padre (igual que arriba).
  2. Buscar story dentro de `{feature_folder}/{paths.user_stories_subdir}/` que empiece por `HU-YY` y matchee `story_cfg.folder_regex`.
  3. Si no existe → avisar y proponer `/fremi-story` primero. No avanzar.
  4. Ubicación = `paths.features_dir/{feature_folder}/{paths.user_stories_subdir}/{story_folder}/{paths.enablers_subdir}`.

### Paso 2 — Determinar el ID de enabler (numeración GLOBAL)

> Aunque el enabler puede vivir en 3 ubicaciones, la numeración `EN-XX` es **global al proyecto** para evitar colisiones al referenciar.

1. Buscar **en las 3 ubicaciones** carpetas que matcheen `en_cfg.folder_regex`:
   - `docs/works/enablers/EN-XX_*`
   - `docs/works/features/*/enablers/EN-XX_*`
   - `docs/works/features/*/user-stories/*/enablers/EN-XX_*`
2. Extraer el número de cada ID existente (parsear según `en_cfg.id_format`).
3. Próximo número = max(existentes) + 1. Si no hay → 1.
4. Construir el `id` aplicando `en_cfg.id_format`.
5. No reciclar IDs de enablers eliminados.

### Paso 3 — Normalizar el slug

Aplicar `slug_cfg.transforms` y validar contra `slug_cfg.regex`. Si el slug resultante colisiona con otro enabler existente (en cualquier ubicación) → pedir al usuario un slug distinto.

### Paso 4 — Crear el folder y los 4 docs del workflow

Aplicar `en_cfg.folder_format` (default: `{id}_{slug}`) → carpeta del enabler en la ubicación resuelta en Paso 1.

Crear los 4 archivos listados en `en_doc_cfg.items[]`. Para cada item:

1. Cargar `references/{filename_sin_md}-template.md` (ej: para item `definition` → `references/EN-01_definition-template.md`).
2. Reemplazar los placeholders:
   - `{enabler_id}` → ej `EN-02`.
   - `{slug}` → slug normalizado.
   - `{feature_id}`, `{story_id}` → si placement = feature/story.
   - `<...>` → con la info que el usuario ya proveyó, o como TODOs.
3. Escribir el archivo en la carpeta del enabler.

Estructura resultante (placement global):
```
docs/works/enablers/
└── {en_id}_{slug}/
    ├── EN-01_definition.md   (qué habilita y por qué)
    ├── EN-02_design.md       (cómo se construye)
    ├── EN-03_plan.md         (tareas atómicas)
    └── EN-04_closure.md      (sign-off al cierre)
```

Estructura resultante (placement feature):
```
docs/works/features/{FT-XX}_<slug>/
└── enablers/
    └── {en_id}_{slug}/
        ├── EN-01_definition.md
        ├── EN-02_design.md
        ├── EN-03_plan.md
        └── EN-04_closure.md
```

Estructura resultante (placement story):
```
docs/works/features/{FT-XX}_<slug>/user-stories/{HU-YY}_<slug>/
└── enablers/
    └── {en_id}_{slug}/
        ├── EN-01_definition.md
        ├── EN-02_design.md
        ├── EN-03_plan.md
        └── EN-04_closure.md
```

### Paso 5 — Registrar vinculaciones

En `EN-01_definition.md` § "Vinculado a", listar las features/stories que justifican el enabler.

Si el placement es `feature` o `story`, esa vinculación ya está implícita por la ubicación física. Aún así, dejarla explícita en el doc para que `EN-04_closure.md` pueda mapearla en el sign-off.

### Bifurcaciones técnicas → Regla 3b

Durante la redacción de `EN-02_design.md`, si aparece una decisión técnica con 2+ caminos viables (típico: elección de librería, layer vs container image, IaC tool, etc.):

1. **NO elegir silenciosamente.** Pausar la redacción.
2. Presentar al usuario **2-3 opciones** con pros/contras explícitos.
3. Esperar la decisión.
4. Invocar `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr` para registrar (en `product/decisions.md` o `FT-XX/decisions.md` si es local a feature).
5. Continuar referenciando `ADR-XXX` desde `EN-02_design.md`.

### Paso 6 — Validar sincronía (Regla 12)

Si el `EN-01_definition.md` declara una capacidad que pertenece a `product/definition.md` o que afecta a múltiples features, avisar y proponer sync-back hacia capa superior antes de continuar.

### Paso 7 — Reportar

Decir al usuario:
- ID y slug del enabler.
- Path completo.
- Placement elegido (global / feature / story).
- Features/stories vinculadas.
- Próximo paso: completar `EN-01_definition.md` (qué habilita, vinculado a quién, criterios técnicos).

## Diferencias con `/fremi-feature`, `/fremi-story` y `extra/`

| Concepto | Cuándo | Entrega valor user-facing | Estructura |
|---|---|---|---|
| `/fremi-feature` | Línea de trabajo grande del producto | Sí | `definition.md` + stories |
| `/fremi-story` | Unidad mínima de valor dentro de feature | Sí | 9 docs FW-01..FW-10 |
| `/fremi-enabler` | Trabajo técnico que habilita capacidad futura | **No** | 4 docs EN-01..EN-04 |
| `EX-NN` en `extra/` | Tooling, scripts, refactor sin habilitar nada nuevo | No | 1 archivo |

Test rápido: ¿qué pasa si NO hago este trabajo?
- "Una feature/story queda bloqueada o degradada" → **enabler**.
- "Nada se bloquea, pero el dev experience empeora" → **`extra/`**.
- "El cliente no recibe X" → **feature/story**.

## Validaciones

- Sin nombre descriptivo → preguntar.
- Si `--feature` apunta a feature inexistente → abortar.
- Si `--story` apunta a story inexistente → abortar.
- Si el JSON no es legible → abortar (no usar fallbacks).
- Si el placement es `feature` o `story` y la feature/story no tiene `definition.md` con contenido → forzar a completarlo primero.

## Templates

| Item (`en_doc_cfg.items[]`) | Archivo | Template |
|---|---|---|
| 1. `definition` | `EN-01_definition.md` | [`references/EN-01_definition-template.md`](references/EN-01_definition-template.md) |
| 2. `design` | `EN-02_design.md` | [`references/EN-02_design-template.md`](references/EN-02_design-template.md) |
| 3. `plan` | `EN-03_plan.md` | [`references/EN-03_plan-template.md`](references/EN-03_plan-template.md) |
| 4. `closure` | `EN-04_closure.md` | [`references/EN-04_closure-template.md`](references/EN-04_closure-template.md) |

Para cambiar la estructura de cualquier doc → editar el template correspondiente, no este SKILL.md.
