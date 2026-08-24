# Stop events del skill /fremi-reverse-feature (dominio reverse-skill-feature)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-feature`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-feature` es symlink válido
  y `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no → abortar.
- **Regla 25** — Trabajo mergeado/en producción. Si la feature sigue en desarrollo
  activo con cambios frecuentes → abortar y sugerir esperar a estabilización.
- El folder de la feature existe: `docs/works/features/<feature-id>_<slug>/`.
  Si no existe → abortar (usar `/fremi-feature` normal para feature nueva).
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`.

---

## Stop events específicos (pausa el skill)

1. **Gap no-inferible — iniciativa del producto** (Regla 27)
   No puede vincularse la feature a ninguna iniciativa del producto. Preguntar
   al usuario qué iniciativa impulsa esta feature.

2. **Gap no-inferible — métricas de éxito de la feature** (Regla 27)
   Las métricas de negocio (KPIs, conversión, retención) no son derivables del
   código. Preguntar al usuario qué métricas definen el éxito de esta feature.

3. **Gap no-inferible — motivación de ADR de feature** (Regla 27)
   Un ADR local a la feature fue implementado sin documentar el rationale. Preguntar
   al usuario la motivación antes de reconstruir el ADR.

4. **Capacidades transversales detectadas** (Regla 12)
   Durante la reconstrucción se detecta una restricción o decisión que aplica a
   múltiples features. Pausar y sugerir sync-back a la capa producto antes de
   continuar (no avanzar con el dato encerrado en la feature).

5. **Stories en conflicto**
   Dos stories bajo la feature tienen criterios de aceptación contradictorios.
   Pausar y pedir al usuario que aclare cuál prevalece.

6. **Ambigüedad de feature vs feature**
   El código bajo el folder parece pertenecer a dos features conceptualmente distintas.
   Preguntar al usuario si dividir en dos features o mantener como una.

7. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

8. **Capa producto no existe** (R12 preventivo)
   Si no existe `docs/works/product/` → advertir que la feature no puede vincularse
   a iniciativa. Preguntar si continuar sin vínculo o correr
   `/fremi-pipeline-reverse-product` primero.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada story de la feature individualmente.
- No pedir aprobación por cada campo del frontmatter.
- No inventar métricas de éxito para evitar la pausa — declarar el gap.
- No pedir el feature ID: el usuario lo pasa como argumento al invocar el skill.

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: iniciativa, métricas, motivación ADR.
- **Regla 28** — reverse no reemplaza revisión humana.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear product/plan.md (MINOR) si la feature no estaba listada.
- **Regla 12** — sync-back a producto si se detectan capacidades transversales.
- **Regla 31** — si la feature sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-feature/SKILL.md` — procedimiento completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/reverse-feature/rules/stop-events.md` — stop events
  del pipeline equivalente (superset de estos).
