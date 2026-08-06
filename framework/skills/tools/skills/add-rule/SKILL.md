---
name: fremi-add-rule
description: Crea una rule ESPECÍFICA del proyecto bajo `docs/project/rules/<name>.md` y la registra en CADA agente instalado (Claude → `CLAUDE.md`, Cursor → `.cursor/rules/<name>.mdc`, Windsurf → `.windsurfrules`, Aider → `.aider.conf.yml`). Idempotente. Reemplaza al viejo `/fremi-tools rule`.
---

# /fremi-add-rule — Crear rule de proyecto

Crea una regla nueva específica del proyecto (`docs/project/rules/<name>.md`) y la registra automáticamente en **cada agente instalado** del proyecto, usando el mecanismo nativo de cada uno.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) para la tabla completa de detección y registro por agente / tipo de asset.

## Sintaxis

```
/fremi-add-rule <name>
```

## Cuándo invocarlo

- Necesitás formalizar una convención específica del stack o del equipo.
- Aparece un anti-patrón que debe quedar prohibido con justificación.

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar regex + largo.
3. Verificar que `docs/project/rules/<name>.md` NO existe.

### Paso 1 — Crear la rule (fuente única)
1. `mkdir -p docs/project/rules/`
2. Leer `references/rule-template.md`.
3. Escribir `docs/project/rules/<name>.md` con placeholders.

### Paso 2 — Detectar agentes instalados en el proyecto

Chequear en la raíz del proyecto (ver [`references/agent-detection.md`](../../references/agent-detection.md) §1):

| Agente        | Marcador             |
|---------------|----------------------|
| Claude Code   | `.claude/`           |
| Cursor        | `.cursor/`           |
| Windsurf      | `.windsurf/`         |
| Aider         | `.aider.conf.yml`    |

### Paso 3 — Registrar la rule en cada agente detectado

Para **cada** agente detectado en Paso 2, aplicar el mecanismo nativo:

- **Claude Code** (implementado):
  1. Leer `CLAUDE.md` del root. Si no existe → abortar con error.
  2. Buscar sección `## Project rules`. Si NO existe, crearla al final:
     ```markdown
     ## Project rules

     Reglas específicas de este proyecto. Cargadas automáticamente desde `docs/project/rules/`.
     ```
  3. Si `docs/project/rules/<name>.md` YA está referenciada → skip (idempotente).
  4. Agregar bullet:
     ```markdown
     - `docs/project/rules/<name>.md` — <una línea: qué impone esta regla>
     ```

- **Cursor** (planificado — soporta `.mdc` per-file):
  1. `mkdir -p .cursor/rules/`
  2. Crear symlink `.cursor/rules/<name>.mdc` → `../../docs/project/rules/<name>.md` (relativo).
  3. Idempotente: si ya existe y apunta al mismo target, skip.

- **Windsurf** (planificado — archivo único `.windsurfrules`):
  1. Si `.windsurfrules` NO existe → crearlo con header inicial.
  2. Agregar sección `## <name>` referenciando el path `docs/project/rules/<name>.md` o incluyendo el contenido.
  3. Idempotente por header de sección.

- **Aider** (planificado — `.aider.conf.yml`):
  1. Leer `.aider.conf.yml`.
  2. Agregar `docs/project/rules/<name>.md` a la lista `read:` (crearla si no existe).
  3. Idempotente por path.

Si ningún agente fue detectado → crear la rule igual y advertir que nadie la va a leer hasta instalar un agente.

### Paso 4 — Reportar

```
✅ Rule de proyecto creada: <name>
📁 Fuente única: docs/project/rules/<name>.md

📖 Registrada en los agentes instalados:
   ✓ Claude Code   CLAUDE.md → ## Project rules (bullet agregado)
   ✓ Cursor        .cursor/rules/<name>.mdc → ../../docs/project/rules/<name>.md
   • Windsurf      (no detectado — omitido)
   • Aider         (no detectado — omitido)

Próximo paso: editá docs/project/rules/<name>.md y completá los placeholders.
```

## Validaciones

- Colisión de nombre → abortar.
- Ningún agente instalado → crear igual + advertir.
- NO tocar `~/.fremi/framework/rules/`.

## Referencias

- Template: [`references/rule-template.md`](references/rule-template.md).
- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Rules del framework para inspiración: [`~/.fremi/framework/rules/workflow.md`](../../../../rules/workflow.md).
- Ver también: [`/fremi-delete-rule`](../delete-rule/SKILL.md).
