# Regla de stop events del pipeline reverse-ENABLER (dominio pipeline-reverse-enabler)

> **Regla operativa del pipeline reverse.** Define cuándo pausa para pedir input al usuario (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** DOMAIN-específico del pipeline `reverse-enabler`. Se lee junto con `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondición dura (aborta el pipeline)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-story` es symlink válido y
  `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no está instalado →
  abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline."
- **Regla 25** — Infra/tooling en producción — no experimental. Artifacts identificables:
  al menos UNO de → IaC file cambiado, package instalado, layer creado, script de tooling
  agregado, workflow CI/CD agregado.
- `config.reverse.yaml → active: true`.
- Si `--scope feature`: la feature padre existe (o se reverse-engineerea primero).
- Si `--scope story`: la story padre existe (con `definition.md` real o reverse-engineerada previamente).

---

## Stop events específicos (pausa el pipeline)

1. **Scope ambiguo** — si el enabler afecta varias features → preguntar si global o
   feature-específico (Regla 27). Recomendación: cuando duda, global.

2. **Numeración enabler ID** — asignar el próximo `enabler ID` global. Si hay conflicto (ej: se
   descubren múltiples enablers a la vez) → serializar la numeración (Regla 17 —
   numeración global se serializa). Pausar si la numeración es ambigua.

3. **Features/stories vinculadas** — el enabler debe declarar qué habilita. Si no está
   claro cuáles features/stories habilita → preguntar al usuario (Regla 27).

4. **ADRs retroactivos técnicos** — la elección de IaC tool, runtime version, package, etc.
   fue una decisión con opciones (Regla 3b retroactiva). Registrar ADR con
   `discovered_during_reverse: true` — preguntar rationale al usuario (Regla 27) o
   marcar `discovered_during_reverse: true`.

5. **Regla 8 y bugs de infra** — si el enabler nació como fix de un bug de infraestructura,
   marcar Regla 29 (test rojo no reconstruible retroactivamente) + sugerir `/fremi-reverse-bug`.

6. **Sin git history** (con `--from-git-history` pedido pero `.git` ausente) — preguntar si
   continuar con `confidence: 0.3` o abortar (Regla 30).

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar cada campo de el doc `definition` del enabler.
- No preguntar si listar cada archivo modificado por el enabler.
- No inventar features vinculadas — declarar el gap (Regla 27).
- No crear un enabler para trabajo que es `extra/` (Regla 14) — verificar criterio de
  activación de Regla 15 antes de continuar.

---

## Reglas del framework activas

- **Regla 15** — enabler es artefacto opcional; criterio de activación debe cumplirse.
- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por scope, features vinculadas, rationale de ADRs.
- **Regla 28** — reverse no reemplaza revisión humana.
- **Regla 29** — N/A para enabler (aplica sólo a bugs). Si hubo bug de infra → marcar
  la limitación y sugerir `/fremi-reverse-bug`.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear el padre según scope al firmar el doc `closure` del enabler.
- **Regla 3b** — ADRs retroactivos por decisiones técnicas descubiertas.
- **Regla 20** — scope correcto para ADRs (producto/feature/story según el alcance).

---

## Nota: scope variable

El pipeline acepta `--scope global|feature <feature-id>|story <feature-id>/<story-id>` (formato de IDs configurable en methodology). Esto afecta:
- La ubicación donde se crean los docs los 4 docs del workflow enabler (por default `EN-01..EN-04`).
- El padre que se bumpea al firmar el doc `closure` del enabler.
- La upper-layer precondition verificada por el hook.

El scope se resuelve durante la fase 0 (descubrimiento). Si no está claro → stop event
"Scope ambiguo" (ítem 1 arriba). Recomendación: cuando duda → global.

---

## Referencias

- `~/.fremi/framework/pipelines/reverse-enabler/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/rules/workflow.md` — Regla 15 (enablers).
- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
