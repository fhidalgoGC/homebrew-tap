# Template — `{workflow.definition}` de una story (snapshot)

> **Para qué:** problema / por qué — desde la perspectiva del usuario/negocio. Es el primer artefacto del workflow de una story.
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo).
> **Placeholders:** `{feature_id}`, `{story_id}`, `{slug}` se reemplazan con los valores del JSON; `<...>` con el contenido real.
> **Tipo (Regla 17):** **snapshot** — no muta después de escrito. Registra la versión de la feature padre al crearse y al cerrar la story.
> **Rol del archivo:** describe **qué se resuelve y para quién**. NO contiene solución técnica, ni código HTTP, ni firmas, ni librerías.

---

```markdown
---
version: 1.0.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: snapshot
ancestor:
  id: {feature_id}
  version_at_creation: "<versión de FT-XX/definition.md al momento>"
  version_at_closure: null    # se rellena al firmar {workflow.closure}
---

# Story: <título descriptivo> (`{feature_id}_{story_id}_{slug}`)

**As a** <rol concreto — quién usa esta capacidad>
**I want** <acción/funcionalidad observable — qué necesita hacer>
**So that** <beneficio de negocio o de usuario — por qué le importa>

## Criterios de aceptación

> Cada criterio es **observable** y **verificable**. Si requiere conocer la implementación interna para verificarse → pertenece a `{workflow.sdd}`, no acá.

- **CA-001** — <criterio observable 1>
- **CA-002** — <criterio observable 2>
- **CA-003** — <criterio observable 3 — incluir al menos un caso de error o borde>

## Contexto

<Por qué esta story dentro de la feature, qué dependencias de negocio tiene, qué referencias a `iniciativas.md` o a otras stories existen. 2-4 líneas.>

## Fuera de alcance (referencia)

> El detalle de in-scope / out-of-scope va en `{workflow.scope}`. Acá sólo se mencionan cosas que un lector podría asumir y NO están — alias previo para evitar confusión.

- <ej: "esta story NO incluye la persistencia de plantillas — eso es HU-XX en FT-YY">
```

---

## Reglas de uso

1. **Tono observable.** "El usuario recibe el archivo PDF" es válido. "El handler retorna 200" NO va acá (es SDD).
2. **Un solo rol.** "As a admin / As a user" en la misma story es una señal de que son 2 stories distintas.
3. **CA-XXX numerados.** IDs locales a la story, secuenciales, sin reciclar. Se referencian desde `{workflow.closure}` (matriz de trazabilidad).
4. **Cubrir caso feliz + al menos un borde.** Una story sin criterio de error está incompleta.
5. **Sin TBDs.** Si no podés escribir un criterio concreto → la story no está madura, volvé al usuario.
