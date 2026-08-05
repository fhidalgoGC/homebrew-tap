# Template — SKILL (para uso de `/fremi-tools skill <name>`)

Este template arma el `SKILL.md` inicial de un skill nuevo específico de proyecto (bajo `docs/project/skills/<name>/`). Se rellena reemplazando `<name>` y los placeholders.

````markdown
---
name: <name>
description: <descripción de 1-2 líneas: qué hace este skill, cuándo invocarlo. Es lo que el agente lee para decidir cuándo dispararlo.>
---

# /<name> — <Título descriptivo>

<Descripción más larga del skill — qué problema resuelve, por qué existe.>

## Sintaxis

```
/<name> [args]
```

- `<arg1>`: <descripción>
- `<arg2>`: <descripción> (opcional)

## Cuándo invocarlo

- <Trigger 1 — frase típica del usuario que indica que toca correr este skill>
- <Trigger 2>

**No invocarlo si:**
- <Anti-trigger 1>

## Procedimiento

### Paso 1 — <título del paso>
1. <acción>
2. <acción>

### Paso 2 — <título>
1. <acción>

### Paso N — Reportar

Imprimir al usuario qué se hizo.

## Validaciones

- <Validación 1>
- <Validación 2>
````
