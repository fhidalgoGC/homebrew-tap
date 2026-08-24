# `~/.fremi/framework/reverse-engineering/reverse-enabler/rules/` — Reglas del skill REVERSE-ENABLER

> Reglas operativas del skill `/fremi-reverse-enabler`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de los 4 docs del enabler.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact enabler + suma las reglas reverse (R25-R32) + stop events específicos del skill. Documenta el scope variable (global / feature / story). |
| `stop-events.md` | Regla normativa de este skill: precondiciones que abortan, cuándo pausa (scope ambiguo, vinculaciones no claras, ADRs técnicos retroactivos, ambigüedad extra vs enabler). |
| `README.md` | Este archivo. |

---

## Scope variable

A diferencia de los otros skills reverse, `reverse-enabler` opera con 3 scopes posibles:

- **Global** (`docs/works/enablers/`) — enabler que habilita al producto entero.
- **Feature-scoped** (`docs/works/features/<feature-id>/enablers/`) — habilita una feature.
- **Story-scoped** (`docs/works/features/<feat>/user-stories/<story-id>/enablers/`) — habilita una story.

Las reglas transversales aplican a los 3. El stop event de "scope ambiguo" es
específico de este skill por este motivo.

---

## Diferencia con las reglas del artifact enabler

El artifact enabler tiene sus propias reglas en
`~/.fremi/framework/artifacts/enabler/rules/`. El skill reverse-enabler **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde IaC,
   scripts, dependencies y git history.
2. **Regla R15 explícita**: verificar criterio de activación de enabler (vs extra).

---

## Relación con el pipeline equivalente

El pipeline `/fremi-pipeline-reverse-enabler` orquesta la reconstrucción completa.
Sus reglas viven en: `~/.fremi/framework/pipelines/reverse-enabler/rules/`
