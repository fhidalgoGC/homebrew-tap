# `~/.fremi/framework/reverse-engineering/reverse-extra/hooks/` — Hooks del skill REVERSE-EXTRA

> Hooks del harness del agente que aplican al skill `/fremi-reverse-extra`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-extra` | R24, R14, R25, R30 | Verifica framework instalado y git history. Informa si `docs/works/extra/` no existe (el skill la crea). |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-extra/hooks/check-reverse-preconditions.sh" }
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

- **Sin upper-layer**: `extra/` no depende de ninguna feature ni story. El hook no
  tiene upper-layer que verificar.
- **Creación de carpeta**: si `docs/works/extra/` no existe, el hook emite un aviso
  informativo (no error) — el skill la creará automáticamente al generar el primer doc.
- **R14 (trabajo fuera del flujo)**: el hook no puede verificar esto — el skill lo
  resuelve con stop events en su procedimiento (Regla 27).
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta.
