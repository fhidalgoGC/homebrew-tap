# Regla de stop events del pipeline reverse-PRODUCT (dominio pipeline-reverse-product)

> **Regla operativa del pipeline reverse.** Define cuándo pausa para pedir input al usuario (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** DOMAIN-específico del pipeline `reverse-product`. Se lee junto con `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Advertencia obligatoria antes de correr

Antes de arrancar la fase 1, el pipeline **muestra al usuario** este bloque y espera confirmación
(en `--mode auto` muestra la advertencia pero no bloquea; en `interactive` pausa hasta respuesta):

```
⚠️ REVERSE-PRODUCT es de RIESGO ALTO

Vas a reconstruir la capa producto de un proyecto que ya existe. La IA va a
inferir INICIATIVAS de negocio, IDEAS descartadas y DEFINITION del producto
a partir del código y las features existentes.

Riesgo: la IA puede racionalizar decisiones que en realidad nunca se tomaron
formalmente. El resultado puede sonar coherente pero no reflejar la historia
real del negocio.

Recomendación fuerte:
  1. Correr en --mode interactive (default).
  2. Revisar CADA doc antes de aceptar.
  3. Preguntar al usuario original del producto por las iniciativas reales
     ANTES de aceptar las inferidas.
  4. Mantener --transparent (default) para dejar la marca del origen reverse.

¿Continuar? [Sí / No / Necesito el usuario original del producto primero]
```

---

## Precondición dura (aborta el pipeline)

- **Regla 24** — Framework instalado. `.claude/skills/fremi-story` es symlink válido y
  `CLAUDE.md` referencia `~/.fremi/framework/rules/workflow.md`. Si no está instalado →
  abortar con: "Corré el CLI `fremi install` antes de invocar el pipeline."
- **Regla 25** — Trabajo en producción o mergeado a main. Si el proyecto está en fase
  experimental → abortar.
- Existe estructura reconocible del proyecto: al menos `README.md` + `package.json` +
  una feature en `docs/works/features/` o código de features identificable.
- Si NO existe ninguna feature (proyecto en fase 0) → abortar.
  Sin features no hay materia prima para reconstruir producto.
- `config.reverse.yaml → active: true`.

---

## Stop events específicos (pausa el pipeline)

1. **`So that` de las iniciativas** — la IA propone iniciativas basadas en las features,
   pero el rationale de negocio no se puede inferir (Regla 27). **Pausa obligatoriamente y
   pregunta** al usuario original del producto. Si no está disponible → deja las iniciativas
   con `rationale: TBD — requiere usuario original del producto`.

2. **Ideas descartadas** — sólo se inferirán si hay branches abandonados o commits revertidos
   claros. Si no, la sección queda vacía con warning: "no se detectaron ideas descartadas —
   puede haberlas o no; requiere entrevista".

3. **Criterios de éxito medibles** — el código no define métricas de éxito de negocio.
   Preguntar al usuario o dejar `TBD` (Regla 27).

4. **Bifurcaciones estratégicas** — el stack elegido (Node, TypeScript, AWS Lambda, etc.)
   refleja una decisión estratégica. Registrar ADRs retroactivos globales con
   `discovered_during_reverse: true`. Pausar para pedir rationale (Regla 27 + Regla 3b).

5. **Glosario** — `definition.md` debe tener glosario. Extraerlo de nombres de dominio del
   código + preguntar al usuario por definiciones formales (Regla 27).

6. **Iniciativas contradictorias** — si features distintas apuntan a iniciativas que se pisan
   → pausar y clarificar al usuario.

---

## Anti-patrones (el pipeline NO pausa por esto)

- No confirmar el nombre de cada iniciativa inferida (sólo pausa por el rationale).
- No preguntar el orden de items en `ideas.md`.
- No pedir feedback tras cada doc completado (salvo `--mode interactive`).
- No inventar rationale de iniciativas para evitar la pausa — declarar el gap (Regla 27).

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent, override stealth explícito.
- **Regla 27** — preguntar por gaps de iniciativas, planteamiento y criterios de éxito.
- **Regla 28** — reverse-product SIEMPRE requiere revisión humana profunda.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 31** — si el proyecto sigue en vuelo experimental, no es reverse: abortar.
- **Regla 4** — discovery antes de formalización. El pipeline respeta el orden
  `iniciativas → ideas → planteamiento → definition`.
- **Regla 12** — sync-back hacia abajo: si al reverse-product aparecen restricciones
  globales, propagarlas a `feature/definition.md` de cada feature.
- **Regla 17** + **Regla 30** — versionado con timestamps inferidos.

---

## Referencias

- `~/.fremi/framework/pipelines/reverse-product/PIPELINE.md` — orquestador completo.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/README.md` — stop events genéricos.
