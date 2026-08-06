---
name: fremi-add-skill
description: Crea un skill ESPECÍFICO del proyecto bajo `docs/project/skills/<name>/` y lo expone al agente via symlink en `.claude/skills/<name>`. No toca `~/.fremi/framework/framework/` (metodología). Reemplaza al viejo `/fremi-tools skill`.
---

# /fremi-add-skill — Crear skill de proyecto

Crea un skill nuevo específico del proyecto (`docs/project/skills/<name>/SKILL.md`) y lo enlaza automáticamente a `.claude/skills/<name>` para que el agente lo detecte.

## Sintaxis

```
/fremi-add-skill <name>
```

- `<name>`: kebab-case (`^[a-z][a-z0-9-]*$`, max 60 chars). Se normaliza si recibe espacios/underscores.

## Cuándo invocarlo

- "Creemos un skill de proyecto para X".
- Aparece una automatización/convención específica del stack del proyecto (no del framework general).

**No invocarlo si**:
- El skill sería reusable en cualquier proyecto → editar `~/.fremi/framework/framework/skills/` a mano.
- Es una decisión técnica → usar `/fremi-product-adr`/`/fremi-feature-adr`/`/fremi-story-adr`.

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar regex `^[a-z][a-z0-9-]*$` y largo ≤ 60.
3. Verificar que NO existen: `docs/project/skills/<name>/`, `.claude/skills/<name>`, ni `~/.fremi/framework/framework/skills/<name>/` (colisión con framework).
4. Si colisiona → abortar y sugerir nombre alternativo.

### Paso 1 — Crear el asset
1. `mkdir -p docs/project/skills/<name>/`
2. Leer `references/skill-template.md`.
3. Escribir `docs/project/skills/<name>/SKILL.md` reemplazando `<name>` en el template. El resto queda con placeholders para que el usuario complete.

### Paso 2 — Exponer al agente
1. Verificar `.claude/skills/` — si es symlink-a-folder (heredado), convertir a folder-of-symlinks primero.
2. Crear symlink: `.claude/skills/<name>` → `../../docs/project/skills/<name>`.
3. Verificar que `.claude/skills/<name>/SKILL.md` resuelve.

### Paso 3 — Reportar

```
✅ Skill de proyecto creado: <name>
📁 Archivo: docs/project/skills/<name>/SKILL.md
🔌 Symlink: .claude/skills/<name> → ../../docs/project/skills/<name>
   Verificado: SKILL.md resuelve correctamente.

Próximo paso: editá docs/project/skills/<name>/SKILL.md y completá los placeholders.
```

## Validaciones

- `<name>` inválido → abortar mostrando la regla.
- Colisión con skill de proyecto o de framework → abortar con sugerencia (`-v2`, `-extra`).
- NO tocar `~/.fremi/framework/framework/` ni `docs/works/`.

## Referencias

- Template: [`references/skill-template.md`](references/skill-template.md).
- Ver también: [`/fremi-delete-skill`](../delete-skill/SKILL.md) para eliminar skills.
- Orquestador: [`/fremi`](../../SKILL.md).
