---
name: fremi-pipeline-product
description: Pipeline de auto-ejecución de la capa PRODUCTO. Corre la secuencia canónica de discovery + formalización (iniciativas → ideas → planteamiento → definition → strategies → plan) sin pausar entre pasos, salvo bifurcaciones Regla 3b, información insuficiente o fallos de config. Invocar cuando el usuario quiere pasar de "tengo una idea de producto" a "producto formalizado con roadmap" en un solo tirón. Alternativa manual: invocar cada `/fremi-product-*` sub-skill uno por uno.
---

# /fremi-pipeline-product — Pipeline capa PRODUCTO

Corre en modo **automático** la secuencia declarada en [`~/.fremi/framework/skills/product/config.user.yaml → flow.sequence`](../skills/product/config.user.yaml).

**Fuente de verdad de la secuencia:** `config.product.yaml`. Este pipeline **NO duplica** la secuencia — la lee y la respeta. Si un step cambia allí, este pipeline se adapta automáticamente.

## Sintaxis

```
/fremi-pipeline-product <descripción libre del producto> [--mode interactive|auto]
```

- `<descripción libre>`: 2-3 frases con el problema del negocio, quiénes son los usuarios, qué esperan del producto. Cuanto más rico, menos stop events. Si el usuario no pasa nada → preguntar 3 cosas puntuales antes de arrancar (problema, usuarios, resultado esperado) y luego arrancar.
- `--mode` *(opcional)*: overridea el `execution_mode.pipeline_default` de `config.product.yaml`.

## Modo de ejecución

- **`auto`** *(default para pipelines)*: la IA compone iniciativas → ideas → planteamiento → definition → strategies → plan sin pausas. Cada sub-skill interno escribe su doc entero de un tirón y el pipeline arranca el siguiente sin preguntar. Pausa sólo ante stop events (bifurcaciones Regla 3b, info insuficiente, elecciones de stack con trade-offs no-triviales).
- **`interactive`**: cada sub-skill interno **sigue corriendo en `auto`** (escribe su doc completo de una), pero el pipeline pausa **entre steps** — al terminar iniciativas pregunta antes de arrancar ideas, al terminar ideas pregunta antes de planteamiento, y así hasta plan. Es "el pipeline con checkpoints por doc".

**Regla dura**: dentro del pipeline los sub-skills nunca reactivan modo interactivo. Si el usuario quiere validación por sección dentro de un doc específico (ej: validar cada init-XXX antes de escribirla), debe salirse del pipeline e invocar el skill suelto (ej: `/fremi-product-iniciativas --mode interactive`).

Consultar `config.product.yaml → execution_mode` para el default; en producto conviene por default `interactive` a nivel skill suelto (por el peso cascada a todas las features), pero `auto` a nivel pipeline (si se invoca el pipeline es porque hay contexto suficiente para correrlo derecho).

## Cuándo invocarlo

- Proyecto nuevo — no hay ningún doc en `docs/works/product/` todavía.
- Refresh de la capa producto — algún doc está roto/desactualizado y el usuario prefiere regenerar la cadena en lugar de auditar.
- Alternativa: si el usuario ya escribió `iniciativas.md` y quiere sólo formalizar de ahí, invocar `/fremi-product-ideas` manual y seguir de ahí.

## Cuándo NO invocarlo

- La capa producto ya está completa y sólo hace falta agregar un ADR → usar `/fremi-product-adr`.
- Se quiere agregar UNA idea nueva sin refresh completo → usar `/fremi-product-ideas`.
- Se quiere sólo el plan sin refresh de definition/strategies → usar `/fremi-product-plan`.

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-install-framework` es symlink válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si el framework no está instalado → abortar con: "Corré `/fremi-install-framework` antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.json` existe y parsea.
- `~/.fremi/framework/settings/config.yaml` + `config.product.yaml` existen y parsean.
- `config.product.yaml → active: true`.

Si falla alguna → abortar y avisar. **No fallback hardcoded.**

## Cadena de ejecución (auto)

El pipeline ejecuta en orden estricto los steps declarados en `config.product.yaml → flow.sequence`. Al 2026-07-13 la secuencia canónica es:

| # | Sub-skill invocado | Produce | Notas |
|---|---|---|---|
| 1 | `/fremi-product-iniciativas` | `product/iniciativas.md` | Discovery — hipótesis de negocio SAFe (`init-XXX`). El pipeline propone 1-3 iniciativas derivadas de la descripción inicial. |
| 2 | `/fremi-product-ideas` | `product/ideas.md` | Discovery — brainstorm de enfoques por cada iniciativa. Sin filtrar. |
| 3 | `/fremi-product-planteamiento` | `product/planteamiento.md` | Discovery — framing del problema + approach elegido. **Posible stop event** si aparecen approaches con trade-offs no-triviales (Regla 3b). |
| 4 | `/fremi-product-definition` | `product/definition.md` | Formalización — in-scope, capacidades, usuarios, glosario, criterios de éxito. |
| 5 | `/fremi-product-strategies` | `product/strategies.md` | Formalización — 2-3 estrategias técnicas globales. **Posible stop event** si la elección de stack requiere confirmación del usuario. Los ADRs derivados se registran automáticamente vía `/fremi-product-adr`. |
| 6 | `/fremi-product-plan` | `product/plan.md` | Formalización — roadmap de features priorizado. |

