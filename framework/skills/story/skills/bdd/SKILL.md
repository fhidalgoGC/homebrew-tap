---
name: fremi-story-bdd
description: Puebla o actualiza el `FW-04_bdd-userstories.md` de una story con escenarios Given/When/Then numerados SC-XXX. Doc snapshot. Cubre lo OBSERVABLE por el usuario. Sin firmas, sin códigos HTTP, sin librerías (eso es SDD). Precondiciones: definition + scope listos.
---

# /fremi-story-bdd — Poblar FW-04 (escenarios BDD Given/When/Then)

Puebla el `FW-04_bdd-userstories.md` con escenarios Gherkin (`Scenario:`) numerados `SC-XXX`. Cada escenario captura lo **observable** por el usuario.

**Rol del doc**: qué OBSERVA el usuario ante cada acción. NO contiene contratos técnicos.

## Sintaxis

```
/fremi-story-bdd <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- Definition + scope listos y hay que capturar el comportamiento esperado.
- Se descubrió un caso de borde que amerita nuevo SC-XXX.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.scenario` (SC-XXX), `identifiers.workflow_doc.items[name=bdd-userstories]`.
- `config.yaml` → `phase_rules.bdd`.

### Paso 1 — Validar padre y precondiciones
- `FW-01_definition.md` con CAs completos.
- `FW-03_scope.md` con listas cerradas.

### Paso 2 — Cargar template
- `references/FW-04_bdd-userstories-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.bdd`
- Cada escenario en formato `Given / When / Then` con ID `SC-XXX` (según `identifiers.scenario.regex`).
- **Cubrir happy path + al menos 1 caso de borde/error**.
- Cada SC-XXX referencia al menos un `CA-XXX` que cubre.
- **Sin firmas, tipos ni tecnología** — sólo comportamiento observable.
- Si un escenario requiere referirse a códigos HTTP o schemas → **mover a `FW-05_sdd-spec.md`**.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = versión de feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar SCs creados y qué CAs cubren.
- Sugerir próximo paso: `/fremi-story-sdd`.

## Validaciones

- Al menos 1 SC feliz + 1 SC borde.
- Cada CA-XXX de `FW-01` cubierto por al menos 1 SC-XXX.
- Formato Given/When/Then estricto en cada scenario.
- Sin refs a tech (endpoints, códigos HTTP, código real).

## Anti-patrones

- ❌ "El sistema devuelve 200" — eso es SDD.
- ❌ "Given el handler recibe X" — el "handler" es interno. Mejor: "Given el usuario envía Y".
- ❌ Scenarios sin ID SC-XXX (no se pueden referenciar desde closure).
- ❌ Un solo SC (feliz) — falta cobertura de borde.

## Referencias

- Template: [`references/FW-04_bdd-userstories-template.md`](references/FW-04_bdd-userstories-template.md).
- `config.yaml → phase_rules.bdd`.
- `~/.fremi/framework/rules/workflow.md` → Regla 6.2 (BDD antes que SDD).
