# Reglas de bug fix y refactor (cross-domain)

> **Reglas obligatorias 8, 9.** Gobiernan el fix de bugs vía test de reproducción, y el refactor que no cambia comportamiento.
>
> **Alcance:** este archivo contiene reglas **cross-domain** relacionadas a implementación disciplinada. **NO es el ciclo TDD** — las reglas del ciclo TDD (R2, R7, R7b) son domain-específicas de story y viven en:
>
> - `~/.fremi/framework/artifacts/story/rules/tdd.md`
>
> R8 (bug fix) es cross-artifact porque los bugs pueden vivir en scope story o feature. Cuando se cree el dominio `bug/` explícito, esta regla puede migrar allí.
>
> R9 (refactor) es truly universal — aplica a cualquier código que se toque.
>
> Se lee junto con el índice global `rules/workflow.md`.

---

## Regla 8 — Bug fix = test de reproducción antes del fix

Para un bug:
1. Identificar el artifact afectado (typically una story o feature).
2. **Registrar el bug** con el skill correspondiente al scope (`/fremi-story-bug` o `/fremi-feature-bug`) — crea `BG-XX_<slug>.md` en la carpeta `bugs/` del scope (Regla 15).
3. Agregar un test al plan TDD del artifact afectado que reproduzca el bug (debe fallar — **rojo**). Para stories, es el `FW-07_tdd-plan.md`; ver `~/.fremi/framework/artifacts/story/rules/tdd.md` para reglas del ciclo TDD story.
4. Implementar el fix.
5. Confirmar que el test pasa (**verde**).
6. Cerrar el bug completando la sección "Cierre" de `BG-XX_<slug>.md` con evidencia.

Si el bug no encaja en ninguna story existente, describe comportamiento no especificado → crear/extender la story correspondiente **antes** de registrar el bug.

---

## Regla 9 — Refactor no cambia comportamiento

- No requiere doc nuevo.
- Tests existentes deben pasar antes y después.
- Si durante el refactor se descubre un cambio de comportamiento necesario, detenerse y proponer el cambio vía BDD/SDD (en dominio story).
