# `~/.fremi/framework/reverse-engineering/reverse-enabler/hooks/` — Hooks del skill REVERSE-ENABLER

> Hooks del harness del agente que aplican al skill `/fremi-reverse-enabler`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-enabler` | R24, R25, R30, R15 | Verifica framework instalado, git history disponible y upper-layer correcta según scope (global / feature / story). |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-enabler/hooks/check-reverse-preconditions.sh" }
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

- **Scope variable**: el hook extrae el `--scope` del prompt para verificar la
  upper-layer correcta. Scope global: sin upper-layer. Scope feature/story:
  verifica existencia de `docs/works/features/`.
- **R15 (enabler vs extra)**: el hook no puede resolver esta ambigüedad — el skill
  lo maneja como stop event en su procedimiento.
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta.
