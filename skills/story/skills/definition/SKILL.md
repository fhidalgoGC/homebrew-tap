---
name: fremi-story-definition
description: Puebla o actualiza el `FW-01_definition.md` de una story — problema/por qué en formato "As a / I want / So that" + criterios de aceptación CA-XXX. Doc snapshot. Se invoca cuando el usuario quiere formalizar/refinar la definition de una story existente, o cuando `/fremi-story` armó el esqueleto y hay que rellenarlo. Sin solución técnica — es negocio/usuario.
---

# /fremi-story-definition — Poblar FW-01 (problema / por qué)

Puebla el `FW-01_definition.md` de una story con el formato canónico:
- **As a** `<rol>` / **I want** `<acción>` / **So that** `<beneficio>`.
- Criterios de aceptación `CA-XXX` observables.

**Rol del doc**: describe **qué se resuelve y para quién**. NO contiene solución técnica.

## Sintaxis

```
/fremi-story-definition <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- `/fremi-story` acaba de crear el esqueleto y hay que rellenar la definition.
- Usuario quiere refinar los CAs (agregar / modificar / borrar).
- Se descubrió un caso de borde que amerita nuevo CA.

## Procedimiento

### Paso 0 — Cargar configuración

1. Leer `~/.fremi/framework/settings/methodology.json` (extraer `identifiers.criterion`, `identifiers.workflow_doc.items[name=definition]`).
2. Leer `~/.fremi/framework/settings/config.yaml` (`phase_rules.definition`).

### Paso 1 — Validar padre y precondiciones

- `{feature_folder}/definition.md` debe existir con contenido (Regla 1).
- Si el `FW-01_definition.md` de la story ya tiene contenido → confirmar con el usuario antes de sobreescribir. Ofrecer edición aditiva (agregar CA nuevo).

### Paso 2 — Cargar template

- `references/FW-01_definition-template.md` (local a este skill).

### Paso 3 — Poblar aplicando `phase_rules.definition`

Reglas duras:
- Formato obligatorio: `As a <rol> / I want <acción> / So that <beneficio>`.
- Criterios `CA-XXX` numerados según `identifiers.criterion`.
- **Sin decisiones técnicas** — sólo negocio/usuario. Si hay "el handler retorna 200" → mover a `FW-05_sdd-spec.md`.
- Cubrir happy path + al menos un caso de borde/error.

### Paso 4 — Versionado (Regla 17)

- Doc snapshot: `version: 1.0.0`, `doc_type: snapshot`.
- Capturar versión actual de `{feature_folder}/definition.md` en `ancestor.version_at_creation`.
- No bumpear al escribir (es snapshot); si se re-emite después de cerrado, coordinar con `/fremi-story-closure-check`.

### Paso 5 — Escribir el archivo y reportar

- Reemplazar placeholders y guardar.
- Reportar CAs creados y sugerir próximo paso: `/fremi-story-scope` (si scope aún vacío) o `/fremi-story-bdd` (si scope ya listo).

## Validaciones

- Formato As a/I want/So that presente.
- Al menos 1 CA-XXX.
- No hay TBDs (Regla 6).
- Sin contenido técnico (endpoints, código HTTP, firmas).

## Anti-patrones

- ❌ Meter "el sistema retorna 200" o "el handler llama a X" — eso es SDD/Design.
- ❌ Dos roles diferentes en la misma story (probablemente son 2 stories).
- ❌ Reciclar CA-XXX borrado.
- ❌ TBDs — la definition no está lista hasta cerrarlas.

## Referencias

- Template canónico: [`references/FW-01_definition-template.md`](references/FW-01_definition-template.md).
- `~/.fremi/framework/settings/config.yaml → phase_rules.definition`.
- `~/.fremi/framework/rules/workflow.md` → Regla 5 (formato definition), Regla 6 (frontera BDD/SDD/Design).
