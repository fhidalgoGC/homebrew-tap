---
name: fremi-add-hook
description: Crea un hook ESPECÍFICO del proyecto bajo `docs/project/hooks/<name>.sh` (chmod +x). NO registra automáticamente en `.claude/settings.json` — imprime las instrucciones para hacerlo a mano. Reemplaza al viejo `/fremi-tools hook`.
---

# /fremi-add-hook — Crear hook de proyecto

Crea un hook bash específico del proyecto (`docs/project/hooks/<name>.sh`) y **reporta instrucciones** para registrarlo en `.claude/settings.json`.

**v1 no auto-registra el hook** — registrarlo requiere elegir evento (PreToolUse / PostToolUse / Stop / UserPromptSubmit / etc.) y matcher, decisiones que el usuario toma.

## Sintaxis

```
/fremi-add-hook <name>
```

## Cuándo invocarlo

- Necesitás validación automática específica del proyecto al editar/ejecutar cosas.
- Regla que sólo aplica a este proyecto y se puede automatizar (ej: validar shape de un handler Lambda antes de commit).

## Procedimiento

### Paso 0 — Validar entrada
1. Normalizar `<name>` a kebab-case.
2. Validar regex + largo.
3. Verificar que `docs/project/hooks/<name>.sh` NO existe.

### Paso 1 — Crear el hook
1. Leer `references/hook-template.md`.
2. Escribir `docs/project/hooks/<name>.sh` con placeholders reemplazados.
3. Aplicar `chmod +x` al archivo.

### Paso 2 — Reportar instrucciones de registro

```
✅ Hook de proyecto creado: <name>
📁 Archivo: docs/project/hooks/<name>.sh (chmod +x aplicado)

⚠️ NO auto-registrado. Para activarlo, agregá esto a .claude/settings.json:

{
  "hooks": {
    "<HookEventName>": [
      {
        "matcher": "<pattern>",
        "hooks": [
          { "type": "command", "command": "<ruta-absoluta>/docs/project/hooks/<name>.sh" }
        ]
      }
    ]
  }
}

Sustituí <HookEventName> por PreToolUse | PostToolUse | Stop | UserPromptSubmit | etc.

Próximo paso:
   1. Editá docs/project/hooks/<name>.sh y completá la lógica.
   2. Registralo en .claude/settings.json siguiendo el bloque de arriba.
```

## Validaciones

- Colisión de nombre → abortar.
- Falla `chmod` → reportar y avisar.
- NO tocar hooks de framework (`~/.fremi/framework/hooks/`).

## Referencias

- Template: [`references/hook-template.md`](references/hook-template.md).
- Hooks del framework para inspiración: [`~/.fremi/framework/hooks/`](../../../../hooks/).
- Ver también: [`/fremi-delete-hook`](../delete-hook/SKILL.md).
