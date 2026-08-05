# Template — `FW-07_tdd-plan.md` de una story

> **Para qué:** plan de tests que verifica el comportamiento (BDD), los contratos (SDD) y la estructura (Design).
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo).
> **Rol del archivo:** **cómo se VERIFICA** — TC-XXX numerados, mapeados a SC-XXX (BDD) y contratos SDD.
> **No introduce comportamiento nuevo.** Si un test "descubre" un comportamiento no especificado, hay un gap en BDD/SDD — sync-back primero.
> **TDD = test rojo primero (Regla 7).** Cada TC se escribe antes que la implementación; debe fallar al principio.

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

# Plan de tests (TDD)

> Plan derivado de `FW-04_bdd-userstories.md` (SC-XXX), `FW-05_sdd-spec.md` (contratos) y `FW-06_design.md` (estructura interna). Cada test apunta a uno o más de esos elementos. Sin mapeo, el test no debería existir.

## Tests planeados

> Un bullet por TC-XXX. Estado `[ ]` (pendiente) / `[/]` (escrito y rojo) / `[x]` (verde).

### Módulo: `<componente A>`

- [ ] **TC-001** — `<descripción del test>`
  - **Cubre BDD:** SC-001
  - **Cubre SDD:** <contrato/RNF concreto>
  - **Tipo:** unit | integration | e2e | contract
  - **Notas:** <fixture especial, setup, etc.>

- [ ] **TC-002** — `<descripción del test>`
  - **Cubre BDD:** SC-002
  - **Cubre SDD:** <error code 400>
  - **Tipo:** unit
  - **Notas:** <validar shape exacto del body de error>

### Módulo: `<componente B>`

- [ ] **TC-003** — `<descripción>`
  - **Cubre BDD:** SC-003
  - **Cubre SDD:** RNF performance (P95 ≤ 800ms)
  - **Tipo:** integration
  - **Notas:** <medir con tooling X; aceptable si pasa en CI>

## Tests de borde / negativos (explícitos)

> Lista de casos que NO son del caso feliz pero hay que cubrir.

- [ ] **TC-XXX** — input vacío → 400 con body `{ error: "empty_input" }`
- [ ] **TC-XXX** — query GraphQL falla → propagación según FW-06 (502 + log)
- [ ] **TC-XXX** — timeout de Chromium → 504 con log estructurado

## Coverage objetivo

| Módulo | Mínimo |
|---|---|
| `<componente A>` | ≥ 80% |
| `<componente B>` | ≥ 70% |
| Suite total | ≥ 75% |

> Coverage es **piso, no techo**. Cumplir el piso no implica cobertura semántica — eso lo da el mapeo TC→SC/SDD.

## Estrategia de fixtures / mocks

- **Fixtures compartidas:** <ej: "HTML de template de ejemplo en `tests/fixtures/template-basic.html`">
- **Mocks:** <qué se mockea y por qué — ej: "GraphQLAdapter se mockea en unit tests de PdfGenerator; en integration NO se mockea">
- **Datos de prueba:** <semilla determinística, sin datos reales>

## Notas

- **Test rojo principal:** TC-XXX (el que captura el comportamiento más representativo de la story; se escribe primero).
- **Orden sugerido de implementación:** TC-XXX → TC-YYY → ... (derivar del `FW-08_plan.md`).
- **CI:** la suite debe correr en `npm test` (o equivalente) sin requerir credenciales externas.
```

---

## Reglas de uso

1. **Todo TC mapea a SC y/o SDD.** Sin mapeo, el test no pertenece al plan — o falta el SC/SDD.
2. **Test rojo primero (Regla 7).** Cuando se marca `[/]`, el test debe fallar al correr. Si pasa de una sin implementación → test trivial, revisar.
3. **Cobertura semántica > coverage numérico.** Un 80% de coverage que no cubre el caso de error de SC-002 es peor que 60% que cubre todos los SC.
4. **Fixtures determinísticas.** Sin fechas `now()`, sin random sin seed, sin datos reales de producción.
5. **Bugs reproducibles primero (Regla 8).** Si durante el desarrollo aparece un bug, se agrega un TC nuevo acá ANTES de arreglarlo.
