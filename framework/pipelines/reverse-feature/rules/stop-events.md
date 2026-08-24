# Regla de stop events del pipeline reverse-FEATURE (dominio pipeline-reverse-feature)

> **Regla operativa del pipeline reverse.** Define cuándo pausa para pedir input al usuario (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** DOMAIN-específico del pipeline `reverse-feature`. Se lee junto con `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondición dura (aborta el pipeline)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-story` es symlink válido y
  `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no está instalado →
  abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline."
- **Regla 25** — Trabajo en producción o mergeado a main. Si el código está en un branch
  experimental que sigue cambiando → abortar, sugerir esperar al merge.
- Existe el folder `docs/works/features/<FEATURE_ID>_<slug>/` (aunque `definition.md` esté
  vacío/faltante) O existe código identificable de la feature.
- Si `--skip-stories = false` (default): al menos 1 carpeta de story identificable bajo
  `user-stories/` o inferible del código.
- `config.reverse.yaml → active: true`.

---

## Stop events específicos (pausa el pipeline)

1. **Feature vs producto** — si al inferir el doc `definition` de la feature aparecen capacidades
   transversales que pertenecen a `product/definition.md`, pausar y sugerir sync-back
   (Regla 12) — proponer correr `/fremi-pipeline-reverse-product` primero si la capa
   producto tampoco existe.

2. **Story ambigua** — el código muestra 2 funcionalidades que podrían ser 1 o 2 stories.
   Pausar y preguntar al usuario cómo agruparlas (Regla 27).

3. **Iniciativa del producto no clara** — la feature debería vincular a una iniciativa
   del producto (formato configurable en methodology). Si no existe la capa producto o no hay iniciativa clara → preguntar al
   usuario o dejar sin vincular con warning (Regla 27).

4. **Conflictos entre stories** — si dos stories descubiertas comparten código de forma
   incompatible, pausar y clarificar el reparto al usuario.

5. **Sin git history** (con `--from-git-history` pedido pero `.git` ausente) — preguntar
   si continuar con `confidence: 0.3` o abortar (Regla 30).

6. **Confidence < `min_threshold`** — bajo 0.5 en `config.reverse.yaml` para la feature
   completa. Pausar y avisar al usuario antes de continuar con stories.

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar cada campo del `definition.md` reconstruido.
- No preguntar si incluir cada ADR descubierto.
- No pedir feedback tras cada story reconstruida (salvo `--mode interactive`).
- No inventar iniciativa vinculada — declarar el gap (Regla 27).

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps de iniciativa, stories ambiguas y conflictos.
- **Regla 28** — reverse no reemplaza revisión humana — reportar áreas a revisar.
- **Regla 30** — versionado con timestamps inferidos.
- **Regla 17** — bumpear product/plan.md al registrar la feature reconstruida.
- **Regla 12** — sync-back a producto activo durante la reconstrucción de feature/definition.
- **Regla 32** — reportar ratio reverse/forward al terminar.

---

## Referencias

- `~/.fremi/framework/pipelines/reverse-feature/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
