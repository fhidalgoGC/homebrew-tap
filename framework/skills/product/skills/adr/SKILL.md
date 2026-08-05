---
name: fremi-product-adr
description: Agrega un ADR (Architecture Decision Record) al `docs/works/product/decisions.md` — nivel PRODUCTO. Para ADRs transversales al producto (afectan múltiples features o el stack global). Numeración global (ADR-XXX). Doc living. Para ADRs locales a una feature, usar `/fremi-feature-adr`. Para ADRs locales a una story, usar `/fremi-story-adr`.
---

# /fremi-product-adr — Agregar ADR global de producto

Agrega un nuevo Architecture Decision Record al archivo `docs/works/product/decisions.md`. Es para decisiones **transversales al producto** — que afectan a múltiples features o al stack global.

**Numeración global** al proyecto (compartida con `feature-adr` y `story-adr`) — se calcula tomando `max(ADR-XXX) + 1` sobre TODOS los decisions.md del proyecto.

> **Importante:** este skill lee `identifiers.adr` del JSON. NO hardcodea el prefijo `ADR` ni el padding `{number:03d}` — todo viene del archivo de configuración.

## Sintaxis

```
/fremi-product-adr [título]
```

- `título` (opcional): título corto del ADR. Si falta, preguntárselo al usuario.
- **Sin argumento de scope** — este skill siempre va a `docs/works/product/decisions.md`. Para otros scopes usar `/fremi-feature-adr` o `/fremi-story-adr`.

## Cuándo invocarlo

- Se toma una decisión técnica entre 2+ alternativas.
- Usuario dice "registrar decisión", "ADR", "documentar elección de stack/patrón/librería".
- Cualquier decisión que vaya a impactar implementación y que no es obvia.

### Disparador típico: "bifurcación → opciones → usuario decide → ADR"

Este skill suele invocarse como **paso final** del patrón definido en **Regla 3b** (`docs/frmwk/rules/workflow.md`):

1. Durante la redacción de un artefacto (típicamente `FW-05_sdd-spec.md`, `FW-06_design.md` o algo a nivel feature/producto), la IA detecta una bifurcación técnica con 2+ caminos viables.
2. La IA **pausa**, propone las opciones al usuario en el chat (con pros/contras), y **espera la decisión**.
3. Cuando el usuario elige, la IA invoca `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr` con el contenido ya casi listo (contexto + alternativas + decisión) — sólo confirma campos antes de anexar.
4. La IA referencia el ID asignado desde el artefacto donde nació la decisión (`aplica <adr-id>` en una línea del FW-05/FW-06).

Si el usuario invoca `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr` directamente para registrar una decisión ya conversada, también vale.

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `docs/frmwk/settings/methodology.json`.
2. Extraer:
   - `adr_cfg = identifiers.adr` → `prefix`, `id_format`, `location_default`, `location_feature`, `regex`.
   - `feat_cfg = identifiers.feature` (para resolver el path cuando scope es una feature).
   - `paths.features_dir`, `paths.product_dir`.

Si el JSON no parsea → abortar.

### Paso 1 — Determinar destino

- Si `scope` es `product` o está omitido → archivo destino = `adr_cfg.location_default`.
- Si `scope` es un `FEATURE_ID` (ej: `FT-03`):
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
4. Construir el `id` aplicando `adr_cfg.id_format` (default: `{prefix}-{number:03d}` → `ADR-001`).
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

1. Leer el template canónico de `references/adr-entry-template.md` (relativo a la carpeta del skill: `docs/frmwk/skills/adr/references/adr-entry-template.md`).
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
- Si requiere actualizar alguna story relacionada (mencionar en su `FW-01_definition.md` o `FW-06_design.md` que aplica `{adr_id}`).

## Reglas

- **Numeración global** del proyecto. Aún si el ADR vive en feature, el número es global.
- **No reciclar** IDs. Un ADR reemplazado se marca `Estado: Reemplazada por <adr-id>` y se crea uno nuevo.
- **Default = product.** Sólo se va a feature si la decisión es estrictamente interna a esa feature.
- **Fecha:** se usa la fecha actual (`date +%Y-%m-%d`).
- Si `methodology.json` no es legible → **abortar**. No usar fallbacks hardcoded.

## Validaciones

- Si el scope feature pasado no existe → avisar y abortar.
- Si el título del ADR ya existe en otro ADR → advertir (puede ser duplicado o reemplazo).
