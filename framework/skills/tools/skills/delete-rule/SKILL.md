---
name: fremi-delete-rule
description: Elimina una rule de proyecto — borra `docs/project/rules/<name>.md` Y desregistra en CADA agente instalado (Claude → `CLAUDE.md`, Cursor → `.cursor/rules/<name>.mdc`, Windsurf → `.windsurfrules`, Aider → `.aider.conf.yml`). Con `--force` puede eliminar rules del framework. Pide confirmación antes de borrar.
---

# /fremi-delete-rule — Eliminar rule

Elimina una rule + su registro en **cada agente instalado**. Por default sólo project rules; `--force` para framework rules.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) para la tabla completa de detección y registro.

## Sintaxis

```
/fremi-delete-rule <name> [--force]
```

## Cuándo invocarlo

- Rule quedó obsoleta.
- Reemplazada por una nueva regla mejor formulada.

## Procedimiento

### Paso 0 — Validar entrada
1. Localizar rule:
   - `docs/project/rules/<name>.md` (default).
   - `~/.fremi/framework/rules/<name>.md` (sólo con `--force`).
2. Si no existe → abortar.

### Paso 1 — Detectar referencias

Buscar en:
- Todos los agentes instalados (según §1 de agent-detection.md).
- Otros SKILL.md que la mencionen.
- Otras rules que referencian a esta.

### Paso 2 — Confirmar

```
⚠️ Vas a eliminar la rule: <name>
   Fuente: docs/project/rules/<name>.md
   Registrada en:
     - Claude Code:  CLAUDE.md (## Project rules)
     - Cursor:       .cursor/rules/<name>.mdc (symlink)
   Otras menciones: <archivos>

¿Confirmás?
```

### Paso 3 — Eliminar

Para **cada** agente detectado, remover el registro:

- **Claude Code**: editar `CLAUDE.md` y quitar el bullet de `docs/project/rules/<name>.md` bajo `## Project rules`. Si la sección queda vacía, dejar el header con nota "sin rules específicas" (no borrar la sección salvo con `--force`).
- **Cursor**: `rm .cursor/rules/<name>.mdc` si es symlink apuntando a la rule.
- **Windsurf**: remover la sección `## <name>` de `.windsurfrules`.
- **Aider**: quitar el path de la lista `read:` en `.aider.conf.yml`.

Después, borrar la fuente única: `rm docs/project/rules/<name>.md`.

### Paso 4 — Reportar

```
✅ Rule eliminada: <name>
🗑️ Borrado:
   - docs/project/rules/<name>.md

📖 Registros removidos:
   ✓ Claude Code   bullet en CLAUDE.md → ## Project rules
   ✓ Cursor        .cursor/rules/<name>.mdc
   • Windsurf      (no registrado — omitido)

⚠️ Otras menciones no auto-removidas:
   - <archivo1>: menciona <name>
   Revisá y actualizá.
```

## Validaciones

- Rule no existe → abortar.
- Sin `--force` y rule está en `~/.fremi/framework/rules/` → abortar.
- Fallo al remover algún registro por agente → seguir con los demás y reportar el error, pero NO borrar la fuente única (garantiza que reintento es idempotente).

## Referencias

- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Ver también: [`/fremi-add-rule`](../add-rule/SKILL.md).
- Rules del framework: [`~/.fremi/framework/rules/workflow.md`](../../../../rules/workflow.md).
