# Regla de stop events del pipeline STORY (dominio pipeline-story)

> **Regla operativa del pipeline.** Define cuándo el pipeline PAUSA y espera
> decisión del usuario. Extiende los stop events genéricos declarados en
> `~/.fremi/framework/pipelines/README.md` con los específicos de la capa
> STORY.
>
> **Alcance:** este archivo es DOMAIN-específico del pipeline `story`. Se
> carga cuando se corre `/fremi-pipeline-story`. Sólo cubre los steps
> 0..8 (planificación — explore a plan). Los steps 9..12 (checkwork, verify,
> closure-check, closure) son post-pipeline.

---

## Stop events específicos de `/fremi-pipeline-story`

Además de los stop events genéricos (bifurcación R3b, sync-back R12,
precondición dura ausente, información insuficiente, fallo de tooling), este
pipeline pausa cuando:

1. **Conditional rule no inferible (Regla 16).** Antes del step explore (0) y
   del step proposal (2), el pipeline evalúa `explore_when` y `proposal_when`
   de `config.story.yaml`. **Autoevalúa** cuando la información inicial permite
   inferir con confianza. **Pausa y pregunta** cuando la información es ambigua
   — típicamente en stories de tamaño medio donde no está claro si aplica el
   criterio "3+ archivos", "contrato externo nuevo", etc.

2. **Bifurcación técnica en SDD/Design (Regla 3b).** Aparecen 2+ approaches
   viables (elección de protocolo, librería, wrapper, adapter…). Presenta
   opciones (pros/contras), espera decisión, registra un ADR vía
   `/fremi-story-adr` (delta local; se mergea al feature al cerrar la story
   vía Regla 17). **Antes** de continuar el artefacto donde nació la decisión.

3. **Sync-back a feature/producto (Regla 12).** Durante los steps scope, bdd o
   sdd el pipeline detecta que un contenido pertenece a la feature o al producto
   (capacidad nueva, restricción transversal, término técnico global). Pausa,
   presenta la divergencia, pregunta si actualizar arriba antes de continuar.

4. **CAs contradictorios o ambiguos.** Si al armar el step definition un CA no
   puede ser mapeado luego a un escenario BDD observable, pausar y pedir
   clarificación al usuario.

5. **Step `sdd` sin datos para RNFs medibles.** La spec exige RNFs medibles
   (latencia, throughput, tamaños). Si no se conocen del contexto, pedir al
   usuario 1-2 valores tentativos.

6. **Step `design` requiere elección de tecnología no en product/strategies.**
   El stack global de `product/strategies.md` no cubre la elección específica
   → subir a Regla 3b + registrar ADR en el scope correcto.

7. **Step `plan` con 0 tasks derivables.** El diseño no permite descomponer
   en tareas atómicas con criterios de completitud (Regla 7b). Pedir al usuario
   que aclare unidades de trabajo.

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar wording de cada CA, SC o TC.
- No preguntar cuántas tasks poner en el plan.
- No preguntar si un test cubre un CA específico — se mapea y listo.
- No pedir feedback tras cada doc completado (salvo `--mode interactive`).

---

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-story` es symlink
  válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si
  el framework no está instalado → abortar con: "Corré el CLI `fremi install`
  antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.core.yaml` + `config.story.yaml`
  existen y parsean.
- `config.story.yaml → active: true`.
- Feature `{FEATURE_ID}` existe en `docs/works/features/` y su `definition.md`
  tiene contenido real (no template vacío).
- Feature `definition.md` tiene frontmatter con `version` (Regla 17). Si no →
  avisar y proponer migrarla antes.

---

## Reglas del framework activas durante la ejecución

- **Regla 1** — No avanzar sin feature `definition.md`.
- **Regla 2** — El pipeline **no** escribe código; sólo docs de planificación.
- **Regla 3b** — Toda bifurcación técnica produce ADR antes de continuar.
- **Regla 6** — Cadena BDD → SDD → Design se respeta estrictamente. Cada
  artefacto sólo consume decisiones de artefactos previos.
- **Regla 7b** — El doc `plan` producido tiene tasks con criterios verificables
  (comando exit 0, test, archivo, métrica).
- **Regla 12** — Sync-back activo: no dejar divergencias silenciosas hacia
  feature/producto.
- **Regla 16** — Conditionals explore/proposal evaluados por `config.story.yaml`.
  Si aplican → se crean; si no → se omiten (sin placeholder vacío).
- **Regla 17** — Todos los docs creados llevan frontmatter versionado +
  `ancestor.version_at_creation` = versión del `definition.md` de la feature
  al momento de crear.

---

## Referencias

- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
- `~/.fremi/framework/pipelines/story/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/rules/workflow.md` — Reglas 1, 2, 3b, 6, 7b, 12, 16, 17.
