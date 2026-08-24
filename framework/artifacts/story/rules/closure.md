# Regla de closure obligatorio de la story (dominio STORY)

> **Regla obligatoria 11.** Una story no es DONE sin el doc `closure` validado con matriz de trazabilidad completa y DoD firmado.
>
> **Alcance:** esta regla es DOMAIN-específica de `story/`. Cada capa tiene su propio closure — features cierran diferente (aggregate de stories), enablers tienen su propio `closure` con reglas propias.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`definition`, `scope`, `bdd`, `sdd`, `design`, `tdd`, `plan`, `checkwork`, `closure`) para referirse a los docs del workflow. El filename real se resuelve vía `~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md`. Reglas cross-domain relacionadas: R10 (docs=fuente de verdad), R12 (sync-back), R17 (versioning + bump del padre al cerrar).

---

## Regla 11 — Una story no es DONE sin el doc `closure` validado

**Precondición:** el doc `checkwork` muestra **100 % completado** (ver `checkwork.md` en este mismo dominio). Si quedan tasks ⬜ o 🚧 en checkwork, **no se firma el closure** — antes hay que cerrar el trabajo.

Una user story sigue **abierta** mientras no exista el doc `closure` con:

1. **Matriz de trazabilidad completa**: cada criterio de aceptación del doc `definition` mapeado a:
   - escenario del doc `bdd`
   - contrato del doc `sdd`
   - test concreto (archivo:función) que pase
   - archivo de implementación que lo cumpla
2. **Checklist DoD completo**:
   - Nada fuera del doc `scope` fue implementado.
   - Implementación coincide con el doc `design`.
   - Todos los escenarios del doc `bdd` tienen test que pasa.
   - Todos los contratos del doc `sdd` implementados.
   - Todos los items del doc `tdd` marcados `[x]`.
   - ADRs aplicables respetados.
   - Coverage de la story ≥ umbral del proyecto.
   - **Sin divergencias con capas superiores** (Regla 12 global — sync-back).
3. **Evidencia**: link a PR/commits, demo si aplica.
4. **Sign-off**: fecha.

Sin el doc `closure` validado:
- No se cierra la story.
- No se mueve a la siguiente.
- No se reportan métricas de "feature completada".

La skill `/fremi-story-closure-check` audita automáticamente la story y reporta gaps. Usarla antes de firmar el closure.
