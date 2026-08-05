---
name: fremi-delete-hook
description: Elimina un hook de proyecto — borra `docs/project/hooks/<name>.sh` Y su registro en `.claude/settings.json`. Con `--force` puede eliminar hooks del framework. Pide confirmación antes de borrar.
---

# /fremi-delete-hook — Eliminar hook

Elimina un hook + su registro en `.claude/settings.json`. Por default sólo project hooks; `--force` para framework hooks.

## Sintaxis

```
/fremi-delete-hook <name> [--force]
```

## Cuándo invocarlo

- Un hook quedó obsoleto o causaba falsos positivos.
- Se creó un hook de prueba y se quiere limpiar.

## Procedimiento

### Paso 0 — Validar entrada
1. Localizar el hook:
   - `docs/project/hooks/<name>.sh` (default).
   - `docs/frmwk/hooks/<name>.sh` (sólo con `--force`).
2. Si no existe → abortar.

### Paso 1 — Detectar registros en settings.json

Leer `.claude/settings.json` y buscar entries que apunten al hook (por path).

Reportar dónde está registrado (eventos + matchers).

### Paso 2 — Confirmar

```
⚠️ Vas a eliminar el hook: <name>
   Path: docs/project/hooks/<name>.sh
   Registrado en .claude/settings.json:
     - PostToolUse (matcher: "Edit|Write")

¿Confirmás? [sí/no]
```

### Paso 3 — Eliminar

1. Remover entries del hook en `.claude/settings.json` (bajo cada evento donde está registrado).
2. Borrar archivo: `rm docs/project/hooks/<name>.sh`.

### Paso 4 — Reportar

```
✅ Hook eliminado: <name>
🗑️ Borrado:
   - docs/project/hooks/<name>.sh
   - Entry en .claude/settings.json (evento: PostToolUse)
```

## Validaciones

- Hook no existe → abortar.
- Sin `--force` y hook está en `docs/frmwk/hooks/` → abortar.
- Settings.json malformado → abortar antes de modificar.

## Referencias

- Ver también: [`/fremi-add-hook`](../add-hook/SKILL.md).
- Hooks del framework: [`docs/frmwk/hooks/`](../../../../hooks/).
