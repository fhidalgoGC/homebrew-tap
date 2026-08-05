---
name: fremi-delete-rule
description: Elimina una rule de proyecto — borra `docs/project/rules/<name>.md` Y su referencia en `CLAUDE.md` bajo `## Project rules`. Con `--force` puede eliminar rules del framework. Pide confirmación antes de borrar.
---

# /fremi-delete-rule — Eliminar rule

Elimina una rule + su referencia en `CLAUDE.md`. Por default sólo project rules; `--force` para framework rules.

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
   - `docs/frmwk/rules/<name>.md` (sólo con `--force`).
2. Si no existe → abortar.

### Paso 1 — Detectar referencias

Buscar en:
- `CLAUDE.md` bajo `## Project rules`.
- Otros SKILL.md que la mencionen.
- Otras rules que referencian a esta.

### Paso 2 — Confirmar

```
⚠️ Vas a eliminar la rule: <name>
   Path: docs/project/rules/<name>.md
   Referenciada en:
     - CLAUDE.md (## Project rules)
     - <otros archivos>

¿Confirmás?
```

### Paso 3 — Eliminar

1. Editar `CLAUDE.md` — quitar el bullet de `docs/project/rules/<name>.md` bajo `## Project rules`.
2. Si al remover el bullet la sección queda vacía → considerar dejar la sección (con nota "sin rules específicas") o borrarla entera (con `--force`).
3. Borrar archivo: `rm docs/project/rules/<name>.md`.

### Paso 4 — Reportar

```
✅ Rule eliminada: <name>
🗑️ Borrado:
   - docs/project/rules/<name>.md
   - Referencia en CLAUDE.md

⚠️ Otras menciones no auto-removidas:
   - <archivo1>: menciona <name>
   Revisá y actualizá.
```

## Validaciones

- Rule no existe → abortar.
- Sin `--force` y rule está en `docs/frmwk/rules/` → abortar.
- CLAUDE.md no legible → abortar.

## Referencias

- Ver también: [`/fremi-add-rule`](../add-rule/SKILL.md).
- Rules del framework: [`docs/frmwk/rules/workflow.md`](../../../../rules/workflow.md).
