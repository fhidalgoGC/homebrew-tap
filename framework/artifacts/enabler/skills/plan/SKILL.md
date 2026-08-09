---
name: fremi-enabler-plan
description: Puebla o actualiza el `{enabler.plan}` de un enabler — tareas atómicas T-XXX con criterios verificables de detección de completitud (Regla 7b). Doc snapshot. Se invoca después de `/fremi-enabler-design`.
---

# /fremi-enabler-plan — Poblar EN-03 (tareas atómicas del enabler)

Puebla el `{enabler.plan}` con las **tareas atómicas** `T-XXX` que materializan el design de EN-02.

**Rol del doc**: en qué orden se construye el enabler. Cada tarea con criterios verificables (Regla 7b).

## Sintaxis

```
/fremi-enabler-plan <EN-ID>
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

Cada task-XXX debe tener:
- **Objetivo** claro (qué construye).
- **Mapeo** a EN-02 (qué componente/decisión implementa).
- **Criterios verificables** de detección de completitud (Regla 7b): comando exit 0, archivo existe con contenido X, test pasa, etc.
- **Estado** explícito `[ ]` / `[/]` / `[x]`.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` capturado.

### Paso 5 — Escribir y reportar
- Reportar cantidad de tareas.
- Sugerir implementar según el plan; al terminar → `/fremi-enabler-closure`.

## Validaciones
- Cada task tiene criterio verificable.
- Cada task mapea a EN-02.

## Anti-patrones
- ❌ Task vaga ("configurar Terraform") — necesita criterio verificable.
- ❌ Task sin mapeo a EN-02 — huérfana.

## Referencias
- Template: [`references/{enabler.plan}-template.md`](references/{enabler.plan}-template.md).
- Regla 7b (criterios verificables).
