# Stop events del skill /fremi-reverse-enabler (dominio reverse-skill-enabler)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-enabler`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.
>
> **Scope variable:** global / feature-scoped / story-scoped (Regla 15 + 20).

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-enabler` es symlink válido
  y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no → abortar.
- **Regla 25** — Enabler en producción. Si la infra/tooling está en branch experimental
  que sigue cambiando → abortar y esperar al merge.
- Si scope es `feature` o `story`: la upper-layer correspondiente debe existir.
  Si no existe → abortar y sugerir correr el reverse de la upper-layer primero.
- El slug del enabler no debe colisionar con un enabler existente en el mismo scope.
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`.

---

## Stop events específicos (pausa el skill)

1. **Scope ambiguo** (Regla 27)
   No está claro si el enabler es global, de feature o de story. Preguntar al usuario:
   ¿este enabler habilita capacidad para el producto entero, para una feature específica,
   o para una story concreta?

2. **Numeración de enabler en conflicto**
   El próximo número global calculado colisiona con un enabler existente en otro scope.
   Pausar y confirmar la numeración con el usuario antes de continuar.

3. **Features/stories vinculadas no identificables** (Regla 27)
   No puede determinarse desde el código qué features o stories dependen del enabler.
   Preguntar al usuario: ¿qué features/stories se desbloquean con este enabler?

4. **Gap no-inferible — capacidad habilitada** (Regla 27)
   La capacidad técnica que habilita el enabler no es clara desde el IaC/scripts.
   Preguntar al usuario: ¿qué capacidad entrega este enabler?

5. **ADR técnico retroactivo sin rationale** (Regla 27 + Regla 3b)
   El IaC/config revela una decisión técnica (ej: elección de runtime, tooling)
   pero no hay documentación del por qué. Preguntar al usuario el rationale antes
   de registrar el ADR con `discovered_during_reverse: true`.

6. **Ambigüedad extra vs enabler** (Regla 14 vs 15)
   No está claro si el trabajo es un enabler (habilita capacidad futura) o un extra
   (tooling/refactor sin habilitar nada nuevo). Preguntar al usuario: ¿este trabajo
   desbloquea o degrada alguna feature/story si no existe?

7. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada recurso IaC individualmente.
- No pedir aprobación para cada campo del frontmatter.
- No inventar la capacidad habilitada — declarar el gap y preguntar.
- No asumir que "parece que vincula" con una feature — validar con el usuario.

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: scope, vinculaciones, capacidad habilitada,
  rationale de ADRs técnicos.
- **Regla 28** — reverse no reemplaza revisión humana.
- **Regla 29** — N/A para enablers (Regla 8 aplica sólo a bugs).
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear padre según scope al firmar closure.
- **Regla 15** — verificar criterio de activación de enabler (vs extra).
- **Regla 31** — si la infra sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-enabler/SKILL.md` — procedimiento.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/reverse-enabler/rules/stop-events.md` — stop events
  del pipeline equivalente (superset de estos).
