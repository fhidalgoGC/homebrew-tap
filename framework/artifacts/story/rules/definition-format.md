# Regla de formato del doc `definition` (dominio STORY)

> **Regla obligatoria 5.** Toda user story empieza por su doc `definition` con formato canónico.
>
> **Alcance:** esta regla es DOMAIN-específica de `story/`. Sólo se carga cuando se está trabajando en una story. El formato definition de otras capas (product, feature, enabler) es distinto y vive en sus propios dominios.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`definition`, `scope`, `bdd`, etc.) para referirse a los docs del workflow. El filename real de cada step se resuelve vía `~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md`.

---

## Regla 5 — Toda user story empieza por su doc `definition`

El primer doc obligatorio de la cadena story (step `definition`) sigue formato canónico:

```markdown
# <Título de la story>

**As a** <rol>
**I want** <acción/funcionalidad>
**So that** <beneficio>

## Criterios de aceptación
- ...
- ...
```

Los identificadores de los criterios de aceptación (`CA-XXX` por default) también son configurables — ver `methodology.core.yaml → identifiers.criterion`.
