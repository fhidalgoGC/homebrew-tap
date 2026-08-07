---
name: fremi-story-explore
description: Crea o actualiza el doc de investigación previa (fase `explore`) de una story — típicamente `FW-00_explore.md`. Genérico — resuelve filename cruzando `~/.fremi/framework/settings/methodology.core.yaml` con el `name: "explore"` del workflow declarado en `config.yaml`. Usar cuando el usuario quiere arrancar la story con una investigación del terreno antes de escribir la definition. También sirve para actualizar el explore si aparecen hallazgos nuevos durante la exploración.
---

# /fremi-story-explore — Investigación previa (fase explore de una story)

Este skill instancia o actualiza el doc **`explore`** de una story (por default `FW-00_explore.md`, pero el filename real se resuelve por config — no está hardcoded acá).

Su objetivo es **mapear el terreno técnico** antes de decidir cómo resolver la story. **No propone solución** — sólo documenta contexto del codebase, alternativas identificadas, hallazgos y preguntas abiertas.

---

## Sintaxis

```
/fremi-story-explore <FEATURE_ID> <STORY_ID>
```

- `<FEATURE_ID>`: ID de la feature padre (ej: `FT-01`).
- `<STORY_ID>`: ID de la story dentro de la feature (ej: `HU-03`).

Si el usuario invoca `/fremi-story-explore` sin args pero está claro el contexto (ej: acaba de crear una story con `/fremi-story`), asumir esa story.

---

## Cuándo invocarlo

**Obligatorio** (según Regla 16 + `config.yaml → conditional_rules.explore_when`): cuando al menos UNO aplica:
- La story toca un área del codebase que el implementador no conoce.
- Existen 2+ approaches técnicos plausibles que ameritan comparar antes de proponer.
- La story integra con una librería/servicio externo no usado antes en el proyecto.
- La story es de migración o reemplazo.

**Opcional**: bug fixes chicos, cambios triviales, refactors locales — en estos casos el explore no aporta y se omite.

**No invocar** si el explore ya existe y está completo — usar edición directa en su lugar. `/fremi-story-explore` sí se puede re-invocar para **agregar hallazgos** durante la investigación.

---

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`.
2. Leer `~/.fremi/framework/settings/config.core.yaml`.
3. Extraer de `config.yaml`:
   - `config.story.yaml → docs[]` — buscar entry con `name: "explore"` para obtener `required` y `condition_ref`.
   - `conditional_rules[condition_ref]` — criterios de obligatoriedad.
   - `phase_rules.explore` — reglas específicas de la fase.
4. Extraer de `methodology.core.yaml`:
   - `identifiers.workflow_doc.items[]` — buscar item con `name: "explore"` para obtener el `filename` real (ej: `FW-00_explore.md`).
   - `paths.features_dir`, `paths.user_stories_subdir`.

Si alguno de los archivos no parsea → abortar.

### Paso 1 — Resolver ruta de la story y filename del doc

1. `feature_folder = {paths.features_dir}/<FEATURE_ID>_<slug>` (matchear con `identifiers.feature.folder_regex`).
2. `story_folder = {feature_folder}/{paths.user_stories_subdir}/<STORY_ID>_<slug>` (idem `identifiers.story`).
3. `explore_filename = <item.filename>` (típicamente `FW-00_explore.md`, pero **no hardcodear**).
4. Ruta final: `{story_folder}/{explore_filename}`.

Si la story no existe → abortar y sugerir `/fremi-story` primero (Regla 1).

### Paso 2 — Evaluar obligatoriedad (Regla 16)

1. Presentar al usuario los criterios `obligatory_if_any[]` de `explore_when`.
2. Preguntar si aplica al menos uno.
3. Si el usuario dice **no aplica** → confirmar que quiere crear el doc igual (opcional) o abortar limpiamente.
4. Si aplica → registrar cuál criterio disparó el explore (se documenta en la sección `Trigger` del doc).

### Paso 3 — Cargar template

1. Cargar `~/.fremi/framework/skills/explore/references/FW-00_explore-template.md` — **este skill es dueño del template canónico**.
2. `~/.fremi/framework/skills/story/references/FW-00_explore-template.md` es un **symlink** que apunta acá; no es un archivo alternativo.
3. Si el template local no existe → generar contenido mínimo derivado de `phase_rules.explore` + estructura fija ("Contexto", "Alternativas", "Hallazgos", "Preguntas", "Impacto en proposal") y avisar al usuario que hay que reponer el template canónico.

### Paso 4 — Poblar el explore

Aplicar `phase_rules.explore` como guía obligatoria:
- **Leer código, no inventar.** Cada afirmación sobre el codebase debe referenciarse con `archivo:línea`.
- **No proponer solución elegida** — sólo mapear alternativas viables.
- **Cerrar con "Impacto en la proposal"** — qué decisiones habilita/bloquea el hallazgo.

El skill DEBE ejecutar exploración real (grep, read de archivos, listar dependencies del package.json, etc.) antes de escribir cada sección. No hallucinar contexto.

### Paso 5 — Escribir el archivo

1. Reemplazar placeholders (`{feature_id}`, `{story_id}`, `<título>`) con valores derivados.
2. Escribir a la ruta calculada en Paso 1.
3. Si el archivo ya existe y tiene contenido → NO sobreescribir. Preguntar si el usuario quiere:
   - Agregar sección nueva al final.
   - Reemplazar (`⚠️ destructivo`).
   - Cancelar.

### Paso 6 — Actualizar checkwork si existe

Si `{story_folder}/{checkwork_filename}` existe (resolver con methodology.core.yaml `name: "checkwork"`), agregar en la sección "Estado general" que el explore fue creado con la fecha.

### Paso 7 — Reportar

- Ruta del archivo creado/actualizado.
- Criterio de `explore_when` que aplicó.
- Cuántas alternativas quedaron identificadas.
- Sugerir próximo paso: `/fremi-story` para completar `FW-01_definition` (si no existe), o `/fremi-story-proposal` para pasar a decidir approach (si la story amerita proposal).

---

## Validaciones

- Story padre debe existir (folder + `FW-01_definition.md`). Si no → abortar con Regla 1.
- No sobreescribir contenido existente sin confirmación explícita.
- Al menos una sección de "Alternativas" o "Contexto" debe tener contenido no-placeholder.
- Referencias `archivo:línea` deben apuntar a archivos que existen.

---

## Anti-patrones

- ❌ Elegir un approach en el explore ("vamos por Puppeteer porque X"). Eso va en `FW-02_proposal.md`.
- ❌ Inventar contexto del codebase sin leerlo — cada afirmación va referenciada.
- ❌ Escribir `FW-00_explore.md` para stories triviales (bug fixes locales) sólo por "completitud".
- ❌ Hardcodear el filename `FW-00_explore.md` — resolver siempre por methodology.core.yaml.

---

## Referencias

- `~/.fremi/framework/settings/config.core.yaml` → `config.story.yaml`, `conditional_rules.explore_when`, `phase_rules.explore`.
- `~/.fremi/framework/settings/methodology.core.yaml` → `identifiers.workflow_doc.items[name=explore]`.
- `~/.fremi/framework/rules/workflow.md` → Regla 16 (condicionales), Regla 3b (bifurcaciones), Regla 6 (SDD dirige diseño).
- **Template canónico** (dueño): `~/.fremi/framework/skills/explore/references/FW-00_explore-template.md`.
- `~/.fremi/framework/skills/story/references/FW-00_explore-template.md` es symlink que delega acá.
