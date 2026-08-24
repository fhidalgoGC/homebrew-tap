# `~/.fremi/framework/reverse-engineering/reverse-story/hooks/` — Hooks del skill REVERSE-STORY

> Hooks del harness del agente que aplican al skill `/fremi-reverse-story`.
> Verifican precondiciones de la vía reverse antes de que la reconstrucción arranque.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-reverse-preconditions.sh` | UserPromptSubmit | prompt contiene `/fremi-reverse-story` | R24, R25, R30 | Verifica framework instalado, git history disponible y carpeta de features existente antes de iniciar. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` registra este hook automáticamente. Registro manual:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/reverse-engineering/reverse-story/hooks/check-reverse-preconditions.sh" }
        ]
      }
    ]
  }
}
```

---

## Exit codes

- **0** — OK o warning no bloqueante (default). El hook informa pero no impide la ejecución.
- **2** — Bloqueante (comentado en el script). Descomentar `# exit 2` para rigor estricto.

---

## Notas reverse-específicas

- **Upper-layer**: la feature padre debe existir antes de reconstruir la story. El hook
  verifica que `docs/works/features/` existe; la validación del feature ID específico la
  hace el skill en su paso 0.
- **R29 (Regla 8 inconstruible)**: este hook no detecta bugs previos — esa detección
  ocurre durante el procedimiento del skill. El stop event correspondiente está en
  `rules/stop-events.md`.
- **R30**: la ausencia de `.git/` genera un warning de confidence baja pero no aborta —
  el skill puede continuar con timestamps como "hoy" y `confidence: 0.3`.
