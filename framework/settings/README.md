# `docs/frmwk/settings/` — Configuración runtime de la metodología

> **Esta carpeta es configuración para los agentes (IA), no para humanos directamente.** Los archivos acá NO son documentación que se lee en orden — son **datos estructurados** que los skills y hooks leen al ejecutarse.
>
> Este README sí es para humanos: explica qué hay, qué hace cada archivo, cuándo se modifica y cuál es el impacto.

---

## Contenido

| Archivo | Tipo | Propósito |
|---|---|---|
| `config.yaml` | Config maestra | **Fuente de verdad operativa**: stack técnico, testing capabilities (strict_tdd, test_runner, type_checker), reglas por fase (proposal/spec/design/tasks/apply/verify/…), obligatoriedad condicional de `FW-00_explore` y `FW-02_proposal`, preferencias del proyecto. **El archivo que marca todo** — scripts, hooks y tooling consultan primero acá. |
| `methodology.json` | Config nomenclatura | Fuente de verdad de la **nomenclatura**: prefijos, formatos de ID, scopes, regex, rutas base, principios. Para IAs que necesitan entender el naming. Coexiste con `config.yaml`. |
| `methodology.schema.json` | Schema | JSON Schema (draft 2020-12) que valida `methodology.json`. Lo usa el IDE para autocompletar y reportar errores. |
| `README.md` | Doc humana | Este archivo. |

### Relación entre `config.yaml` y `methodology.json`

Son **complementarios, no redundantes**:

- **`config.yaml`** manda para **operar** el framework: qué test runner correr, si strict-TDD está activo, si `FW-00_explore` es obligatorio en esta story concreta, cuál es la regla que se aplica en la fase `proposal`.
- **`methodology.json`** manda para **nombrar** artefactos: cuál es el regex de un ID de feature, con qué padding se numera un ADR, cuál es el filename esperado del doc `FW-05_sdd-spec.md`.

En caso de superposición (ej: obligatoriedad de `FW-00`/`FW-02` mencionada en ambos), **`config.yaml` es autoritativo**. `methodology.json` solo mantiene la referencia cruzada (`condition_ref`) para que los skills sepan dónde buscar la decisión.

---

## ¿Quién lee estos archivos?

Los **skills** del proyecto (`docs/frmwk/skills/*/SKILL.md`) cargan `methodology.json` como **Paso 0 obligatorio** antes de hacer cualquier otra cosa. Si el JSON falta o no parsea, los skills **abortan** — no usan fallbacks hardcoded.

Skills que dependen del JSON:
- `/fremi-feature` — usa `identifiers.feature`, `slug`, `paths`.
- `/fremi-story` — usa `identifiers.story`, `identifiers.workflow_doc` (con sus `items[]`), `slug`, `paths`.
- `/fremi-story-task` — usa `identifiers.task` y el filename del item con `name === "plan"`.
- `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr` — usa `identifiers.adr` (`location_default`, `location_feature`).
- `/fremi-story-closure-check` — itera `wf_items` y usa `identifiers.{criterion,scenario,test_case,task}`.
- `/fremi-sync-check` — usa `paths`, `identifiers.workflow_doc.items`, `identifiers.adr`.
- `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento` — usa `identifiers.iniciativa`, `layers.product.stages_order`.

Los **hooks** (en `docs/frmwk/hooks/`) hoy no leen el JSON directamente — la convención está hardcoded en bash. Si querés que un hook respete cambios del JSON, hay que parsearlo con `jq` dentro del script.

---

## `methodology.json` — La fuente de verdad

### Estructura

```
{
  "version": "1.0.0",
  "paths":          { ... rutas base del proyecto ... },
  "slug":           { ... reglas del slug kebab-case ... },
  "identifiers": {
    "iniciativa":   { ... patrón init-XXX ... },
    "feature":      { ... patrón FT-XX ... },
    "story":        { ... patrón HU-XX ... },
    "workflow_doc": { ... patrón FW-XX_*.md + items[] con los 8 docs ... },
    "task":         { ... patrón task-XXX ... },
    "adr":          { ... patrón ADR-XXX ... },
    "criterion":    { ... patrón CA-XXX ... },
    "scenario":     { ... patrón SC-XXX ... },
    "test_case":    { ... patrón TC-XXX ... }
  },
  "layers":     { ... orden y archivos esperados por capa ... },
  "principles": { ... referencias a las reglas duras ... }
}
```

### Formato de los `*_format` (placeholders)

Cada `id_format`, `folder_format`, `filename_format` usa placeholders estilo printf. Estos son los disponibles:

