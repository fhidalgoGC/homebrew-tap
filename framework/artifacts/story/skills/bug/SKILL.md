---
name: fremi-story-bug
description: Registra un defecto detectado en código de producción como BG-XX_<slug>.md dentro de la story que originó el bug. Un archivo único por bug, con síntoma, repro, test rojo (Regla 8), causa raíz, fix y cierre. Lee la nomenclatura desde ~/.fremi/framework/settings/methodology.core.yaml. Usar cuando el usuario reporta un comportamiento incorrecto detectado en producción o en una suite que protege producción.
---

# /fremi-story-bug — Registrar un nuevo bug

Crea un archivo `BG-XX_<slug>.md` **dentro de la carpeta `bugs/` de la story que originó el bug** (Regla 8). Un archivo único por bug — no folder.

> **Importante:** este skill NO tiene prefijos hardcoded. Lee `identifiers.bug` del JSON. La numeración `BG-XX` es **local a cada story** (cada story arranca desde `BG-01` en su carpeta `bugs/`).
>
> **Regla 17 — Living Versioning**: el bug es un artifact **snapshot** (single-file). Al crear:
> 1. Captura la versión actual del `FW-01_definition.md` de la story padre.
> 2. Inyecta frontmatter con `version: 1.0.0`, `doc_type: snapshot`, `ancestor.id: {story_id}`, `ancestor.version_at_creation`.
> 3. Al firmar la sección `## Cierre` del bug, bumpear el padre según `config.yaml → versioning.parent_bump_triggers.bug_closes` (PATCH si el fix respetó el contrato, MINOR si extendió, MAJOR si cambió).
> 4. Rellenar `ancestor.version_at_closure` con la versión final.

## Sintaxis

```
/fremi-story-bug <FT-XX/HU-YY> <nombre-descriptivo>
```

- `<FT-XX/HU-YY>`: ID de feature + story padre (ej: `FT-01/HU-02`).
- `<nombre-descriptivo>`: texto libre. Se normaliza a kebab-case según `slug.transforms`.

Si falta alguno → preguntárselo al usuario.

## Cuándo invocarlo

- Usuario reporta un comportamiento incorrecto del sistema en producción / staging / suite que protege producción.
- Detección automática (monitoreo, alerta, log error) escala a registro de bug.
- Aplica **siempre** que el comportamiento detectado contradiga lo especificado en `FW-05_sdd-spec.md` o `FW-04_bdd-userstories.md` de una story existente.

## Cuándo NO usar `/fremi-story-bug`

| Caso | Skill correcto |
|---|---|
| El comportamiento "incorrecto" en realidad NO está especificado en ninguna story | Primero crear/extender la story (Regla 8); después el bug |
| Es una mejora / nueva capacidad pedida | `/fremi-feature` o `/fremi-story` |
| Es un cambio de spec consciente (el comportamiento actual está mal especificado) | Cambio en `FW-05_sdd-spec.md` + ADR (Regla 10) |
| Es un cambio de tooling / build / IaC sin defecto en producción | `EX-NN` en `docs/works/extra/` |

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`.
2. Extraer:
   - `bug_cfg = identifiers.bug` → `prefix`, `id_format`, `filename_format`, `filename_regex`.
   - `feat_cfg = identifiers.feature`, `story_cfg = identifiers.story`.
   - `slug_cfg = slug`.
   - `paths.features_dir`, `paths.user_stories_subdir`, `paths.bugs_subdir`.

Si el JSON no existe o no parsea → abortar.

### Paso 1 — Validar feature + story padre

1. Resolver feature: buscar carpeta en `paths.features_dir` que matchee `feat_cfg.folder_regex` y empiece por `FT-XX`. Si no existe → abortar.
2. Resolver story: buscar carpeta dentro de `{feature_folder}/{paths.user_stories_subdir}/` que matchee `story_cfg.folder_regex` y empiece por `HU-YY`. Si no existe → abortar.
3. Verificar que la story tenga al menos `FW-01_definition.md` y `FW-05_sdd-spec.md` con contenido real. Si no → la story no está madura para tener bugs (Regla 8 — el bug describe desviación del spec; sin spec, no hay desviación que medir).

Si la story no existe pero el bug es real → **avisar al usuario** y proponer:
- Opción A: crear/extender la story que cubra el comportamiento esperado, después volver al bug.
- Opción B: si el comportamiento incorrecto no es atribuible a ninguna story actual del producto, eso es un gap de spec — escalarlo a feature/story, no a bug.

### Paso 2 — Determinar el ID de bug (numeración LOCAL a la story)

1. Construir el path de la carpeta de bugs: `{feature_folder}/{paths.user_stories_subdir}/{story_folder}/{paths.bugs_subdir}/`.
2. Si no existe la carpeta `bugs/` → crearla.
3. Listar archivos `.md` dentro y filtrar los que matcheen `bug_cfg.filename_regex`.
4. Extraer el número de cada ID existente (parsear según `bug_cfg.id_format`).
5. Próximo número = max(existentes) + 1. Si no hay → 1.
6. Construir el `id` aplicando `bug_cfg.id_format` (ej: `BG-01`).
7. No reciclar IDs de bugs eliminados.

### Paso 3 — Normalizar el slug

Aplicar `slug_cfg.transforms` y validar contra `slug_cfg.regex`. Si el slug colisiona con un bug existente en la misma story → pedir uno distinto.

### Paso 4 — Crear el archivo del bug

1. Cargar `references/BG-template.md`.
2. Reemplazar placeholders:
   - `{bug_id}` → ej `BG-01`.
   - `{slug}` → slug normalizado.
   - `{feature_id}`, `{story_id}` → derivados del padre.
   - `<...>` → con la info que el usuario ya proveyó, o como TODOs.
3. Aplicar `bug_cfg.filename_format` (default: `{id}_{slug}.md`).
4. Escribir en `{feature_folder}/{paths.user_stories_subdir}/{story_folder}/{paths.bugs_subdir}/{filename}`.

Estructura resultante:
```
docs/works/features/{FT-XX}_<slug>/user-stories/{HU-YY}_<slug>/
└── bugs/
    └── BG-01_<bug-slug>.md   ← un archivo por bug
