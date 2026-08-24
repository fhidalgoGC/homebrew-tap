# `~/.fremi/framework/reverse-engineering/reverse-bug/hooks/` — Hooks del skill REVERSE-BUG

> Hooks del harness del agente que aplican al skill `/fremi-reverse-bug`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-bug` | R24, R25, R29, R30 | Verifica framework instalado, git history disponible (crítico para el diff del fix) y estructura de features antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-bug/hooks/check-reverse-preconditions.sh" }
        ]
      }
    ]
  }
}
```

---

## Exit codes

- **0** — OK o warning no bloqueante (default).
- **2** — Bloqueante (comentado en el script). Descomentar para rigor estricto.

---

## Notas reverse-específicas

- **R29 siempre informada**: el hook incluye en su salida un recordatorio de que
  Regla 8 es inconstruible retroactivamente. No es un error — es información para
  el usuario sobre qué esperar del doc generado.
- **Git history es crítica para bug**: sin `.git/` no hay forma de obtener el diff
  del fix, que es la fuente principal de información. El warning es prominente.
- **Scope (story vs feature)**: el hook no valida el scope específico — el skill lo
  hace en su paso 0.
