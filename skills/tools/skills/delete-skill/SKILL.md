---
name: fremi-delete-skill
description: Elimina un skill de proyecto — borra `docs/project/skills/<name>/` y su symlink en `.claude/skills/<name>`. Por default sólo elimina project skills. Con `--force` puede eliminar skills del framework (peligroso). Pide confirmación antes de borrar.
---

# /fremi-delete-skill — Eliminar skill

Elimina un skill del proyecto (por default) o del framework (con `--force`). Borra el folder + el symlink en `.claude/skills/`.

## Sintaxis

```
/fremi-delete-skill <name> [--force]
```

- `--force`: también permite eliminar skills bajo `~/.fremi/framework/skills/` (peligroso).

## Cuándo invocarlo

- Un skill de proyecto quedó obsoleto y no se usa.
- Se creó un skill de prueba y se quiere limpiar.

**No invocar** para "refactorizar" skills — mejor renombrar o editar el existente.

## Procedimiento

### Paso 0 — Validar entrada
1. Localizar el skill:
   - Primero: `docs/project/skills/<name>/`.
   - Si `--force` y no está en project: buscar en `~/.fremi/framework/skills/<name>/`.
2. Si no existe en ningún scope → abortar (no hay nada que borrar).

### Paso 1 — Detectar dependencias

Buscar referencias al skill en:
- Otros SKILL.md del framework/proyecto (`grep -r "/<name>" docs/`).
- `CLAUDE.md`.
- `~/.fremi/framework/settings/config.*.yaml` (skill declarado en `flow.sequence`?).

Si hay referencias → mostrar al usuario y pedir confirmación.

### Paso 2 — Confirmar

```
⚠️ Vas a eliminar el skill: <name>
   Path: docs/project/skills/<name>/ (o ~/.fremi/framework/skills/<name>/ con --force)
   Referencias detectadas: <N>

¿Confirmás?
```

Esperar `sí` explícito.

### Paso 3 — Eliminar

1. Borrar symlink: `rm .claude/skills/<name>`.
2. Borrar folder: `rm -rf docs/project/skills/<name>/` (o `~/.fremi/framework/skills/<name>/` con `--force`).

### Paso 4 — Reportar

```
✅ Skill eliminado: <name>
🗑️ Borrado:
   - docs/project/skills/<name>/ (o ~/.fremi/framework/skills/<name>/)
   - .claude/skills/<name>

⚠️ Referencias que quedaron rotas:
   - <archivo1>: menciona /<name>
   - <archivo2>: menciona /<name>
   Revisá y actualizá manualmente.
```

## Validaciones

- Skill no existe → abortar.
- Sin `--force` y skill está en `~/.fremi/framework/` → abortar (necesita `--force` explícito).
- Referencias huérfanas → reportar pero no bloquear.

## Anti-patrones

- ❌ Eliminar skills del framework sin `--force` — protección intencional.
- ❌ Eliminar sin revisar dependencias.

## Referencias

- Ver también: [`/fremi-add-skill`](../add-skill/SKILL.md).
- Orquestador: [`/fremi`](../../SKILL.md).