```

### Paso 5 — Conectar con FW-09_checkwork.md de la story

La story queda **parcialmente reabierta** hasta que el bug se cierre. Agregar una nota a `FW-09_checkwork.md`:

```markdown
## 🐞 Bugs abiertos asociados

- `BG-01_<slug>` — <título corto> — severidad <X> — abierto <YYYY-MM-DD>
```

Cuando el bug se cierre, mover a:
```markdown
## ✅ Bugs cerrados

- `BG-01_<slug>` — cerrado <YYYY-MM-DD>
```

### Paso 6 — Verificar Regla 8 (test rojo PRIMERO)

Antes de implementar el fix, el agente que ejecute el ciclo debe:
1. Agregar el test de reproducción al test plan de la story (typically `FW-07_tdd-plan.md` como `TC-XXX`).
2. Correrlo y confirmar que **falla** (rojo).
3. Recién entonces escribir el fix.
4. Confirmar que pasa (verde).

Este skill no ejecuta el ciclo — sólo crea el archivo del bug. La ejecución del fix es trabajo del usuario / agente posterior, respetando Regla 8.

### Paso 7 — Reportar

Decir al usuario:
- ID y slug del bug.
- Path completo del archivo.
- Severidad declarada.
- Próximo paso: completar la sección "Reproducción" con el repro caracterizado, agregar test rojo a `FW-07_tdd-plan.md`, ejecutar Regla 8.

## Cambios de spec disparados por un bug (Regla 10)

Si el análisis de causa raíz revela que **la spec de la story estaba mal** (no que la implementación se desvió), entonces:
1. El bug no es un defecto, es un cambio de comportamiento.
2. Actualizar `FW-05_sdd-spec.md` (o `FW-04_bdd-userstories.md`) de la story.
3. Registrar ADR con la decisión (vía `/fremi-story-adr`).
4. El `BG-XX_<slug>.md` queda como rastro histórico — anotar en su sección "Fix aplicado" que el cambio fue de spec, no de implementación.

## Diferencias con otros artefactos

| Concepto | Cuándo | Estructura |
|---|---|---|
| `/fremi-story-bug` | Defecto en producción atribuible a una story | 1 archivo dentro de `story/bugs/` |
| Test que falla durante implementación inicial | Forma normal del TDD — no es bug | TC-XXX en `FW-07_tdd-plan.md` |
| Regresión detectada | Bug (registrar) — usar `/fremi-story-bug` | igual que defecto |
| Capacidad faltante (no especificada) | No es bug — es feature/story nueva | `/fremi-feature` o `/fremi-story` |

## Validaciones

- Sin feature/story padre → abortar.
- Si la story no tiene `FW-05_sdd-spec.md` con contenido → abortar.
- Sin nombre descriptivo → preguntar.
- Si el JSON no es legible → abortar.

## Template

| Archivo | Template |
|---|---|
| `BG-XX_<slug>.md` | [`references/BG-template.md`](references/BG-template.md) |

Para cambiar la estructura del doc → editar el template, no este SKILL.md.
