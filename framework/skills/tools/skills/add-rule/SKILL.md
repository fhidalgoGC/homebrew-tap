---
name: fremi-add-rule
description: Crea una rule ESPECÍFICA del proyecto bajo `docs/project/rules/<name>.md` y agrega auto-referencia en `CLAUDE.md` bajo la sección `## Project rules`. Idempotente. Reemplaza al viejo `/fremi-tools rule`.
---

# /fremi-add-rule — Crear rule de proyecto

Crea una regla nueva específica del proyecto (`docs/project/rules/<name>.md`) y actualiza `CLAUDE.md` para que la regla se cargue automáticamente en el contexto del agente.

## Sintaxis

```
/fremi-add-rule <name>
```

## Cuándo invocarlo

- Necesitás formalizar una convención específica del stack o del equipo.
- Aparece un anti-patrón que debe quedar prohibido con justificación.

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar regex + largo.
3. Verificar que `docs/project/rules/<name>.md` NO existe.
4. Verificar que `CLAUDE.md` es legible.

### Paso 1 — Crear la rule
1. `mkdir -p docs/project/rules/`
2. Leer `references/rule-template.md`.
3. Escribir `docs/project/rules/<name>.md` con placeholders.

### Paso 2 — Auto-referencia en CLAUDE.md

1. Leer `CLAUDE.md` del root.
2. Buscar sección `## Project rules`. Si NO existe, crearla al final:
   ```markdown
   ## Project rules

   Reglas específicas de este proyecto. Cargadas automáticamente desde `docs/project/rules/`.
   ```
3. Verificar si `docs/project/rules/<name>.md` ya está referenciada. Si NO → agregar bullet:
   ```markdown
   - `docs/project/rules/<name>.md` — <una línea: qué impone esta regla>
   ```
4. Idempotente: si ya está referenciada, no duplicar.

### Paso 3 — Reportar

```
✅ Rule de proyecto creada: <name>
📁 Archivo: docs/project/rules/<name>.md
📖 Referencia agregada en CLAUDE.md bajo "## Project rules".

Próximo paso: editá docs/project/rules/<name>.md y completá los placeholders.
```

## Validaciones

- Colisión de nombre → abortar.
- `CLAUDE.md` no legible → abortar con error claro.
- NO tocar `~/.fremi/framework/rules/`.

## Referencias

- Template: [`references/rule-template.md`](references/rule-template.md).
- Rules del framework para inspiración: [`~/.fremi/framework/rules/workflow.md`](../../../../rules/workflow.md).
- Ver también: [`/fremi-delete-rule`](../delete-rule/SKILL.md).
