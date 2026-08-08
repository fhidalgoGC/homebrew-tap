---
name: fremi-story-checkwork
description: Actualiza el `FW-09_checkwork.md` de una story — doc VIVO que refleja estado real de implementación (tasks listas / en curso / pendientes, CAs cubiertos, archivos implementados). Living doc (bumpea PATCH por cada task cerrada). Se invoca al arrancar/cerrar cada task, y también automáticamente por el hook `sync-checkwork.sh` cuando existe.
---

# /fremi-story-checkwork — Actualizar FW-09 (estado en vivo)

Actualiza el `FW-09_checkwork.md` — el **único doc que muta durante la implementación** (Regla 13). Refleja el estado real de la story: qué está listo, en curso, pendiente; CAs cubiertos por tests; archivos implementados.

**Rol del doc**: espejo del `FW-08_plan.md` con estado real + cobertura.

**Diferencia con `/fremi-story-plan`**:
- `/fremi-story-plan` — crea/refresca el archivo del plan (`FW-08`).
- `/fremi-story-checkwork` — actualiza el estado vivo (`FW-09`) según lo que efectivamente pasó.

## Sintaxis

```
/fremi-story-checkwork <FEATURE_ID> <STORY_ID> [--action <start|close|status>] [--task <task-XXX>]
```

- `--action start --task task-XXX` — mueve task a `## 🚧 En curso`.
- `--action close --task task-XXX` — mueve task a `## ✅ Listo` + actualiza % + registra archivos.
- `--action status` (default) — refresca porcentaje + archivos implementados + cobertura de CAs sin cambiar tareas.

## Cuándo invocarlo

**Obligatorio** (Regla 13):
- Al **arrancar** una task (mover de ⬜ a 🚧).
- Al **cerrar** una task (mover de 🚧 a ✅) — actualiza porcentaje, archivos, cobertura.
- Cuando aparece un bloqueo (agregar a `## ❓ Decisiones pendientes / bloqueos`).

**Opcional**:
- Al agregar un archivo nuevo al codebase.
- Al confirmar cobertura de un CA con un test nuevo.

**No necesario** si el hook `~/.fremi/framework/hooks/sync-checkwork.sh` está activo — el hook ejecuta este skill automáticamente al detectar cambios en `FW-08_plan.md`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.workflow_doc.items[name=checkwork]`.
- `config.yaml` → `phase_rules.apply`.

### Paso 1 — Validar padre y precondiciones
- `FW-08_plan.md` con al menos 1 task.
- Si `--task task-XXX`: verificar que existe en el plan.

### Paso 2 — Cargar template si no existe
- `references/FW-09_checkwork-template.md` (living doc).

### Paso 3 — Aplicar `--action` según `phase_rules.apply`

- **start**: mover task de ⬜ Pendiente a 🚧 En curso con fecha inicio.
- **close**: mover a ✅ Listo con fecha cierre; actualizar `% progreso`; agregar archivos tocados por la task; marcar `✅` en tabla de CAs cubiertos si el test asociado quedó verde.
- **status**: recalcular % (tasks_closed / total * 100), refrescar lista de archivos implementados (leer git diff o repo), cobertura de CAs.

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Cada `--action close` → bump PATCH (`0.1.0` → `0.1.1`).
- Si se agrega un archivo nuevo o completa un CA → bump MINOR (`0.1.1` → `0.2.0`).
- Actualizar `last_updated`.
- Agregar entry al `## Changelog` al pie:
  ```
  - **v<X>** — YYYY-MM-DD — task-XXX cerrada. [origen: /fremi-story-checkwork --action close]
  ```

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar: % actual, cuántas tasks quedan, si está cerca del 100% (sugerir `/fremi-story-verify` como próximo paso).

## Validaciones

- El plan (`FW-08`) es consistente con checkwork (misma cantidad de tasks).
- Si % == 100 → sugerir `/fremi-story-verify` + `/fremi-story-closure-check`.
- Tabla de CAs cubiertos apunta a tests reales (grep en codebase).

## Anti-patrones

- ❌ Marcar task como ✅ sin que su criterio verificable pase (viola Regla 7b).
- ❌ Actualizar checkwork sin bumpear versión (viola Regla 17).
- ❌ Ignorar bloqueos — deben quedar registrados.
- ❌ Reemplazar `FW-08_plan.md` con este archivo — son distintos (Regla 13).

## Referencias

- Template: [`references/FW-09_checkwork-template.md`](references/FW-09_checkwork-template.md).
- Hook: `~/.fremi/framework/hooks/sync-checkwork.sh` (auto-invoca este skill al detectar cambios en `FW-08`).
- `config.yaml → phase_rules.apply`.
- `~/.fremi/framework/rules/workflow.md` → Regla 13 (checkwork al día), Regla 11 (100% precondición closure).
