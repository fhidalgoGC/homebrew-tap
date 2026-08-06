---
name: fremi-add-hook
description: Crea un hook ESPECÍFICO del proyecto bajo `docs/project/hooks/<name>.sh` (chmod +x). Reporta instrucciones de registro para CADA agente instalado que soporte hooks (hoy sólo Claude Code). Reemplaza al viejo `/fremi-tools hook`.
---

# /fremi-add-hook — Crear hook de proyecto

Crea un hook bash específico del proyecto (`docs/project/hooks/<name>.sh`) y **reporta instrucciones de registro por cada agente instalado que soporte hooks**.

> Ver [`references/agent-detection.md`](../../references/agent-detection.md) §2.3 — sólo Claude Code tiene hooks nativos; Cursor / Windsurf / Aider no.

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

### Paso 1 — Crear el hook (fuente única)
1. Leer `references/hook-template.md`.
2. Escribir `docs/project/hooks/<name>.sh` con placeholders reemplazados.
3. Aplicar `chmod +x` al archivo.

### Paso 2 — Detectar agentes instalados en el proyecto

Chequear marcadores en la raíz (ver [`references/agent-detection.md`](../../references/agent-detection.md) §1):

| Agente        | Soporte de hooks |
|---------------|------------------|
| Claude Code   | ✅ nativo — `.claude/settings.json` |
| Cursor        | ❌ no soporta hooks |
| Windsurf      | ❌ no soporta hooks |
| Aider         | ❌ no soporta hooks |

### Paso 3 — Reportar instrucciones de registro por agente

Para **cada agente detectado que soporte hooks**, imprimir el bloque de registro correspondiente. Para los que no soportan hooks, listarlos como `omitidos`.

```
✅ Hook de proyecto creado: <name>
📁 Fuente única: docs/project/hooks/<name>.sh (chmod +x aplicado)

⚠️ NO auto-registrado. Instrucciones por agente instalado:

▸ Claude Code — agregá esto a .claude/settings.json:

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

▸ Cursor / Windsurf / Aider: (no soportan hooks — omitidos)

Próximo paso:
   1. Editá docs/project/hooks/<name>.sh y completá la lógica.
   2. Registralo en el agente correspondiente siguiendo las instrucciones de arriba.
```

Si ningún agente instalado soporta hooks → crear el archivo igual y advertir que quedará huérfano hasta instalar Claude Code.

## Validaciones

- Colisión de nombre → abortar.
- Falla `chmod` → reportar y avisar.
- NO tocar hooks de framework (`~/.fremi/framework/hooks/`).

## Referencias

- Template: [`references/hook-template.md`](references/hook-template.md).
- Detección y registro por agente: [`../../references/agent-detection.md`](../../references/agent-detection.md).
- Hooks del framework para inspiración: [`~/.fremi/framework/hooks/`](../../../../hooks/).
- Ver también: [`/fremi-delete-hook`](../delete-hook/SKILL.md).
