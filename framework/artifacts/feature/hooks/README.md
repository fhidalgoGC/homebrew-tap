# `~/.fremi/framework/artifacts/feature/hooks/` — Hooks FEATURE-DOMAIN

> Hooks del harness del agente que aplican **exclusivamente al workflow de feature**. Verifican reglas domain-específicas (precondición de producto para crear feature, opcionalidad de `decisions.md`).

Los hooks CROSS-DOMAIN (Regla 17 versioning, frontmatter, ancestor coherence, session audit) viven en `~/.fremi/framework/hooks/`.

---

## Convención de identificadores

Feature tiene filenames FIJOS (`definition.md`, `decisions.md`) — no dependen del prefijo configurable. El prefijo del folder de feature (`FT-` default) sí es configurable via methodology, pero los hooks lo detectan por path pattern (`docs/works/features/*/`). Ver `.claude/rules/no-hardcoded-identifiers.md`.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-feature-preconditions.sh` | PreToolUse | `Write` en `docs/works/features/*/definition.md` | R1 + R17 | Antes de crear una feature, verifica que `product/definition.md` y `product/plan.md` existen con contenido. Sin producto listo → no se puede crear feature ni capturar `ancestor.version_at_creation`. |
| `check-feature-decisions.sh` | PreToolUse | `Write` en `docs/works/features/*/decisions.md` | R15 | Cuando se crea `decisions.md` de una feature, recuerda que es CONDICIONAL — sólo se crea si la feature tiene ADRs LOCALES (no transversales). Los ADRs transversales van a `product/decisions.md`. |

---

## Cómo registrar en `.claude/settings.json`

`fremi install` los registra automáticamente. Registro manual:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "~/.fremi/framework/artifacts/feature/hooks/check-feature-preconditions.sh" },
          { "type": "command", "command": "~/.fremi/framework/artifacts/feature/hooks/check-feature-decisions.sh" }
        ]
      }
    ]
  }
}
```

---

## Reglas relacionadas

- **Regla 1** (no salta etapas) → `~/.fremi/framework/rules/hierarchy.md`
- **Regla 15** (artefactos opcionales — `decisions.md` de feature condicional) → `~/.fremi/framework/artifacts/story/rules/bugs.md`
- **Regla 17** (versionado — `ancestor.version_at_creation`) → `~/.fremi/framework/rules/versioning.md`

Fuente de verdad del criterio `decisions.md` condicional: `config.user.yaml → conditional_rules.feature_decisions_when`.

---

## Exit codes

- **0** — OK o warning no bloqueante (default).
- **2** — Bloquear con feedback (comentado; descomentar cuando el proyecto esté listo para rigor).
