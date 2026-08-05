---
name: fremi-product-iniciativas
description: Puebla o extiende `docs/works/product/iniciativas.md` con hipótesis de negocio SAFe (init-XXX). Doc living. Es el primer doc de discovery — sin iniciativas no hay razón estratégica de qué construir. Cada iniciativa es un "todo macro" que justifica meses/quarters y contiene múltiples features.
---

# /fremi-product-iniciativas — Discovery: iniciativas del producto

Crea o extiende `docs/works/product/iniciativas.md` con **iniciativas** (`init-XXX`) — hipótesis de negocio SAFe/Lean Business Case que justifican el producto entero.

**Rol del doc**: qué queremos lograr a nivel estratégico. **No** es una feature ni un objetivo pequeño — es una hipótesis grande de negocio.

## Sintaxis

```
/fremi-product-iniciativas [título-corto]
```

- `título-corto` (opcional): nombre de la iniciativa nueva. Si falta, preguntar.

## Cuándo invocarlo

- Al arrancar el producto — no hay `iniciativas.md` todavía.
- Se identifica una **nueva** iniciativa (nueva hipótesis de negocio, no una feature adicional).
- El usuario dice "arrancar el producto", "declarar objetivos estratégicos", "tengo una hipótesis grande".

**Heurística**: si lo que describís se implementa en 1-2 sprints, NO es iniciativa. Es feature dentro de una.

## Cuándo NO invocarlo

- Para explorar enfoques → usar `/fremi-product-ideas`.
- Para elegir approach → usar `/fremi-product-planteamiento`.
- Para agregar una feature → usar `/fremi-feature`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json` → `identifiers.iniciativa` (init-XXX + regex + padding).
- `config.yaml` → `phase_rules.definition` (aplica también para iniciativas dado su rol de "por qué").

### Paso 1 — Precondiciones
- Ninguna precondición dura (es el primer doc del producto). Si `iniciativas.md` no existe → crear con estructura inicial.

### Paso 2 — Cargar template
- `references/iniciativas-template.md` (local).

### Paso 3 — Poblar

Cada iniciativa nueva `init-XXX`:
- Hipótesis (`Creemos que ... si hacemos ... vamos a lograr ... medido por ...`).
- Métricas de éxito (leading + lagging).
- Beneficiarios (usuarios / negocio).
- Escala (meses/quarters, no días).
- Estado (En descubrimiento / Aceptada / Kill / Pivot).

**No reciclar init-XXX**: iniciativas descartadas se marcan `Estado: Kill` con motivo, y quedan como rastro.

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `doc_type: living`, `ancestor.id: product`, `ancestor.version_at_creation: null` (es raíz).
- Cada iniciativa nueva → **MINOR** bump.
- Cambio de estado (Kill, Pivot) o corrección → **PATCH**.
- Reformulación radical de una iniciativa → **MAJOR**.
- Actualizar `last_updated` + agregar entry al `## Changelog` al pie.

### Paso 5 — Reportar
- ID asignado (`init-001`, `init-002`, ...).
- Sugerir próximo paso: `/fremi-product-ideas` para brainstorm de enfoques.

## Validaciones
- Cada init-XXX tiene hipótesis + métricas + escala.
- Sin TBDs — si no se puede formular la hipótesis, la iniciativa no está lista.
- No colisión de IDs.

## Anti-patrones
- ❌ Iniciativa que es en realidad una feature (escala < 2 sprints).
- ❌ Múltiples iniciativas del mismo problema — fusionar.
- ❌ "Objetivos" abstractos sin métrica ("ser el mejor producto").

## Referencias
- Template: [`references/iniciativas-template.md`](references/iniciativas-template.md).
- `docs/frmwk/rules/workflow.md` → Regla 4 (discovery antes de formalización).
