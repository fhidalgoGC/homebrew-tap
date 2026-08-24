---
name: fremi-story-adr
description: Agrega un ADR (Architecture Decision Record) al `decisions.md` de la carpeta story — nivel STORY. Para ADRs locales a UNA story (delta que se merge al decisions.md de la feature al cerrar la story). Numeración global al proyecto. Delta doc. Para ADRs de feature usar `/fremi-feature-adr`. Para ADRs de producto usar `/fremi-product-adr`. La Regla 17 (versionado + linaje) gobierna el merge al cerrar.
---

> **Nota sobre identificadores:** los prefijos concretos (feature, story, workflow doc, ADR, CA, SC, TC, task) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos y tokens `{workflow.<step>}`. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-story-adr — Agregar ADR local a una story

Agrega un nuevo Architecture Decision Record al archivo `decisions.md` dentro de la carpeta story (`docs/works/features/{feature_folder}/user-stories/{story_folder}/decisions.md`). Es el **delta** de ADRs tomados DURANTE una story concreta.

**Cuándo usar `/fremi-story-adr`**: la decisión se toma dentro de una story y aplica a esa story (aunque después puede promoverse a feature/producto si trasciende). Si al momento de decidir ya sabés que aplica a más stories → usar `/fremi-feature-adr` directo. Si es transversal al producto → `/fremi-product-adr`.

**Merge al cerrar** (Regla 17): al firmar `{workflow.closure}` de la story, los ADRs de `decisions.md` de la story se mergean al `decisions.md` de la feature (living), y bumpea MINOR por cada ADR nuevo (o MAJOR si algún ADR reemplaza uno anterior).

**Numeración global** al proyecto — se calcula tomando `max(<adr-id>) + 1` sobre TODOS los decisions.md del proyecto.

> **Importante:** este skill lee `identifiers.adr` del JSON. NO hardcodea el prefijo `ADR` ni el padding `{number:03d}` — todo viene del archivo de configuración.

## Sintaxis

```
/fremi-story-adr <FEATURE_ID/STORY_ID> [título]
```

- `<FEATURE_ID/STORY_ID>`: ID compuesto de feature+story padre (obligatorio, ej. con defaults: `FT-01/HU-02`). El formato de cada ID sale de `identifiers.feature.id_format` e `identifiers.story.id_format`.
- `título` (opcional): título corto del ADR. Si falta, preguntárselo al usuario.

## Cuándo invocarlo

- Se toma una decisión técnica entre 2+ alternativas.
- Usuario dice "registrar decisión", "ADR", "documentar elección de stack/patrón/librería".
- Cualquier decisión que vaya a impactar implementación y que no es obvia.

### Disparador típico: "bifurcación → opciones → usuario decide → ADR"

Este skill suele invocarse como **paso final** del patrón definido en **Regla 3b** (`~/.fremi/framework/rules/workflow.md`):

1. Durante la redacción de un artefacto (típicamente `{workflow.sdd}`, `{workflow.design}` o algo a nivel feature/producto), la IA detecta una bifurcación técnica con 2+ caminos viables.
2. La IA **pausa**, propone las opciones al usuario en el chat (con pros/contras), y **espera la decisión**.
3. Cuando el usuario elige, la IA invoca `/fremi-story-adr` con el contenido ya casi listo (contexto + alternativas + decisión) — sólo confirma campos antes de anexar.
4. La IA referencia el ID asignado desde el artefacto donde nació la decisión (`aplica <adr-id>` en una línea del doc `sdd` o `design`).

