---
name: fremi-enabler-plan
description: Puebla o actualiza el `{enabler.plan}` de un enabler — tareas atómicas con criterios verificables de detección de completitud (Regla 7b). Doc snapshot. Se invoca después de `/fremi-enabler-design`.
---

> **Nota sobre identificadores:** los prefijos concretos (carpeta enabler, formato de task ID) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos (`definition`, `design`, `plan`, `closure`) y conceptos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-enabler-plan — Poblar el doc `plan` del enabler

Puebla el `{enabler.plan}` con las **tareas atómicas** (ID formato según `identifiers.task`) que materializan el `design` del enabler.

**Rol del doc**: en qué orden se construye el enabler. Cada tarea con criterios verificables (Regla 7b).

## Sintaxis

```
/fremi-enabler-plan <ENABLER_ID>
```

## Cuándo invocarlo

- `{enabler.design}` completo.
- Se agrega/refina una tarea.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.task`.
- `config.yaml` → `phase_rules.tasks`.

### Paso 1 — Validar padre
- `{enabler.design}` con estructura de archivos declarada.

### Paso 2 — Cargar template
- `references/{enabler.plan}-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.tasks`

Cada tarea debe tener:
- **Objetivo** claro (qué construye).
- **Mapeo** al step `design` (qué componente/decisión implementa).
- **Criterios verificables** de detección de completitud (Regla 7b): comando exit 0, archivo existe con contenido X, test pasa, etc.
- **Estado** explícito `[ ]` / `[/]` / `[x]`.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` capturado.

### Paso 5 — Escribir y reportar
- Reportar cantidad de tareas.
- Sugerir implementar según el plan; al terminar → `/fremi-enabler-closure`.

## Validaciones
- Cada tarea tiene criterio verificable.
- Cada tarea mapea al step `design`.

## Anti-patrones
- ❌ Tarea vaga ("configurar Terraform") — necesita criterio verificable.
- ❌ Tarea sin mapeo al step `design` — huérfana.

## Referencias
- Template: [`references/{enabler.plan}-template.md`](references/{enabler.plan}-template.md).
- Regla 7b (criterios verificables).
