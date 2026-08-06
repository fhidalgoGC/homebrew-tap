---
name: fremi-story-scope
description: Puebla o actualiza el `FW-03_scope.md` de una story — límites explícitos in-scope / out-of-scope + dependencias. Doc snapshot. Se invoca cuando la definition ya existe y hay que acotar la story antes de meterse en BDD. Sin scope explícito los escenarios BDD se expanden sin control (Regla 6.1).
---

# /fremi-story-scope — Poblar FW-03 (límites de la story)

Puebla el `FW-03_scope.md` con listas explícitas:
- **In-scope** — qué SÍ entra.
- **Out-of-scope** — qué NO entra (para acotar expectativas).
- **Dependencias** — otras stories o features de las que depende.

**Rol del doc**: **acota** la story antes de bajar a BDD.

## Sintaxis

```
/fremi-story-scope <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- `FW-01_definition.md` completo y hay que acotar la story.
- Se descubrió durante BDD/SDD que algo está fuera de scope y hay que actualizarlo.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json` → `identifiers.workflow_doc.items[name=scope]`.
- `config.yaml` → `phase_rules.scope`.

### Paso 1 — Validar padre
- `FW-01_definition.md` de la story debe existir y estar completo (con CAs).
- `{feature_folder}/definition.md` debe listar la story como planeada.

### Paso 2 — Cargar template
- `references/FW-03_scope-template.md` (local).

### Paso 3 — Poblar aplicando `phase_rules.scope`
- Listas explícitas In-scope / Out-of-scope / Dependencias.
- Cada Out-of-scope acota una expectativa razonable del usuario.
- **Sin TBDs.** Si no podés decidir si algo está in o out, decidilo ahora — no lo arrastres a BDD.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = versión actual de `{feature_folder}/definition.md`.

### Paso 5 — Escribir y reportar
- Reemplazar placeholders, guardar.
- Sugerir próximo paso: `/fremi-story-bdd`.

## Validaciones

- In-scope no vacío.
- Out-of-scope no vacío (siempre hay algo razonable que no se incluye).
- Dependencias listadas explícitamente (o "Ninguna" si aplica).

## Anti-patrones

- ❌ TBDs en scope — se resuelven acá, no en BDD.
- ❌ Out-of-scope trivial ("no incluye backend"). Debe ser algo que el lector razonable esperaría que sí estuviera.
- ❌ Comportamiento observable en scope — eso va en BDD.

## Referencias

- Template: [`references/FW-03_scope-template.md`](references/FW-03_scope-template.md).
- `config.yaml → phase_rules.scope`.
- `~/.fremi/framework/rules/workflow.md` → Regla 6.1 (Scope antes que BDD).
