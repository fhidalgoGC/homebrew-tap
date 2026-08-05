---
name: fremi-story-tdd
description: Puebla o actualiza el `FW-07_tdd-plan.md` de una story — plan de tests derivado de BDD/SDD/Design con IDs TC-XXX. Doc snapshot. Cada test referencia el SC-XXX (BDD) o cláusula SDD que verifica. Regla 7 aplica (test rojo primero) si config.testing.strict_tdd = true.
---

# /fremi-story-tdd — Poblar FW-07 (plan de tests TDD)

Puebla el `FW-07_tdd-plan.md` con la lista planeada de tests `TC-XXX`, cada uno mapeado a un SC-XXX (BDD) o cláusula de SDD.

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
- `methodology.json` → `identifiers.test_case` (TC-XXX), `identifiers.workflow_doc.items[name=tdd-plan]`.
- `config.yaml` → `phase_rules.tdd`, `testing.strict_tdd`, `testing.unit.enabled`, `testing.e2e.enabled`, `testing.coverage.threshold`.

### Paso 1 — Validar padre y precondiciones
- `FW-04_bdd-userstories.md` con SC-XXX.
- `FW-05_sdd-spec.md` con contratos.
- `FW-06_design.md` con Acceptance Test Mapping (forward) — cada R-XX ya sugiere TC-XXX.
- **Open Questions de Design cerradas** (Regla 17 dura del design).

### Paso 2 — Cargar template
- `references/FW-07_tdd-plan-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.tdd`

- Cada test tiene ID TC-XXX + referencia a SC-XXX (BDD) o cláusula SDD.
- **Regla 7 (rojo→verde→refactor)** activada si `strict_tdd: true`.
- Plan cubre niveles según `testing.*.enabled` (unit / integration / e2e / coverage).
- Cada TC-XXX declara: nombre, archivo esperado, framework, tipo (unit/integration/e2e), input, output esperado.
- Import del Acceptance Test Mapping de `FW-06_design.md` sección "Acceptance Test Mapping (forward)".

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar: cantidad de TCs, cobertura de SCs / cláusulas SDD.
- Sugerir próximo paso: `/fremi-story-plan` para ordenar la ejecución.

## Validaciones

- Cada SC-XXX de BDD tiene al menos 1 TC-XXX asociado.
- Cada cláusula/requirement de SDD tiene al menos 1 TC-XXX.
- Cada TC-XXX declara framework + archivo esperado.
- Si `testing.coverage.enabled: true` → threshold declarado.

## Anti-patrones

- ❌ TC sin mapeo a SC/SDD — huérfano, no sirve.
- ❌ Test que introduce comportamiento nuevo — eso es cambio de contrato, volver a BDD/SDD.
- ❌ Plan de TDD sin niveles (unit + integration + e2e según aplique) — es plan pobre.
- ❌ Arrancar `/fremi-story-plan` sin cerrar Open Questions del design.

## Referencias

- Template: [`references/FW-07_tdd-plan-template.md`](references/FW-07_tdd-plan-template.md).
- `config.yaml → phase_rules.tdd`, `testing.*`.
- `docs/frmwk/rules/workflow.md` → Regla 7 (TDD rojo primero).
- Skill `/fremi-story-verify` — ejecuta el plan al final.
