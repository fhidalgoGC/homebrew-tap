# Template — `FW-04_bdd-userstories.md` de una story

> **Para qué:** comportamiento **observable** por el usuario, en formato Given/When/Then.
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo).
> **Rol del archivo:** **qué OBSERVABLE** — qué experimenta el usuario en cada situación.
> **Antes de:** `FW-05_sdd-spec.md`. Los contratos técnicos derivan del comportamiento observable, no al revés.
> **Frontera crítica (Regla 6):** acá NO se escribe nada que dependa de tecnología interna. Códigos HTTP, schemas, firmas, librerías → todo eso va a `FW-05_sdd-spec.md`. La pregunta de control: "¿podría escribir este escenario sin saber qué stack se usa?" Si no, está mal ubicado.

---

```markdown
---
version: 1.0.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: snapshot
ancestor:
  id: {feature_id}
  version_at_creation: "<versión actual de FT-XX/definition.md>"
  version_at_closure: null
---

# Escenarios BDD

> Comportamiento esperado en Given/When/Then. **Sin firmas, sin tipos, sin códigos HTTP, sin schemas, sin librerías.** Esas decisiones nacen recién en `FW-05_sdd-spec.md`.

```gherkin
Feature: <título de la story — mismo que FW-01>

  Background:
    Given <contexto común a todos los escenarios — opcional>

  # SC-001 — Caso feliz principal
  Scenario: <título descriptivo del escenario>
    Given <precondición observable>
    And <precondición adicional>
    When <acción del usuario o disparador externo>
    Then <resultado observable>
    And <consecuencia adicional>

  # SC-002 — Caso de error o borde
  Scenario: <título descriptivo>
    Given <precondición>
    When <acción>
    Then <el usuario observa este resultado>

  # SC-003 — Caso adicional (si aplica)
  Scenario Outline: <título — patrón con ejemplos>
    Given <precondición con <variable>>
    When <acción>
    Then <resultado con <variable>>
    Examples:
      | variable | resultado |
      | valor1   | r1        |
      | valor2   | r2        |
```

## Notas sobre los escenarios

- <observaciones libres sobre supuestos comunes, alcance, edge cases conocidos que NO se cubrieron acá y se documentan en `FW-03_scope.md`>
- <referencias a CA-XXX de `FW-01_definition.md` que cada SC-XXX cubre — para alimentar la matriz de trazabilidad de `FW-10_closure.md`>
```

---

## Reglas de uso

1. **Sólo lenguaje observable.** "El usuario ve un PDF" ✓. "El handler retorna 200 con Content-Type: application/pdf" ✗ (SDD).
2. **Numeración SC-XXX local a la story.** Secuencial, sin reciclar.
3. **Cubrir al menos: caso feliz + un caso de error + un caso de borde.** Si la story se reduce a "caso feliz", está mal acotada.
4. **Vincular a CA-XXX.** Cada criterio de aceptación de `FW-01_definition.md` debe estar cubierto por al menos un SC-XXX.
5. **Frontera BDD vs SDD:** la pregunta de control es "¿podría escribir esto sin saber qué stack se usa?". Si la respuesta es no → mover a SDD.
6. **Scenario Outline para variantes paramétricas.** No repetir 5 escenarios casi idénticos.