Si el usuario invoca `/fremi-story-adr` directamente para registrar una decisión ya conversada, también vale.

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`.
2. Extraer:
   - `adr_cfg = identifiers.adr` → `prefix`, `id_format`, `location_default`, `location_feature`, `regex`.
   - `feat_cfg = identifiers.feature` (para resolver el path cuando scope es una feature).
   - `paths.features_dir`, `paths.product_dir`.

Si el JSON no parsea → abortar.

### Paso 1 — Determinar destino

- Si `scope` es `product` o está omitido → archivo destino = `adr_cfg.location_default`.
- Si `scope` es un `FEATURE_ID` (ej. con defaults: `FT-03`):
  - Buscar `feature_folder` en `{paths.features_dir}` matcheando `feat_cfg.folder_regex` + el ID.
  - Archivo destino = `adr_cfg.location_feature` con `{feature_folder}` reemplazado.
  - Si el archivo no existe en esa feature, crearlo.

### Paso 2 — Determinar ID del ADR

**El ADR es global al proyecto** (`adr_cfg.scope === "global"`). Aún si el ADR vive en `feature/decisions.md`, su número es global.

1. Leer **todos** los archivos de decisions del proyecto:
   - `adr_cfg.location_default`
   - Cada `{feature_folder}/decisions.md` existente bajo `paths.features_dir`.
2. Extraer todos los IDs que matcheen `adr_cfg.regex` (default: `^ADR-\d{3}$`).
3. Próximo número = max(existentes) + 1. Si no hay → 1.
4. Construir el `id` aplicando `adr_cfg.id_format` (por default: `{prefix}-{number:03d}` → `ADR-001`; el prefijo y padding vienen del JSON).
5. **No reciclar** IDs de ADRs reemplazados.

### Paso 3 — Recolectar info

Si el usuario no proveyó el contenido completo, preguntar (de a una pregunta a la vez):
1. Título corto.
2. Contexto (qué problema/restricción motiva esta decisión).
3. Decisión (qué se eligió).
4. Alternativas descartadas (y por qué).
5. Consecuencias (positivas y negativas).

Si la decisión surge de la conversación previa, **proponer los campos completados** al usuario para que confirme.

### Paso 4 — Anexar al archivo

1. Leer el template canónico de `references/adr-entry-template.md` (relativo a la carpeta del skill: `~/.fremi/framework/skills/adr/references/adr-entry-template.md`).
2. Reemplazar los placeholders del template con los valores recolectados:
   - `{adr_id}` → ID determinado en Paso 2.
   - `<YYYY-MM-DD>` → fecha actual.
   - `<título corto>`, `<Contexto>`, `<Decisión>`, `<Alternativas>`, `<Consecuencias>`, `<Aplica a>` → con la info del Paso 3.
3. Anexar el bloque resultante al final del archivo destino (sin tocar ADRs existentes).

> El template incluye reglas de uso y restricciones. Si el contenido no respeta esas reglas (ej: alternativas fusionadas en un bullet, consecuencias todas positivas), avisar al usuario antes de anexar.

### Paso 4.5 — Bumpear el living decisions (Regla 17)

`decisions.md` (a nivel producto o feature) es un doc **living**. Consultar `config.yaml → versioning.parent_bump_triggers.adr_accepted`:

- **ADR nuevo aceptado** → **MINOR** bump del `decisions.md` destino.
- **ADR reemplaza otro** (marcado `Reemplazada por ADR-YYY`) → **MAJOR** bump.

Pasos:
1. Leer el frontmatter actual del archivo destino (si no tiene → agregarlo con `version: 0.0.0` y avisar migración).
2. Bumpear el número correspondiente.
3. Actualizar `last_updated` a fecha actual.
4. Agregar entry al `## Changelog` al pie:
   ```
   - **v<nueva>** — YYYY-MM-DD — {adr_id} aceptado: <título corto>. [origen: /adr]
   ```

### Paso 5 — Reportar

Decir al usuario:
- ID asignado (formato del JSON).
- Archivo donde se guardó.
- Si requiere actualizar alguna story relacionada (mencionar en su `{workflow.definition}` o `{workflow.design}` que aplica `{adr_id}`).

## Reglas

- **Numeración global** del proyecto. Aún si el ADR vive en feature, el número es global.
- **No reciclar** IDs. Un ADR reemplazado se marca `Estado: Reemplazada por <adr-id>` y se crea uno nuevo.
- **Default = product.** Sólo se va a feature si la decisión es estrictamente interna a esa feature.
- **Fecha:** se usa la fecha actual (`date +%Y-%m-%d`).
- Si `methodology.core.yaml` no es legible → **abortar**. No usar fallbacks hardcoded.

## Validaciones

- Si el scope feature pasado no existe → avisar y abortar.
- Si el título del ADR ya existe en otro ADR → advertir (puede ser duplicado o reemplazo).
