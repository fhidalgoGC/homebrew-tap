# `~/.fremi/framework/artifacts/product/hooks/` — Hooks PRODUCT-DOMAIN

> Hooks del harness del agente que aplican **exclusivamente al workflow de product**. Verifican reglas domain-específicas (cadena discovery → formalización) sin cargar contexto de otras capas.

Los hooks CROSS-DOMAIN (Regla 17 versioning, frontmatter, ancestor coherence, session audit) viven en `~/.fremi/framework/hooks/`.

---

## Convención de identificadores

Los hooks resuelven filenames desde `~/.fremi/framework/settings/methodology.core.yaml → layers.product` en runtime, vía el helper cross-domain `~/.fremi/framework/hooks/_methodology.sh`. NO hardcodean filenames del workflow. Ver `.claude/rules/no-hardcoded-identifiers.md`.

---

## Hooks disponibles

| Hook | Evento | Matcher sugerido | Reglas | Rol |
|---|---|---|---|---|
| `check-product-sequence.sh` | PreToolUse | `Write` en `docs/works/product/*.md` | R1 + R4 | Verifica que los docs previos del workflow product existen antes de crear el siguiente. Lee la cadena desde methodology (`layers.product.stages_order`). |

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
          { "type": "command", "command": "~/.fremi/framework/artifacts/product/hooks/check-product-sequence.sh" }
        ]
      }
    ]
  }
}
```

---

## Reglas relacionadas

- **Regla 1** (no salta etapas) → `~/.fremi/framework/rules/hierarchy.md`
- **Regla 4** (discovery antes de formalización) → `~/.fremi/framework/artifacts/product/rules/discovery.md`

---

## Exit codes

- **0** — OK o warning no bloqueante (default).
- **2** — Bloquear con feedback (comentado; descomentar cuando el proyecto esté listo para rigor).
