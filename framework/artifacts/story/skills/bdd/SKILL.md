---
name: fremi-story-bdd
description: Puebla o actualiza el doc `bdd` de una story con escenarios Given/When/Then. Doc snapshot. Cubre lo OBSERVABLE por el usuario. Sin firmas, sin códigos HTTP, sin librerías (eso es SDD). Precondiciones: definition + scope listos.
---

> **Nota sobre identificadores:** los prefijos concretos (feature, story, workflow doc, ADR, CA, SC, TC, task) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-story-bdd — Poblar el doc `bdd` (escenarios BDD Given/When/Then)

Puebla el doc `bdd` (`{workflow.bdd}`) con escenarios Gherkin (`Scenario:`) numerados con el ID de escenario (por default `SC-XXX` — el prefijo y formato salen de `identifiers.scenario` del JSON). Cada escenario captura lo **observable** por el usuario.

**Rol del doc**: qué OBSERVA el usuario ante cada acción. NO contiene contratos técnicos.

## Sintaxis

```
/fremi-story-bdd <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- Definition + scope listos y hay que capturar el comportamiento esperado.
- Se descubrió un caso de borde que amerita un nuevo escenario.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.scenario` (prefijo + formato del ID de escenario), `identifiers.workflow_doc.items[name=bdd-userstories]`.
- `config.yaml` → `phase_rules.bdd`.

### Paso 1 — Validar padre y precondiciones
- `{workflow.definition}` con CAs completos.
- `{workflow.scope}` con listas cerradas.

### Paso 2 — Cargar template
- `references/{workflow.bdd}-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.bdd`
- Cada escenario en formato `Given / When / Then` con ID de escenario (según `identifiers.scenario.regex`).
- **Cubrir happy path + al menos 1 caso de borde/error**.
- Cada escenario referencia al menos un criterio de aceptación que cubre.
- **Sin firmas, tipos ni tecnología** — sólo comportamiento observable.
- Si un escenario requiere referirse a códigos HTTP o schemas → **mover a `{workflow.sdd}`**.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = versión de feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar SCs creados y qué CAs cubren.
- Sugerir próximo paso: `/fremi-story-sdd`.

## Validaciones

- Al menos 1 SC feliz + 1 SC borde.
- Cada criterio de aceptación del doc `definition` cubierto por al menos un escenario.
- Formato Given/When/Then estricto en cada scenario.
- Sin refs a tech (endpoints, códigos HTTP, código real).

## Anti-patrones

- ❌ "El sistema devuelve 200" — eso es SDD.
- ❌ "Given el handler recibe X" — el "handler" es interno. Mejor: "Given el usuario envía Y".
- ❌ Escenarios sin ID (no se pueden referenciar desde el doc `closure`).
- ❌ Un solo escenario (feliz) — falta cobertura de borde.

## Referencias

- Template: [`references/{workflow.bdd}-template.md`](references/{workflow.bdd}-template.md).
- `config.yaml → phase_rules.bdd`.
- `~/.fremi/framework/rules/workflow.md` → Regla 6.2 (BDD antes que SDD).
