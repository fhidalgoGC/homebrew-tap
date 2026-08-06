---
name: fremi-enabler-definition
description: Puebla o actualiza el `EN-01_definition.md` de un enabler — qué habilita, features/stories que dependen, criterios de aceptación técnicos. Doc snapshot. Se invoca después de `/fremi-enabler` (que arma el scaffold de los 4 docs) para completar el primero de la cadena.
---

# /fremi-enabler-definition — Poblar EN-01 (qué habilita el enabler)

Puebla el `EN-01_definition.md` de un enabler con:
- **Qué habilita**: la capacidad técnica que hace posible.
- **Features/stories que dependen** del enabler.
- **Criterios de aceptación técnicos** (no user-facing).

**Rol del doc**: describe la razón de existir del enabler. Sin esto, el enabler es tooling — y tooling va a `docs/works/extra/` (Regla 14).

## Sintaxis

```
/fremi-enabler-definition <EN-ID>
```

- `<EN-ID>`: ID del enabler (ej: `EN-02`). Debe existir con scaffold creado por `/fremi-enabler`.

## Cuándo invocarlo

- `/fremi-enabler <nombre>` acaba de crear el scaffold y hay que rellenar EN-01.
- Se descubrió que una feature/story adicional depende del enabler.
- Se refina qué habilita el enabler.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json` → `identifiers.enabler`, `identifiers.enabler_doc`.
- `config.enabler.yaml` → docs, flow.
- `config.yaml` → `phase_rules.definition`.

### Paso 1 — Validar padre y precondiciones
- Enabler con scaffold creado (los 4 archivos existen aunque estén con placeholders).
- Placement válido: `docs/works/enablers/{EN-XX}/` (global) o dentro de feature/story según scope.

### Paso 2 — Cargar template
- `references/EN-01_definition-template.md` (local).

### Paso 3 — Poblar aplicando reglas

- **Qué habilita**: capacidad concreta, no vaga.
- **Vinculaciones**: listar features/stories que dependen (referencia por ID `FT-XX`, `FT-XX/HU-YY`).
- **Criterios técnicos**: verificables (comando, existencia de recurso, etc.).
- **Sin comportamiento user-facing** (si hay, es feature/story, no enabler).

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = versión del padre según scope.
- No bumpear al escribir; se rellena `version_at_closure` al firmar EN-04.

### Paso 5 — Escribir y reportar
- Guardar.
- Sugerir `/fremi-enabler-design` como próximo paso.

## Validaciones
- Vinculaciones referencian artifacts existentes.
- Criterios técnicos verificables.
- Sin comportamiento user-facing.

## Anti-patrones
- ❌ Enabler que entrega valor user-facing → es feature/story.
- ❌ Enabler sin vinculaciones → no habilita nada, es tooling (`EX-NN`).
- ❌ Criterios subjetivos ("funcione bien").

## Referencias
- Template: [`references/EN-01_definition-template.md`](references/EN-01_definition-template.md).
- `config.enabler.yaml → flow.sequence`.
- Regla 15 (enablers opcionales) en `~/.fremi/framework/rules/workflow.md`.
