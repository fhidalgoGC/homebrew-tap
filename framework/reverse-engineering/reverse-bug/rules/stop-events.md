# Stop events del skill /fremi-reverse-bug (dominio reverse-skill-bug)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-bug`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.
>
> **Regla 29 siempre activa:** Regla 8 (test rojo primero) es INCONSTRUIBLE
> retroactivamente. No es un stop event — es una limitación declarada en el doc
> resultado como dato de hecho.

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. Al menos `fremi-story` o `fremi-feature` es
  symlink válido en `.claude/skills/` y `CLAUDE.md` referencia
  `~/.fremi/framework/rules/workflow.md`. Si no → abortar.
- **Regla 25** — El fix ya está mergeado/en producción. Si el fix está en un branch
  experimental que sigue cambiando → abortar.
- El scope declarado (story o feature) existe: el folder correspondiente debe existir
  en `docs/works/`. Si no existe → abortar y sugerir correr el reverse del scope padre.
- El comportamiento "incorrecto" está cubierto en alguna story/feature (Regla 15):
  si nadie recuerda la spec que el bug violó → no es bug reverse, es gap de spec.
  Sugerir crear/extender la story primero.
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`.

---

## Limitación declarada (NO pausa — se documenta siempre en el resultado)

**Regla 29 — Test rojo inconstruible retroactivamente:**
El skill SIEMPRE documenta en la sección `reproduction-red-test` del doc generado:
> "Regla 8 (test rojo primero) no aplica retroactivamente — el fix ya está aplicado
> y los tests actuales pasan. No hay forma de recrear el estado pre-fix para escribir
> el test rojo previo."
Si el bug es reciente (< 1 mes), sugerir que el equipo agregue un test de regresión
corriendo `git checkout <pre-fix-commit>` para validar la reproducción.

---

## Stop events específicos (pausa el skill)

1. **Gap no-inferible — síntoma observado** (Regla 27)
   El diff del fix no describe qué se observaba como error. Preguntar al usuario:
   ¿qué síntoma veían en producción/staging antes del fix?

2. **Gap no-inferible — impacto y severidad** (Regla 27)
   La severidad del bug no es determinable del diff. Preguntar al usuario:
   ¿Alto / Medio / Bajo? ¿Afectaba a todos los usuarios o a un subconjunto?

3. **Gap no-inferible — root-cause** (Regla 27)
   El diff muestra qué cambió pero no por qué el sistema se comportaba mal.
   Preguntar al usuario (o al dev original) por la causa raíz.

4. **Scope ambiguo — story vs feature** (Regla 27)
   No está claro si el bug es atribuible a una story concreta o es transversal
   a la feature. Preguntar al usuario: ¿qué story específica introdujo este
   comportamiento?

5. **Comportamiento no cubierto por ninguna story** (Regla 8 + 15)
   El comportamiento que el fix corrige no está especificado en ninguna story
   existente. No es bug — es gap de spec. Pausar y sugerir crear/extender la
   story antes de registrar el bug.

6. **Fix implicó cambio de contrato externo** (Regla 10)
   El diff revela que el fix cambió una interfaz, schema o código de error
   expuesto. Pausar: esto requiere actualizar el spec (Regla 10) + ADR. Confirmar
   con el usuario antes de proceder.

7. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada línea del diff individualmente.
- No pedir aprobación para el frontmatter.
- No inventar síntoma o root-cause para evitar la pausa — declarar el gap.
- No suprimir la declaración de Regla 29 — siempre se documenta.

---

## Reglas del framework activas

- **Regla 25** — precondición dura: fix mergeado/en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps: síntoma, severidad, root-cause, scope.
- **Regla 28** — reverse no reemplaza revisión humana.
- **Regla 29** — Regla 8 es inconstruible retroactivamente — siempre declarada.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — bumpear padre (story o feature) según impacto del fix.
- **Regla 10** — si el fix cambió el contrato, actualizar spec + ADR.
- **Regla 31** — si el fix sigue cambiando, no es reverse: abortar.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-bug/SKILL.md` — procedimiento completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32 (especialmente R29).
- `~/.fremi/framework/rules/workflow.md` — Regla 8 (test rojo primero).
