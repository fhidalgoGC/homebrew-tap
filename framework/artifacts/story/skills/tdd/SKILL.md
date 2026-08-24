---
name: fremi-story-tdd
description: Puebla o actualiza el doc `tdd` (`{workflow.tdd}`) de una story — plan de tests derivado de BDD/SDD/Design. Doc snapshot. Cada test referencia el escenario BDD o cláusula SDD que verifica. Regla 7 aplica (test rojo primero) si config.testing.strict_tdd = true.
---

> **Nota sobre identificadores:** los prefijos concretos (feature, story, workflow doc, test case, escenario) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-story-tdd — Poblar el doc `tdd` (plan de tests TDD)

Puebla el doc `tdd` (`{workflow.tdd}`) con la lista planeada de test cases (IDs según `identifiers.test_case`), cada uno mapeado a un escenario del doc `bdd` o cláusula del doc `sdd`.

**Rol del doc**: cómo se **verifica** la story. Plan derivado — no introduce comportamiento nuevo.

## Sintaxis

```
/fremi-story-tdd <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- BDD + SDD + Design completos y open questions cerradas.
- Se agrega un caso borde que necesita nuevo TC.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.test_case` (prefijo y formato del ID de test case), `identifiers.workflow_doc.items[name=tdd-plan]`.
- `config.yaml` → `phase_rules.tdd`, `testing.strict_tdd`, `testing.unit.enabled`, `testing.e2e.enabled`, `testing.coverage.threshold`.

### Paso 1 — Validar padre y precondiciones
- `{workflow.bdd}` con escenarios completos.
- `{workflow.sdd}` con contratos.
- `{workflow.design}` con Acceptance Test Mapping (forward) — cada requirement SDD ya sugiere un test case.
- **Open Questions de Design cerradas** (Regla 17 dura del design).

### Paso 2 — Cargar template
- `references/{workflow.tdd}-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.tdd`

- Cada test tiene ID de test case (según `identifiers.test_case`) + referencia a escenario BDD o cláusula SDD.
- **Regla 7 (rojo→verde→refactor)** activada si `strict_tdd: true`.
- Plan cubre niveles según `testing.*.enabled` (unit / integration / e2e / coverage).
- Cada test case declara: nombre, archivo esperado, framework, tipo (unit/integration/e2e), input, output esperado.
- Import del Acceptance Test Mapping de `{workflow.design}` sección "Acceptance Test Mapping (forward)".

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar: cantidad de TCs, cobertura de SCs / cláusulas SDD.
- Sugerir próximo paso: `/fremi-story-plan` para ordenar la ejecución.

## Validaciones

- Cada escenario del doc `bdd` tiene al menos 1 test case asociado.
- Cada cláusula/requirement del doc `sdd` tiene al menos 1 test case.
- Cada test case declara framework + archivo esperado.
- Si `testing.coverage.enabled: true` → threshold declarado.

## Anti-patrones

- ❌ TC sin mapeo a SC/SDD — huérfano, no sirve.
- ❌ Test que introduce comportamiento nuevo — eso es cambio de contrato, volver a BDD/SDD.
- ❌ Plan de TDD sin niveles (unit + integration + e2e según aplique) — es plan pobre.
- ❌ Arrancar `/fremi-story-plan` sin cerrar Open Questions del design.

## Referencias

- Template: [`references/{workflow.tdd}-template.md`](references/{workflow.tdd}-template.md).
- `config.yaml → phase_rules.tdd`, `testing.*`.
- `~/.fremi/framework/rules/workflow.md` → Regla 7 (TDD rojo primero).
- Skill `/fremi-story-verify` — ejecuta el plan al final.
