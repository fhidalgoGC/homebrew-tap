# Stop events del skill /fremi-reverse-story (dominio reverse-skill-story)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-story`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-story` es symlink válido
  y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no → abortar con:
  "Corré el CLI `fremi install` antes de invocar el skill."
- **Regla 25** — Trabajo mergeado/en producción. Si el código está en un branch
  experimental que sigue cambiando → abortar, sugerir esperar al merge.
- Feature padre existe: `docs/works/features/<feature-id>_<slug>/definition.md` real o
  reverse-engineerado previamente.
- La story a reconstruir NO existe todavía: confirmar que no hay folder story
  previo — si existe, abortar para no sobrescribir.
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`
(política `git_history.fallback_when_missing`).

---

## Stop events específicos (pausa el skill)

1. **Gap no-inferible — propósito de negocio** (Regla 27)
   El "So that" de la story (motivación de negocio para el usuario) no se puede
   inferir del código ni de los commits. Preguntar al usuario antes de redactar
   el doc definition.

2. **Gap no-inferible — iniciativa asociada** (Regla 27)
   El trabajo no puede vincularse a ninguna iniciativa del producto. Preguntar
   al usuario qué iniciativa impulsa esta story.

3. **Gap no-inferible — motivación de ADR** (Regla 27)
   El código revela que se tomó una decisión técnica (elección de librería, pattern,
   protocolo) pero el commit no explica el rationale. Preguntar al usuario la
   motivación antes de redactar el ADR retroactivo.

4. **Criterios de aceptación sin test asociado** (Regla 27)
   Un comportamiento evidente en el código no tiene test que lo cubra. Preguntar
   al usuario si es un gap real (falta test) o un CA fantasma (el negocio no lo
   pidió y el dev lo agregó).

5. **Requisitos no funcionales medibles no derivables del código** (Regla 27)
   Latencia esperada, throughput, tamaños de payload — no extraíbles del código
   en general. Preguntar valores concretos al usuario.

6. **Bifurcación técnica inferida** (Regla 3b retroactiva)
   El código muestra que se eligió una librería/pattern entre alternativas viables.
   Registrar ADR retroactivo (marcado `discovered_during_reverse: true`) — preguntar
   al usuario si esa fue la decisión real o accidental.

7. **Criterios de aceptación contradictorios entre tests y schemas**
   Un test asume comportamiento X, el schema exige Y. Pausar y pedir criterio
   al usuario.

8. **Regla 29 — Bugs previos detectados**
   Si durante la reconstrucción se detectan bugs previos ya fixeados sin registro,
   marcar la limitación: "test rojo no reconstruible retroactivamente" + recomendar
   `/fremi-reverse-bug <scope>/<story-id>` para cada uno.

9. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

10. **Confidence < `min_threshold`**
    Bajo 0.5 en `config.reverse.yaml`. Pausar y avisar al usuario que la corrida
    producirá docs marcados `needs_review: true`.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada escenario BDD reconstruido uno a uno.
- No pedir aprobación para cada campo del frontmatter (versión, timestamps).
- No preguntar por ADRs de decisiones ya explícitas en el código.
- No inventar "So that" o motivación de ADR para evitar la pausa — declarar el
  gap (Regla 27).
- No pedir el story ID: el usuario lo pasa como argumento al invocar el skill.

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: So that, iniciativa, motivación ADR, RNFs,
  CAs sin test.
- **Regla 28** — reverse no reemplaza revisión humana — reportar áreas a revisar.
- **Regla 29** — Regla 8 (test rojo) es inconstruible retroactivamente para bugs
  previos detectados.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear padres al firmar closure inferido (feature/definition.md,
  feature/decisions.md según parent_bump_triggers).
- **Regla 31** — si el código sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-story/SKILL.md` — procedimiento completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
