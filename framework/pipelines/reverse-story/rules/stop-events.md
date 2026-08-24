# Regla de stop events del pipeline reverse-STORY (dominio pipeline-reverse-story)

> **Regla operativa del pipeline reverse.** Define cuándo pausa para pedir input al usuario (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** DOMAIN-específico del pipeline `reverse-story`. Se lee junto con `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondición dura (aborta el pipeline)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-story` es symlink válido y
  `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no está instalado →
  abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline."
- **Regla 25** — Trabajo mergeado/en producción. Si el código está en un branch experimental
  que sigue cambiando → abortar, sugerir esperar al merge.
- Feature `<FEATURE_ID>` existe: `docs/works/features/<FEATURE_ID>_<slug>/` con
  `definition.md` real o reverse-engineerada previamente.
- El código correspondiente a la story existe: `src/functions/<lambda>/` o equivalente
  identificable.
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`
(política `git_history.fallback_when_missing`).

---

## Stop events específicos (pausa el pipeline)

1. **Gap no-inferible** (Regla 27) — `So that`, iniciativa, motivación ADR, RNFs, CAs sin test.
   En interactive pregunta ahora; en auto acumula y pregunta al final de fase 2.

2. **Bifurcación técnica inferida** (Regla 3b) — el código muestra que se eligió una
   librería/pattern entre alternativas viables. Registrar ADR retroactivo (marcado
   `discovered_during_reverse: true`) — preguntar al usuario si esa fue la decisión real
   o accidental.

3. **CAs contradictorios entre tests y schemas** — un test asume comportamiento X, el schema
   exige Y. Pausar y pedir criterio al usuario.

4. **Sin git history** — con `--from-git-history` pedido pero `.git` ausente. Preguntar si
   continuar con `confidence: 0.3` o abortar.

5. **Confidence < `min_threshold`** — bajo 0.5 en `config.reverse.yaml`. Pausar y avisar al
   usuario que la corrida producirá docs marcados `needs_review: true`.

6. **Regla 32 activada** — ratio reverse/forward superó umbral. Pausar y notificar (no bloquea).

7. **Regla 29 — Bugs previos detectados** — si durante la reconstrucción se detectan bugs
   previos ya fixeados sin registro, marcar la limitación: "test rojo no reconstruible
   retroactivamente" + recomendar `/fremi-reverse-bug <feature-id>/<story-id>` para cada uno.

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar cada escenario BDD reconstruido uno a uno.
- No pedir aprobación para cada campo del frontmatter (versión, timestamps).
- No preguntar por ADRs de decisiones que ya están explícitamente en el código.
- No inventar `So that` o motivación de ADR para evitar la pausa — declarar el gap (Regla 27).

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: So that, iniciativa, motivación ADR, RNFs, CAs sin test.
- **Regla 28** — reverse no reemplaza revisión humana — reportar áreas a revisar.
- **Regla 29** — Regla 8 (test rojo) es inconstruible retroactivamente para bugs previos.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear padres al firmar closure inferido (feature/spec.md, feature/decisions.md,
  feature/definition.md según parent_bump_triggers).
- **Regla 31** — si el código sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/pipelines/reverse-story/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