| Placeholder | Significado | Ejemplo |
|---|---|---|
| `{prefix}` | El prefijo del identificador (`FT`, `HU`, `FW`, etc.) | `FT` |
| `{number}` | Número entero sin padding | `7` |
| `{number:02d}` | Número con padding a 2 dígitos | `07` |
| `{number:03d}` | Número con padding a 3 dígitos | `007` |
| `{id}` | El identificador ya armado | `FT-01` |
| `{slug}` | Slug kebab-case | `core-report-generation` |
| `{name}` | Nombre del archivo workflow | `definition`, `bdd-userstories` |
| `{feature_id}` | ID de la feature padre (sólo para IDs anidados) | `FT-01` |
| `{story_id}` | ID de la story padre (sólo para IDs anidados) | `HU-01` |

### Scope de cada identificador

- **`global`** — numeración única en todo el proyecto (ej: features arrancan en `FT-01` y no se reciclan).
- **`feature`** — local a cada feature; cada feature arranca su propia numeración desde 1 (ej: stories arrancan en `HU-01` dentro de cada feature).
- **`story`** — local a cada story; cada story arranca su propia numeración (ej: tasks, scenarios, test cases).

---

## Cómo cambiar la convención

Editar `methodology.json` cambia la convención **para todos los items nuevos**. Los items ya creados con la nomenclatura vieja quedan como están hasta que se haga un sweep manual.

### Casos típicos

#### Cambiar prefijo de feature `FT` → `F`

Editar `identifiers.feature.prefix` de `"FT"` a `"F"`. La próxima feature creada con `/fremi-feature` será `F-01_<slug>` en lugar de `FT-01_<slug>`.

#### Cambiar padding de 2 dígitos → 3 dígitos (`FT-01` → `FT-001`)

Editar `identifiers.feature.id_format` de `"{prefix}-{number:02d}"` a `"{prefix}-{number:03d}"`.

#### Activar filenames compuestos para los docs workflow

Por default, los archivos de los 8 docs se llaman `FW-01_definition.md`, `FW-03_scope.md`, etc. Si querés que incluyan el ID de feature y story (`FT-01-HU-01-FW-01_definition.md`), editar:

```json
"workflow_doc": {
  ...
  "use_compound_filename": true,   // ← cambiar de false a true
  ...
}
```

El `compound_filename_format` ya está pre-armado en el JSON.

#### Cambiar la ubicación de un archivo

Editar `paths.*` (rutas base) o `identifiers.<id>.location` (ubicación específica). Por ejemplo, para mover los ADRs de `product/decisions.md` a `product/adrs.md`, editar `identifiers.adr.location_default`.

### Después de cambiar

1. Validá que el JSON sigue siendo válido (el IDE te lo dice con el `methodology.schema.json`).
2. Si cambiaste algo que afecta archivos ya creados, hacé un sweep:
   - Renombrar carpetas/archivos.
   - Actualizar referencias internas (grep + perl/sed).
3. Si modificaste estructura del schema (agregaste un nuevo tipo de identificador, etc.), actualizá también `methodology.schema.json`.

---

## `methodology.schema.json` — Validación

JSON Schema versión 2020-12 que valida la estructura de `methodology.json`. El IDE lo usa automáticamente vía el `$schema` declarado en `methodology.json`.

Define:
- Campos requeridos top-level (`version`, `identifiers`, `paths`, `slug`, `layers`).
- Estructura de `$defs/identifier` (reutilizable para cada tipo de ID).
- Restricciones de tipo y formato (regex, enum para scope, etc.).

Si agregás un campo nuevo al JSON que el schema no contempla, el IDE muestra warning. Actualizá el schema en paralelo.

---

## Cuándo NO tocar esta carpeta

- **No agregues acá decisiones técnicas del producto** (esas van a `docs/works/product/decisions.md`).
- **No agregues acá reglas del flujo** (esas van a `docs/frmwk/rules/workflow.md`).
- **No agregues acá documentación general** (la metodología viva en `docs/frmwk/flows/workflow.md` y `CLAUDE.md`).

Esta carpeta es **sólo configuración runtime** + este README. Nada más.

---

## Para extender

Si en el futuro aparecen nuevos archivos de configuración:
- **Datos estructurados que la IA lee** → van acá (`.json` con su `.schema.json` y mención en este README).
- **Comportamientos automatizados** (ej: validación al commit) → van a `docs/frmwk/hooks/` (no acá).
- **Skills nuevas** → van a `docs/frmwk/skills/<nombre>/SKILL.md` (no acá).

Cualquier archivo nuevo en esta carpeta debe quedar **listado en la tabla de Contenido** de este README con su propósito.
