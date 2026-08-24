# Regla de stop events del pipeline FEATURE (dominio pipeline-feature)

> **Regla operativa del pipeline.** Define cuándo el pipeline PAUSA y espera
> decisión del usuario. Extiende los stop events genéricos declarados en
> `~/.fremi/framework/pipelines/README.md` con los específicos de la capa
> FEATURE.
>
> **Alcance:** este archivo es DOMAIN-específico del pipeline `feature`. Se
> carga cuando se corre `/fremi-pipeline-feature`.

---

## Stop events específicos de `/fremi-pipeline-feature`

Además de los stop events genéricos (bifurcación R3b, sync-back R12,
precondición dura ausente, información insuficiente, fallo de tooling), este
pipeline pausa cuando:

1. **Sync-back a producto necesario (Regla 12).** El pipeline detecta que la
   feature introduce una capacidad, restricción o término que **no** está en
   `product/definition.md` y **parece transversal**. Presenta al usuario el gap
   y propone: (a) actualizar `product/definition.md` antes de continuar, o (b)
   marcar como específico de la feature y proceder. Espera decisión.

2. **Bifurcación técnica en `definition.md` (Regla 3b).** El usuario dio
   información que implica 2+ approaches viables para satisfacer la feature.
   Presenta opciones (pros/contras), espera decisión, registra un ADR en el
   scope apropiado vía `/fremi-product-adr` o `/fremi-feature-adr` según
   Regla 20.

3. **Feature colisiona con existente.** El slug o la funcionalidad matchea una
   feature ya presente en el plan. Preguntar si el usuario quiere: (a) usar la
   feature existente, (b) crear con slug alternativo, (c) marcar la anterior
   como reemplazada.

4. **`plan.md` de producto no menciona la feature ni permite deducir prioridad.**
   El pipeline puede agregarla igual, pero necesita saber prioridad tentativa
   (alta/media/baja) para la entry del roadmap.

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar el orden exacto de capacidades listadas.
- No preguntar por el wording del título de la feature.
- No preguntar si se hace el bump de `plan.md` — es obligatorio (Regla 17), se
  hace sin preguntar.

---

## Precondiciones duras (abortan el pipeline)

- **Regla 24 — Framework instalado**: `.claude/skills/fremi-story` es symlink
  válido y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si
  el framework no está instalado → abortar con: "Corré el CLI `fremi install`
  antes de invocar el pipeline". **No auto-instalar.**
- `~/.fremi/framework/settings/methodology.core.yaml` + `config.feature.yaml`
  existen y parsean.
- `config.feature.yaml → active: true`.
- `docs/works/product/definition.md` existe **con contenido real** (no template
  vacío).
- `docs/works/product/plan.md` existe **con contenido real** (aunque tenga 0
  features listadas — el pipeline puede agregar la primera).

---

## Reglas del framework activas durante la ejecución

- **Regla 1** — No avanzar sin `product/definition.md` + `product/plan.md`.
- **Regla 3b** — Toda bifurcación produce ADR antes de continuar.
- **Regla 12** — Sync-back activo: no dejar divergencias silenciosas.
- **Regla 17** — Bump del `plan.md` padre + captura `ancestor.version_at_creation`
  en el `definition.md` de la feature.
- **Regla 20** — ADRs al scope correcto: transversales → producto; locales →
  feature.

---

## Referencias

- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
- `~/.fremi/framework/pipelines/feature/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/rules/workflow.md` — Reglas 1, 3b, 12, 17, 20.
