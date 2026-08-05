---
name: fremi-product-ideas
description: Puebla o extiende `docs/works/product/ideas.md` con brainstorm sin filtro de enfoques para las iniciativas declaradas. Doc living. Es el 2º paso de discovery. No se decide nada acá — sólo se abren opciones. La elección va en `/fremi-product-planteamiento`.
---

# /fremi-product-ideas — Discovery: brainstorm de enfoques

Extiende `docs/works/product/ideas.md` con **ideas exploradas** — enfoques posibles para abordar las iniciativas de `iniciativas.md`. Brainstorm **sin filtro**.

**Rol del doc**: abrir el espacio de soluciones. No se elige nada acá — la elección va en `planteamiento.md`.

## Sintaxis

```
/fremi-product-ideas [título-corto-de-idea]
```

## Cuándo invocarlo

- `iniciativas.md` existe con al menos 1 iniciativa aceptada.
- Se quiere explorar enfoques nuevos.
- Se descubre una idea que amerita registrarse (aunque no se elija).

## Cuándo NO invocarlo

- Sin iniciativas — arrancar por `/fremi-product-iniciativas`.
- Para elegir un approach → `/fremi-product-planteamiento`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.definition` (aplica también para ideas discovery).

### Paso 1 — Precondiciones (Regla 1)
- `iniciativas.md` debe existir con contenido real (al menos 1 init-XXX Aceptada).

### Paso 2 — Cargar template
- `references/ideas-template.md`.

### Paso 3 — Poblar

Cada idea:
- Descripción (2-4 líneas).
- Iniciativas que aborda (referencia a init-XXX).
- Pros / Contras.
- Riesgo estimado.
- Estado (Abierta / Descartada / Elegida / Fusionada).

**Sin filtro**: no descartar en este paso — sólo listar. El filtro va en planteamiento.

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `ancestor.version_at_creation` = versión actual de `iniciativas.md`.
- Cada idea nueva → **MINOR** bump.
- Marcar idea como "Descartada" → **PATCH**.
- Agregar entry al changelog.

### Paso 5 — Reportar
- Cantidad de ideas registradas.
- Sugerir `/fremi-product-planteamiento` cuando haya masa crítica (3-5 ideas) para elegir.

## Validaciones
- Cada idea referencia al menos 1 init-XXX existente.
- Al menos 3-5 ideas antes de pasar a planteamiento (si sólo hay 1, falta divergencia).

## Anti-patrones
- ❌ Elegir un approach acá (eso es planteamiento).
- ❌ Filtrar ideas por "no me gusta" en vez de dejarlas registradas.
- ❌ Idea que en realidad es una feature (muy chica, muy concreta).

## Referencias
- Template: [`references/ideas-template.md`](references/ideas-template.md).
- `docs/frmwk/rules/workflow.md` → Regla 4.
