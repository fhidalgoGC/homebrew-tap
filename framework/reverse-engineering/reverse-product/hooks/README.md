# `~/.fremi/framework/reverse-engineering/reverse-product/hooks/` — Hooks del skill REVERSE-PRODUCT

> Hooks del harness del agente que aplican al skill `/fremi-reverse-product`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-product` | R24, R25, R30 | Verifica framework instalado, git history disponible y existencia de al menos una feature antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-product/hooks/check-reverse-preconditions.sh" }
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

- **Capa raíz**: reverse-product no tiene upper-layer — es el caso más alto de la
  jerarquía. El hook sólo verifica que al menos `docs/works/features/` exista para
  tener material de reconstrucción.
- **Riesgo de racionalización post-hoc**: el hook no puede detectar esto — el skill
  emite la advertencia obligatoria al arrancar (ver `rules/stop-events.md`).
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta.
