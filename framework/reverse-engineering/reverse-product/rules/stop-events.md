# Stop events del skill /fremi-reverse-product (dominio reverse-skill-product)

> **Regla operativa del skill.** Define cuándo pausa para pedir input al usuario
> (Regla 27 — gaps no-inferibles) y cuándo aborta.
>
> **Alcance:** domain-específico del skill `reverse-product`. Se lee junto con
> `~/.fremi/framework/reverse-engineering/rules/reverse.md`.

---

## Precondiciones duras (aborta el skill)

- **Regla 24** — Framework instalado. Al menos un orquestador (`fremi-story`,
  `fremi-feature`) es symlink válido en `.claude/skills/` y `CLAUDE.md` referencia
  `~/.fremi/framework/rules/workflow.md`. Si no → abortar.
- **Regla 25** — El producto ya existe (features en producción o mergeadas a main).
  Si el producto está arrancando ahora → abortar y usar el flow normal
  (`/fremi-product-iniciativas` → ... → `/fremi-product-plan`).
- `config.reverse.yaml → active: true`.

Si el git history no está disponible: correr con warning + `reverse_engineered_confidence: 0.3`.

---

## Advertencia obligatoria antes de arrancar

**Antes de ejecutar el procedimiento**, el skill DEBE emitir esta advertencia al usuario:

> "Reverse-product es el caso más ambicioso de reverse-engineering. Las iniciativas
> reconstruidas son INTERPRETACIONES post-hoc — pueden no reflejar la motivación
> estratégica original. Las ideas descartadas son casi imposibles de reconstruir
> sin memoria del equipo. Se recomienda encarecidamente usar `--transparent` y
> validar el resultado con los stakeholders originales."

Esperar confirmación antes de continuar.

---

## Stop events específicos (pausa el skill)

1. **Gap no-inferible — rationale de iniciativas** (Regla 27)
   Las hipótesis de negocio que motivaron las iniciativas estratégicas no se
   pueden inferir del código. Preguntar al usuario: ¿qué hipótesis de negocio
   agrupan las features existentes?

2. **Gap no-inferible — ideas descartadas** (Regla 27)
   Los approaches considerados y no implementados no están en el código. Preguntar
   al usuario por brainstorm retroactivo de alternativas que se evaluaron.

3. **Gap no-inferible — planteamiento y approach elegido** (Regla 27)
   No puede inferirse por qué se eligió el approach actual sobre alternativas.
   Preguntar al usuario.

4. **Gap no-inferible — KPIs y métricas de éxito** (Regla 27)
   Las métricas de negocio no son derivables del código. Preguntar al usuario
   qué KPIs definen el éxito del producto.

5. **Gap no-inferible — usuarios primarios y secundarios** (Regla 27)
   El código no informa sobre segmentos de usuarios. Preguntar al usuario.

6. **ADR estratégico sin rationale** (Regla 27)
   Se detecta del stack que se tomó una decisión técnica global (elección de
   runtime, plataforma, paradigma de arquitectura) pero no hay documentación
   del por qué. Preguntar antes de redactar el ADR retroactivo.

7. **Ambigüedad en la agrupación de features en iniciativas** (Regla 27)
   No está claro si una feature pertenece a una iniciativa u otra. Preguntar
   al usuario cómo agrupa las features existentes.

8. **Restricciones globales no inferibles** (Regla 27)
   Restricciones regulatorias, de compliance o de negocio que no se pueden
   deducir del código. Preguntar al usuario.

9. **Sin git history + `--from-git-history` pedido**
   Preguntar si continuar con `confidence: 0.3` o abortar.

---

## Anti-patrones (el skill NO pausa por esto)

- No confirmar cada feature inventariada individualmente.
- No pedir aprobación para cada campo del frontmatter.
- No inventar hipótesis de negocio para evitar la pausa — declarar el gap.
- No normalizar ADRs de facto como si hubiera habido una comparación formal
  que nunca ocurrió.

---

## Reglas del framework activas

- **Regla 25** — precondición dura de trabajo en producción.
- **Regla 26** — default transparent (especialmente recomendado para producto).
- **Regla 27** — preguntar por todos los gaps de negocio no-inferibles.
- **Regla 28** — reverse no reemplaza revisión humana — validar con stakeholders.
- **Regla 30** — versionado con timestamps inferidos del git history.
- **Regla 17** — docs living de producto se versionan entre sí (sin padre externo).
- **Regla 31** — si el producto sigue cambiando, correr después del próximo
  hito estable.

---

## Referencias

- `~/.fremi/framework/reverse-engineering/reverse-product/SKILL.md` — procedimiento.
- `~/.fremi/framework/reverse-engineering/rules/reverse.md` — Reglas 25-32.
- `~/.fremi/framework/pipelines/reverse-product/rules/stop-events.md` — stop events
  del pipeline equivalente (superset de estos).
