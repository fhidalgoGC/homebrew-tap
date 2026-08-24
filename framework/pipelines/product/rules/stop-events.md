# Regla de stop events del pipeline PRODUCT (dominio pipeline-product)

> **Regla operativa del pipeline.** Define cuándo el pipeline PAUSA y espera
> decisión del usuario. Extiende los stop events genéricos declarados en
> `~/.fremi/framework/pipelines/README.md` con los específicos de la capa
> PRODUCTO.
>
> **Alcance:** este archivo es DOMAIN-específico del pipeline `product`. Se
> carga cuando se corre `/fremi-pipeline-product`.

---

## Stop events específicos de `/fremi-pipeline-product`

Además de los stop events genéricos (bifurcación R3b, sync-back R12,
precondición dura ausente, información insuficiente, fallo de tooling), este
pipeline pausa cuando:

1. **Bifurcación en `planteamiento`.** Aparecen 2+ approaches viables para el
   problema principal → presentar opciones, esperar decisión, registrar como
   decisión de planteamiento (no ADR — el planteamiento es discovery, no
   arquitectura).

2. **Bifurcación en `strategies`.** Aparecen 2+ stacks/arquitecturas viables
   con trade-offs no-triviales → presentar opciones (pros/contras), esperar
   decisión, registrar un ADR en `product/decisions.md` vía
   `/fremi-product-adr` **antes** de continuar al plan.

3. **`iniciativas` con 0 hipótesis derivables.** La descripción inicial no
   permite formular ninguna iniciativa. Pedir al usuario 3 datos mínimos:
   problema, usuarios, resultado esperado.

4. **`definition` requiere criterios de éxito medibles y no hay datos.** Pedir
   al usuario qué métrica define éxito (adopción, revenue, tiempo, calidad —
   1-2 métricas concretas).

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar cada nombre de iniciativa ni cada capacidad in-scope.
- No preguntar el orden de items en `ideas.md`.
- No pedir feedback tras cada doc completado (salvo `--mode interactive`).

---

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-story` es symlink
  válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`.
  Si el framework no está instalado → abortar con: "Corré el CLI `fremi
  install` antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.core.yaml` existe y parsea.
- `~/.fremi/framework/settings/config.core.yaml` + `config.product.yaml`
  existen y parsean.
- `config.product.yaml → active: true`.

---

## Reglas del framework activas durante la ejecución

- **Regla 4** — Discovery antes de formalización. El pipeline respeta el orden
  `iniciativas → ideas → planteamiento` antes de tocar `definition`.
- **Regla 3b** — Toda bifurcación técnica pausa y produce ADR antes de
  continuar.
- **Regla 17** — Cada doc creado lleva frontmatter versionado (`version: 0.1.0`
  inicial para living docs) + entry en `## Changelog` con
  `origen: /fremi-pipeline-product`. Los sub-skills ya aplican esto — el
  pipeline sólo verifica al final.
- **Regla 12** — No aplica sync-back upward porque product es la capa raíz.
  Sí valida coherencia interna: cada capacidad en `definition.md` debe estar
  respaldada por al menos una iniciativa aceptada.

---

## Referencias

- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
- `~/.fremi/framework/pipelines/product/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/rules/workflow.md` — Reglas 3b, 4, 12, 17.
