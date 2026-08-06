---
name: fremi-delete-hook
description: Elimina un hook de proyecto — borra `docs/project/hooks/<name>.sh` Y su registro en CADA agente instalado que lo tenga configurado (hoy sólo Claude Code, en `.claude/settings.json`). Con `--force` puede eliminar hooks del framework. Pide confirmación antes de borrar.
---

# /fremi-delete-hook — Eliminar hook

Elimina un hook + su registro en cada agente instalado que soporte hooks (hoy sólo Claude Code). Por default sólo project hooks; `--force` para framework hooks.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) §2.3.

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
   - `~/.fremi/framework/hooks/<name>.sh` (sólo con `--force`).
2. Si no existe → abortar.

### Paso 1 — Detectar registros por agente

Para cada agente instalado que soporte hooks:

- **Claude Code** (`.claude/settings.json` presente):
  - Leer y buscar entries bajo `hooks.*[]` cuyo `command` apunte al path del hook.
  - Registrar en qué eventos y matchers está registrado.
- **Cursor / Windsurf / Aider**: no soportan hooks — nada que remover.

### Paso 2 — Confirmar

```
⚠️ Vas a eliminar el hook: <name>
   Fuente: docs/project/hooks/<name>.sh
   Registros detectados:
     - Claude Code: PostToolUse (matcher: "Edit|Write")

¿Confirmás? [sí/no]
```

### Paso 3 — Eliminar

1. **Claude Code**: remover entries en `.claude/settings.json` bajo cada evento donde está registrado.
2. Borrar archivo fuente: `rm docs/project/hooks/<name>.sh` (o `~/.fremi/framework/hooks/<name>.sh` con `--force`).

### Paso 4 — Reportar

```
✅ Hook eliminado: <name>
🗑️ Borrado:
   - docs/project/hooks/<name>.sh

📖 Registros removidos:
   ✓ Claude Code   .claude/settings.json → hooks.PostToolUse
   • Cursor        (no soporta hooks — omitido)
```

## Validaciones

- Hook no existe → abortar.
- Sin `--force` y hook está en `~/.fremi/framework/hooks/` → abortar.
- `.claude/settings.json` malformado → abortar antes de modificar.

## Referencias

- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Ver también: [`/fremi-add-hook`](../add-hook/SKILL.md).
- Hooks del framework: [`~/.fremi/framework/hooks/`](../../../../hooks/).
