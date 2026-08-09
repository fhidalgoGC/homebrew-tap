# Template — `{workflow.sdd}` de una story

> **Para qué:** contratos **externos** de la story. Lo que otros consumen — sin haber decidido tecnología interna.
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo).
> **Rol del archivo:** **qué CONTRACTUAL** — interfaces expuestas, schemas, tabla de errores expuestos, requisitos no funcionales medibles.
> **Antes de:** `{workflow.design}`. La spec dirige el diseño.
> **Frontera crítica (Regla 6.3):** si para escribir un contrato necesitás haber decidido librería/framework/wrapper → eso es Design, no SDD. Pregunta de control: "¿este contrato se sostiene independientemente del stack interno que elijamos?". Si no, está mal ubicado.

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

# Especificación técnica (contratos externos)

> Contratos que se sostienen **sin haber decidido tecnología interna**. Las decisiones sobre librerías, wrappers, capas internas, patterns y archivos van a `{workflow.design}`.

## Interfaces expuestas

> Endpoints, funciones públicas, eventos publicados — cualquier punto de contacto con consumidores externos a la story.

### `<endpoint o función pública>`

- **Disparador / verbo:** <HTTP method + path, nombre de función, evento, etc.>
- **Input:**
  ```
  <schema sin referirse a tecnología interna — JSON Schema, OpenAPI fragment, tipo abstracto, etc.>
  ```
- **Output (caso feliz):**
  ```
  <schema sin referirse a tecnología interna>
  ```
- **Invariantes:**
  - <propiedad que el contrato garantiza siempre>
  - <propiedad >
- **Side effects expuestos (si aplica):**
  - <evento publicado, archivo persistido, etc.>

### `<otra interfaz, si la story expone más de una>`
...

## Tabla de códigos / errores expuestos

> Cada código documentado tiene que poder mapearse a al menos un escenario BDD.

| Código | Cuándo se devuelve | Body / payload | Cubre SC |
|---|---|---|---|
| 200 (o equivalente) | Caso feliz | <schema output> | SC-001 |
| 400 | Validación falla | `{ error: "...", code: "..." }` | SC-002 |
| ... | ... | ... | ... |

## Requisitos no funcionales (medibles)

> Cada RNF debe ser **falsable** — describir cómo se mide.

- **Performance:** <ej: "P95 ≤ 800ms en input estándar (input estándar = N nodos, M ramas)">
- **Determinismo:** <ej: "para un mismo input + template + variables, output binario es idéntico (hash SHA-256 coincide)">
- **Trazabilidad:** <ej: "cada request incluye trace_id propagado en logs">
- **Seguridad:** <ej: "no logging de variables sensibles; redacción de fields configurada">
- **Disponibilidad / errores tolerados:** <ej: "fallo de la query principal NO debe causar 5xx, sino 4xx con mensaje claro">

## Contratos derivados (referencia)

> Si la story produce o consume schemas/tipos que pertenecen a un contrato más amplio (compartido entre stories), referenciarlos acá. NO duplicar — apuntar a la fuente.

- <referencia a otro `FW-05` o a un contrato del producto>
```

---

## Reglas de uso

1. **Sin nombres de librerías ni wrappers.** "Recibe un Buffer de Puppeteer" ✗. "Recibe un PDF binario serializado" ✓.
2. **Schemas abstractos.** Usar JSON Schema, OpenAPI fragments, tipos abstractos (TypeScript es OK si no introduce dependencia técnica del runtime). Evitar `class XYZModel` que asuma ORM.
3. **Toda tabla de errores debe mapear a BDD.** Si un código no cubre ningún SC-XXX → o sobra el código, o falta un SC.
4. **NFRs falsables.** "Rápido" ✗. "P95 ≤ 800ms con input X" ✓.
5. **Frontera SDD vs Design (la pregunta de control):** "¿este contrato existe igual si cambio mi librería principal?". Si la respuesta es no → es Design.
6. **Bifurcaciones (Regla 3b).** Si al escribir un contrato aparece una decisión con 2+ caminos viables (ej: formato del payload, idempotencia sí/no) → pausar, ofrecer opciones, ADR vía `/fremi-story-adr`.