**No** correr sub-skills en paralelo — el flujo es secuencial por diseño (cada step consume el output del anterior, Regla 6 aplicada a la capa producto).

## Stop events específicos de esta capa

Además de los stop events genéricos definidos en el [README](README.md), este pipeline pausa cuando:

1. **Bifurcación en `planteamiento`.** Aparecen 2+ approaches viables para el problema principal → presentar opciones, esperar decisión, registrar como decisión de planteamiento (no ADR — el planteamiento es discovery, no arquitectura).
2. **Bifurcación en `strategies`.** Aparecen 2+ stacks/arquitecturas viables con trade-offs no-triviales → presentar opciones (pros/contras), esperar decisión, registrar `ADR-XXX` en `product/decisions.md` vía `/fremi-product-adr` **antes** de continuar al plan.
3. **`iniciativas` con 0 hipótesis derivables.** La descripción inicial no permite formular ni una `init-XXX`. Pedir al usuario 3 datos mínimos: problema, usuarios, resultado esperado.
4. **`definition` requiere criterios de éxito medibles y no hay datos.** Preguntar al usuario qué métrica define éxito (adopción, revenue, tiempo, calidad — 1-2 métricas).

**Anti-patrones (NO pausar por esto):**
- ❌ Confirmar cada nombre de iniciativa o cada capacidad in-scope.
- ❌ Preguntar el orden de items en `ideas.md`.
- ❌ Pedir feedback tras cada doc completado.

## Reglas del framework que aplican durante la ejecución

- **Regla 4** — Discovery antes de formalización. El pipeline respeta el orden `iniciativas → ideas → planteamiento` antes de tocar `definition`.
- **Regla 3b** — Toda bifurcación técnica pausa y produce ADR antes de continuar.
- **Regla 17** — Cada doc creado lleva frontmatter versionado (`version: 0.1.0` inicial para living docs) + entry en `## Changelog` con `origen: /fremi-pipeline-product`. Los sub-skills que lo generan ya aplican esto — el pipeline sólo verifica al final.
- **Regla 12** — No aplica sync-back porque producto es la capa raíz. Sí valida coherencia interna: cada capacidad en `definition.md` debe estar respaldada por al menos una iniciativa aceptada.

## Después del pipeline

Al terminar exitosamente, la capa producto queda con:

```
docs/works/product/
├── iniciativas.md    (v0.1.0+, con init-XXX declaradas)
├── ideas.md          (v0.1.0+, con brainstorm por iniciativa)
├── planteamiento.md  (v0.1.0+, con approach elegido)
├── definition.md     (v0.1.0+, in-scope + capacidades + criterios éxito)
├── strategies.md     (v0.1.0+, con estrategia elegida)
├── decisions.md      (v0.1.0+, con ADRs que hayan surgido)
└── plan.md           (v0.1.0+, con roadmap inicial — puede tener 0 features aún)
```

**Próximo paso natural:** `/fremi-pipeline-feature <nombre>` para arrancar la primera feature del roadmap.

## Reporte final (obligatorio)

Al terminar, la IA reporta:

1. **Qué se creó**: lista de archivos + versión inicial de cada uno.
2. **Iniciativas declaradas**: IDs + títulos.
3. **Estrategia técnica elegida**: nombre + ADR-XXX de referencia.
4. **Features en el plan**: cuántas quedaron listadas (puede ser 0 si el usuario prefiere agregarlas después).
5. **ADRs registrados durante el pipeline**: lista.
6. **Stop events que hubo**: qué preguntas se hicieron y qué respuestas se registraron.
7. **Próximo paso sugerido**: por default, `/fremi-pipeline-feature <slug-de-primera-feature>` si el plan tiene features; si no, `/fremi-product-plan` para agregarlas.

## Referencias

- Config operativa: [`~/.fremi/framework/skills/product/config.user.yaml`](../skills/product/config.user.yaml)
- Reglas: [`~/.fremi/framework/rules/workflow.md`](../rules/workflow.md) — Reglas 3b, 4, 12, 17.
- Flujo descriptivo: [`~/.fremi/framework/flows/flow.product.md`](../flows/flow.product.md)
- Orquestador manual: [`/fremi-product`](../skills/product/SKILL.md)
- Sub-skills: `~/.fremi/framework/skills/product/skills/`
