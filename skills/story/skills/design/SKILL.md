---
name: fremi-story-design
description: Puebla o actualiza el `FW-06_design.md` de una story — decisiones técnicas (librerías, wrappers, capas, patterns, estructura de archivos) que SATISFACEN el contrato de SDD. Doc snapshot. Incluye Key Invariants, Edge Cases Pin-Down, Open Questions, Acceptance Test Mapping (forward). Preferir firmas TypeScript reales sobre pseudocódigo.
---

# /fremi-story-design — Poblar FW-06 (cómo estructural)

Puebla el `FW-06_design.md` con el "cómo estructural" que satisface los contratos de `FW-05_sdd-spec.md`:
- Tecnologías/librerías elegidas + rationale.
- Componentes/módulos internos + wrappers.
- Diagrama de secuencia (Mermaid o ASCII).
- Modelo de datos si aplica.
- Patrones aplicados.
- Estructura de archivos a crear.
- **Key Invariants** (invariantes verificables).
- **Edge Cases Pin-Down** (con IDs de requirement).
- **Open Questions** (deben cerrarse antes de FW-07).
- **Acceptance Test Mapping (forward)** — R-XX → TC-XXX planeado.

**Rol del doc**: cómo se implementa internamente sin redefinir el contrato de SDD (Regla 6.4).

## Sintaxis

```
/fremi-story-design <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- `FW-05_sdd-spec.md` con contratos completos.
- Se descubrió una decisión técnica nueva que hay que registrar.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json` → `identifiers.workflow_doc.items[name=design]`, `identifiers.adr`.
- `config.yaml` → `phase_rules.design`.

### Paso 1 — Validar padre y precondiciones
- `FW-05_sdd-spec.md` con contratos completos, tabla de errores, RNFs.

### Paso 2 — Cargar template
- `references/FW-06_design-template.md` (16 secciones — Tecnologías, Componentes, Wrappers, Diagrama, Modelo datos, Pseudocódigo, Patrones, Errores, Concurrencia, Estructura archivos, Key Invariants, Edge Cases Pin-Down, Open Questions, Acceptance Test Mapping).

### Paso 3 — Poblar aplicando `phase_rules.design`

Reglas duras:
- **Preferir firmas TypeScript reales** sobre pseudocódigo abstracto.
- **Toda librería elegida tiene justificación** — si hay 2+ opciones viables → Regla 3b + `/fremi-story-adr`.
- **Key Invariants concretos y verificables** — cada invariante testeable.
- **Edge Cases con ID de requirement SDD (R-XX)** — si un edge case no tiene R asociado, es gap de SDD, volver a Paso 1.
- **Open Questions se cierran antes de FW-07** — o se transfieren como Known Limitation al `FW-02_proposal.md`.
- **Acceptance Test Mapping cubre 100%** de requirements SDD.
- **NO redefinir SDD** (Regla 6.4) — si el design contradice SDD, error de orden.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar tech elegida, ADRs generados, open questions abiertas, coverage de Acceptance Mapping.
- Sugerir próximo paso: cerrar open questions → `/fremi-story-tdd`.

## Validaciones

- Cada tecnología/librería tiene justificación (con ADR si hubo bifurcación).
- Diagrama de secuencia del caso feliz end-to-end.
- Estructura de archivos declarada.
- Key Invariants no vacías, cada una verificable.
- Cada R-XX de SDD tiene al menos un TC-XXX planeado en Acceptance Mapping.
- Open Questions vacías (o transferidas a Known Limitations en proposal).

## Anti-patrones

- ❌ Elegir librería "porque sí" — Regla 3b + ADR obligatorios.
- ❌ Design que contradice SDD — o SDD está mal (volver) o Design está mal.
- ❌ Wrappers "por las dudas" — envolver una lib requiere justificación (test seam, abstracción real, swapping futuro).
- ❌ Open Questions arrastradas a FW-07 sin resolver — no se arranca TDD con dudas.
- ❌ Pseudocódigo cuando ya sabés qué escribir en TypeScript real.
- ❌ Requirement SDD sin TC planeado — gap del design.

## Referencias

- Template: [`references/FW-06_design-template.md`](references/FW-06_design-template.md).
- `config.yaml → phase_rules.design`.
- `~/.fremi/framework/rules/workflow.md` → Regla 6.4 (Design satisface SDD, no la redefine), Regla 3b (ADR por bifurcación).
