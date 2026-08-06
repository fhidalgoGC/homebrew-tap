---
name: fremi-product
description: Orquestador de la capa PRODUCTO. Coordina discovery y formalización del producto (iniciativas, ideas, planteamiento, definition, strategies, decisions, plan). Los sub-skills viven en `product/skills/`: `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento` (discovery) y `/fremi-product-adr` (ADRs globales). Se invoca cuando el usuario quiere arrancar o auditar la capa producto completa.
---

# /fremi-product — Orquestador de la capa PRODUCTO

Orquesta la capa PRODUCTO del framework. **No** puebla docs directamente — delega en los sub-skills especializados de `product/skills/`.

**Rol**: coordinar los skills que crean/actualizan documentos de producto y validar que el discovery esté completo antes de arrancar features.

## Estructura de la capa

```
docs/works/product/
├── iniciativas.md        ← discovery: objetivos estratégicos (product-idea)
├── ideas.md              ← discovery: brainstorm (product-idea)
├── planteamiento.md      ← discovery: framing + approach (product-idea)
├── definition.md         ← formalización: qué producto construimos
├── strategies.md         ← formalización: estrategias técnicas
├── decisions.md          ← ADRs globales (product-adr)
└── plan.md               ← roadmap de features
```

## Sub-skills disponibles (`product/skills/`) — 7 skills, 1 por doc

### 🟪 Discovery (divergente — explora sin decidir)

| # | Sub-skill | Rol | Doc que produce | Precondición |
|---|---|---|---|---|
| 1 | `/fremi-product-iniciativas` | Hipótesis de negocio SAFe | `iniciativas.md` | — (raíz) |
| 2 | `/fremi-product-ideas` | Brainstorm de enfoques | `ideas.md` | iniciativas |
| 3 | `/fremi-product-planteamiento` | Framing + approach elegido | `planteamiento.md` | ideas |

### 🟫 Formalización (convergente — define)

| # | Sub-skill | Rol | Doc que produce | Precondición |
|---|---|---|---|---|
| 4 | `/fremi-product-definition` | Producto formal (in-scope, capacidades, usuarios) | `definition.md` | planteamiento |
| 5 | `/fremi-product-strategies` | Estrategias técnicas globales (2-3 opciones) | `strategies.md` | definition |
| 6 | `/fremi-product-adr` | ADRs globales acumulativos | Entries en `decisions.md` | any (transversal) |
| 7 | `/fremi-product-plan` | Roadmap de features priorizado | `plan.md` | definition + strategies |

## Sintaxis

```
/fremi-product [audit|status]
```

- `/fremi-product audit` — audita el estado de la capa (qué docs existen, cuáles faltan, coherencia).
- `/fremi-product status` — reporta versión de cada doc living, changelogs recientes.

## Cuándo invocarlo

- Al arrancar un proyecto — verificar qué falta de la capa producto.
- Cuando se quiere hacer un walkthrough de producto (que sub-skills correr).
- Antes de crear una feature — verificar que discovery + formalización estén completos.

## Cuándo NO invocarlo

- Para agregar UN doc de discovery — usar `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento` directo.
- Para agregar UN ADR — usar `/fremi-product-adr` directo.
- Para trabajos técnicos que no son de producto (feature, story, enabler) — otros skills.

## Referencias

- Sub-skills: `~/.fremi/framework/framework/skills/product/skills/`.
- Regla 4 (Discovery antes de formalización) en `~/.fremi/framework/framework/rules/workflow.md`.
- `~/.fremi/framework/framework/skills/product/config.user.yaml`.
