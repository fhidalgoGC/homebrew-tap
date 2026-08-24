# `~/.fremi/framework/reverse-engineering/reverse-feature/hooks/` — Hooks del skill REVERSE-FEATURE

> Hooks del harness del agente que aplican al skill `/fremi-reverse-feature`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-feature` | R24, R25, R30 | Verifica framework instalado, git history disponible y estructura mínima de docs/works/ antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-feature/hooks/check-reverse-preconditions.sh" }
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

- **Capa producto opcional**: el hook NO falla si `docs/works/product/` no existe — la
  feature se puede reconstruir sin capa producto, pero quedará sin vínculo a iniciativa.
  El skill advierte sobre esto en su paso 7.
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta.
