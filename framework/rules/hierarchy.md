# Reglas de jerarquía y orden del flujo (cross-domain)

> **Regla obligatoria 1.** Gobierna el orden general de creación de artefactos por capa (PRODUCTO / FEATURE / STORY).
>
> **Alcance:** este archivo contiene sólo la regla **cross-domain** de jerarquía. Las reglas específicas de cada capa viven dentro de su carpeta artifact:
>
> - **R4** (discovery antes de formalización en PRODUCT) → `~/.fremi/framework/artifacts/product/rules/discovery.md`
> - **R5** (formato del doc `definition` de story) → `~/.fremi/framework/artifacts/story/rules/definition-format.md`
> - **R16** (docs condicionales de story) → `~/.fremi/framework/artifacts/story/rules/conditional-docs.md`
>
> Se lee junto con el índice global `rules/workflow.md`.

---

## Regla 1 — No se salta etapas

**Capa PRODUCTO:**
```
iniciativas → ideas → planteamiento → definition → strategies → decisions → plan
```

**Capa FEATURE:** requiere `product/plan.md` listando la feature.
```
feature/definition → (feature/decisions opcional)
```

**Capa USER STORY:** requiere `FT-XX/definition.md` existente.
```
[FW-00_explore] → FW-01_definition → [FW-02_proposal] → FW-03_scope → FW-04_bdd-userstories → FW-05_sdd-spec → FW-06_design → FW-07_tdd-plan → FW-08_plan → FW-09_checkwork → FW-10_closure
```
Docs entre corchetes `[...]` son **condicionales** — ver `~/.fremi/framework/artifacts/story/rules/conditional-docs.md` (Regla 16).

Antes de proponer trabajar en la etapa N, verificar que N-1 existe y tiene contenido.

Si falta una etapa previa:
1. Avisar al usuario.
2. Proponer crearla primero.
3. No avanzar hasta que el usuario confirme.

