# Stop events del skill /fremi-reverse-extra (dominio reverse-skill-extra)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-extra`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.
>
> **Nota sobre extra:** reverse-extra es la ÚNICA forma programática de crear un
> doc extra — no existe un skill de forward (config.extra.yaml → flow.sequence: []).

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. Al menos un orquestador (`fremi-story`,
  `fremi-feature`) es symlink válido en `.claude/skills/` y `CLAUDE.md` referencia
  `~/.fremi/framework/rules/workflow.md`. Si no → abortar.
- **Regla 25** — El trabajo ya está mergeado/en producción. Si el trabajo está en
  un branch experimental que sigue cambiando → abortar.
- El trabajo es genuinamente fuera-del-flujo (Regla 14): no tiene comportamiento
  user-facing, no habilita capacidad futura como enabler, no es spec-driven. Si
  alguna de estas condiciones aplica → abortar y sugerir el skill reverse correcto
  (`/fremi-reverse-story`, `/fremi-reverse-enabler`).
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`.

---

## Stop events específicos (pausa el skill)

1. **Cohesión del trabajo dudosa** (Regla 14 + Regla 27)
   Los commits identificados por el usuario mezclan conceptos claramente distintos.
   Pausar y preguntar: ¿dividir en múltiples docs (uno por concepto) o mantener
   como uno? Si se dividen → invocar el skill múltiples veces.

2. **Gap no-inferible — concepto cohesivo** (Regla 27)
   No puede determinarse qué concepto unifica el trabajo desde los commits/archivos.
   Preguntar al usuario: ¿cómo denominarías este trabajo en 3-5 palabras?

3. **Ambigüedad extra vs story/enabler** (Regla 14 + Regla 27)
   Durante el escaneo aparece código que podría ser user-facing o habilitar capacidad
   futura. Preguntar al usuario: ¿este trabajo genera un comportamiento observable
   por el usuario, o habilita algo que features futuras van a usar? Si sí → sugerir
   el skill reverse correcto.

4. **Gap no-inferible — justificación de por qué no es feature/story** (Regla 27)
   La sección `why-not-feature-story-task` no puede construirse con certeza desde el
   código. Preguntar al usuario: ¿por qué este trabajo no amerita una story?

5. **Validación/comandos de verificación no derivables del código** (Regla 27)
   No hay tests ni comandos de build/lint que verifiquen el cambio. Preguntar al
   usuario: ¿cómo se verifica que el cambio funciona?

6. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada archivo cambiado individualmente.
- No pedir aprobación para el frontmatter.
- No inventar el concepto cohesivo — preguntar al usuario.
- No forzar un solo doc cuando claramente hay múltiples conceptos distintos.

---

## Reglas del framework activas

- **Regla 25** — precondición dura: trabajo mergeado/en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: concepto cohesivo, justificación de extra,
  validación del cambio.
- **Regla 28** — reverse no reemplaza revisión humana.
- **Regla 29** — N/A para extra (Regla 8 aplica sólo a bugs).
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — docs extra son snapshots con ancestor.id: global (sin padre que
  bumpear).
- **Regla 14** — validar que el trabajo genuinamente es extra (no feature/story/enabler).
- **Regla 31** — si el trabajo sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-extra/SKILL.md` — procedimiento.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/rules/workflow.md` — Regla 14 (trabajo fuera del flujo).
