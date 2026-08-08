# `~/.fremi/framework/artifacts/` — Artifacts SAFe

> **Cada subcarpeta representa una capa del flujo Product Discovery + SDD + BDD + TDD alineado a SAFe.** Producto → Feature → Story → Enabler, más el archivo suelto de trabajo lateral (Extra).
>
> Cada capa tiene su orquestador skill (`/fremi-<capa>`), sub-skills (bajo `<capa>/skills/`), config estructural (`config.core.yaml`) y config editable (`config.user.yaml`).
>
> Skills que NO son artifacts (tools, sync-check) viven en [`../skills/`](../skills/). Skills de reverse-engineering viven en [`../reverse-engineering/`](../reverse-engineering/).

---

## Capas

| Capa | Orquestador | Contenido | Cuándo |
|---|---|---|---|
| [`product/`](product/) | `/fremi-product` | 7 docs — iniciativas → ideas → planteamiento → definition → strategies → decisions → plan | Al arrancar el proyecto o al re-scoping del producto entero. |
| [`feature/`](feature/) | `/fremi-feature <nombre>` | `FT-XX/definition.md` + `decisions.md` (opcional) | Al agregar una línea de trabajo grande dentro del producto. |
| [`story/`](story/) | `/fremi-story <FT-XX> <nombre>` | Cadena `FW-00..FW-10` (11 docs) + `bugs/` + `decisions.md` | Unidad mínima de valor dentro de una feature. |
| [`enabler/`](enabler/) | `/fremi-enabler <nombre> --scope <global\|feature\|story>` | Cadena `EN-01..EN-04` (4 docs) | Trabajo técnico que habilita capacidad futura sin entregar valor user-facing directo. |
| [`extra/`](extra/) | `/fremi-extra <slug>` | Archivo único `EX-NN_<slug>.md` | Trabajo fuera del flujo (Regla 14) — tooling, refactor sin cambio de comportamiento, mejoras a metodología. |

---

## Anatomía uniforme de cada capa

```
<capa>/
├── SKILL.md                    ← orquestador (invocable como /fremi-<capa>)
├── config.core.yaml            ← estructural — no user-editable
├── config.user.yaml            ← template de overrides per-project
├── references/                 ← templates canónicos de sus docs
└── skills/                     ← sub-skills invocables (uno por doc/action)
    └── <sub>/
        ├── SKILL.md
        └── references/         ← template del doc que produce
```

Bugs viven **dentro** del scope al que pertenecen:
- `story/skills/bug/` → `/fremi-story-bug` (bug atribuible a UNA story)
- `feature/skills/bug/` → `/fremi-feature-bug` (bug transversal a la feature)

## Categorías fuera de esta carpeta

- **Utility skills** (tools/, sync-check/) — [`../skills/`](../skills/). No son artifacts, son herramientas.
- **Reverse engineering** — [`../reverse-engineering/`](../reverse-engineering/). Reconstruyen artifacts desde código pre-existente.
- **Pipelines de auto-ejecución** — [`../pipelines/`](../pipelines/). Orquestan la ejecución de sub-skills de una capa.
- **Settings globales** — [`../settings/`](../settings/). Agents, models, methodology, master config.
