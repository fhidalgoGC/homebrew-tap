---
name: fremi-add-skill
description: Crea un skill ESPECÍFICO del proyecto bajo `docs/project/skills/<name>/` y lo expone a CADA agente instalado en el proyecto vía symlink (`.claude/skills/`, `.cursor/skills/`, `.windsurf/skills/`, ...). No toca `~/.fremi/framework/` (metodología). Reemplaza al viejo `/fremi-tools skill`.
---

# /fremi-add-skill — Crear skill de proyecto

Crea un skill nuevo específico del proyecto (`docs/project/skills/<name>/SKILL.md`) y lo enlaza automáticamente a la carpeta de skills de **cada agente instalado en el proyecto** (Claude, Cursor, Windsurf, ...) — así una sola copia del skill queda expuesta a todos los agentes sin duplicar contenido.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) para la tabla completa de detección y registro por agente / tipo de asset.

## Sintaxis

```
/fremi-add-skill <name>
```

- `<name>`: kebab-case (`^[a-z][a-z0-9-]*$`, max 60 chars). Se normaliza si recibe espacios/underscores.

## Cuándo invocarlo

- "Creemos un skill de proyecto para X".
- Aparece una automatización/convención específica del stack del proyecto (no del framework general).

**No invocarlo si**:
- El skill sería reusable en cualquier proyecto → editar `~/.fremi/framework/skills/` a mano.
- Es una decisión técnica → usar `/fremi-product-adr`/`/fremi-feature-adr`/`/fremi-story-adr`.

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar regex `^[a-z][a-z0-9-]*$` y largo ≤ 60.
3. Verificar que NO existe `docs/project/skills/<name>/` ni `~/.fremi/framework/skills/<name>/` (colisión con framework).
4. Si colisiona → abortar y sugerir nombre alternativo.

### Paso 1 — Crear el asset (fuente única)
1. `mkdir -p docs/project/skills/<name>/`
2. Leer `references/skill-template.md`.
3. Escribir `docs/project/skills/<name>/SKILL.md` reemplazando `<name>` en el template. El resto queda con placeholders para que el usuario complete.

### Paso 2 — Detectar agentes instalados en el proyecto

Un proyecto puede tener uno o varios agentes activos. La detección se hace por presencia de la carpeta / archivo canónico de cada agente en la raíz del proyecto:

| Agente | Presencia detectada por | Destino del symlink |
|---|---|---|
| Claude Code | `.claude/` (directorio) | `.claude/skills/<name>` |
| Cursor | `.cursor/` (directorio) | `.cursor/skills/<name>` |
| Windsurf | `.windsurf/` (directorio) | `.windsurf/skills/<name>` |
| Aider | `.aider.conf.yml` (archivo) | (no soporta skills — omitir con nota) |

**Estado actual de soporte:**
- Claude Code: ✅ implementado.
- Cursor / Windsurf: ⚠️ carpetas planificadas. Si el destino existe, crear symlink; si el agente no expone un directorio de skills, saltar con nota `(pendiente de soporte upstream)`.

### Paso 3 — Exponer al agente(s) detectado(s)

Para **cada** agente detectado en Paso 2 (colección `A`):

1. Verificar que `<agent_dir>/skills/` existe. Si es un symlink-a-folder (heredado), convertir a folder-of-symlinks primero. Si no existe, `mkdir -p <agent_dir>/skills/`.
2. Crear symlink: `<agent_dir>/skills/<name>` → path relativo hacia `docs/project/skills/<name>` (calcular relativo desde la carpeta del symlink, ej. `../../docs/project/skills/<name>` para `.claude/skills/`).
3. Verificar que `<agent_dir>/skills/<name>/SKILL.md` resuelve.

Si `A` está vacío (ningún agente detectado) → advertir: crear igual el skill en `docs/project/skills/<name>/` pero avisar que ningún agente lo verá hasta que se instale al menos uno.

### Paso 4 — Reportar

```
✅ Skill de proyecto creado: <name>
📁 Fuente única: docs/project/skills/<name>/SKILL.md

🔌 Expuesto a los agentes instalados:
   ✓ Claude Code   .claude/skills/<name> → ../../docs/project/skills/<name>
   ✓ Cursor        .cursor/skills/<name> → ../../docs/project/skills/<name>
   • Windsurf      (no detectado — omitido)
   • Aider         (no soporta skills — omitido)

Próximo paso: editá docs/project/skills/<name>/SKILL.md y completá los placeholders.
```

Cuando agregues otro agente al proyecto (ej: `fremi agent install cursor`), volvé a correr `/fremi-add-skill <name>` — es idempotente y creará los symlinks faltantes sin tocar los existentes.

## Validaciones

- `<name>` inválido → abortar mostrando la regla.
- Colisión con skill de proyecto o de framework → abortar con sugerencia (`-v2`, `-extra`).
- NO tocar `~/.fremi/framework/` ni `docs/works/`.

## Referencias

- Template: [`references/skill-template.md`](references/skill-template.md).
- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Ver también: [`/fremi-delete-skill`](../delete-skill/SKILL.md) para eliminar skills.
- Orquestador: [`/fremi`](../../SKILL.md).
