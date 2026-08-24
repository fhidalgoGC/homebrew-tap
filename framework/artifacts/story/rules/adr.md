# Reglas de ADR (decisiones de arquitectura)

> **Reglas obligatorias 3, 3b, 20.** Gobiernan cuándo se registra una decisión técnica, cómo se maneja una bifurcación (opciones → usuario → ADR), y en qué scope vive cada ADR. Se lee junto con `rules/workflow.md`.

---

## Regla 3 — Toda decisión técnica genera un ADR

Si en una conversación se elige entre alternativas técnicas, antes de implementar se anexa un ADR:

```markdown
## ADR-XXX — Título
**Estado:** Aceptada
**Fecha:** YYYY-MM-DD
**Contexto:** ...
**Decisión:** ...
**Alternativas descartadas:** ...
**Consecuencias:** ...
```

**Dónde va — 3 scopes** (ver Regla 20 para detalle):

| Scope | Ubicación | Skill | Cuándo |
|---|---|---|---|
| **Producto** | `docs/works/product/decisions.md` | `/fremi-product-adr` | Aplica a múltiples features / stack global |
| **Feature** | `docs/works/features/FT-XX_<slug>/decisions.md` | `/fremi-feature-adr FT-XX` | Aplica sólo a una feature |
| **Story** | `docs/works/features/FT-XX/user-stories/HU-YY/decisions.md` | `/fremi-story-adr FT-XX/HU-YY` | Delta local a una story (se mergea al feature al cerrar — Regla 17) |

**Numeración global de ADR-XXX** (compartida entre los 3 scopes). No se borran ADRs antiguos: si una decisión se reemplaza, se marca como `Reemplazada por ADR-YYY`.

---

## Regla 3b — Patrón "bifurcación técnica → opciones → usuario decide → ADR"

**La IA no toma decisiones técnicas por su cuenta cuando hay alternativas viables.** Cuando durante cualquier etapa del flujo (spec/design/planteamiento en cualquier artifact) la IA detecta una **bifurcación** — un punto donde hay 2+ caminos técnicos razonables — el procedimiento obligatorio es:

### Procedimiento

1. **PAUSE.** La IA detiene la redacción del artefacto en el punto exacto donde aparece la decisión. **No elige silenciosamente** ni adopta el camino que le parezca mejor.

2. **PROPONE opciones.** Presenta al usuario, en el chat, **2 o 3 caminos viables** con:
   - Un título corto por opción.
   - Pros y contras explícitos de cada una.
   - (Opcional) Una recomendación con justificación, pero siempre marcada como sugerencia revocable, no como decisión tomada.

3. **ESPERA al usuario.** No avanza con la redacción hasta recibir una elección explícita. Si el usuario dice "lo que vos creas", la IA elige pero **igual** crea el ADR con esa misma estructura para dejar rastro.

4. **CREA el ADR.** Una vez decidido, invocar el skill del **scope correcto** (Regla 20):
   - `/fremi-product-adr` — para decisiones que aplican a múltiples features o al stack global.
   - `/fremi-feature-adr FT-XX` — para decisiones locales a UNA feature.
   - `/fremi-story-adr FT-XX/HU-YY` — para decisiones locales a UNA story (delta que se merge al feature al cerrar — Regla 17).
   - Numeración de ADR-XXX es **global al proyecto** (compartida entre los 3 scopes).
   - Referencia el ADR desde el artefacto donde nació (`FW-05`, `FW-06`, `feature/definition.md`, etc.) con `aplica ADR-XXX`.

5. **CONTINÚA.** Recién entonces la IA sigue con la redacción del artefacto, ahora apoyada en la decisión registrada.

### Cuándo se dispara

Típicamente en el spec/contrato o design de cualquier artifact. Ejemplos por dominio (ver `applies.yaml` del artifact correspondiente para los mapeos concretos):

| Contexto | Bifurcaciones típicas |
|---|---|
| **spec/contrato externo** (ej: story spec doc, feature contract) | Formato de la interfaz (REST vs GraphQL vs gRPC), schema de un payload, política de un código de error expuesto, modo de delivery. |
| **design/cómo interno** (ej: story design doc, enabler design) | Elección de librería (Puppeteer vs Playwright), tooling de IaC (SAM vs CDK), pattern interno (repository vs servicio plano), storage (DynamoDB vs Aurora). |
| **feature/definition.md** | Si una restricción técnica de la feature aplica también a otras → promover a ADR de producto. |
| **product/strategies.md** | Comparación de stacks/arquitecturas — las decisiones que salen de acá ya nacen como ADRs en `product/decisions.md`. |

### Bifurcaciones que NO disparan ADR

- Elección entre opciones **equivalentes** sin trade-off significativo (ej: nombre de una variable interna, orden de campos en una struct).
- Detalles puramente sintácticos (estilo de imports, formato del log).
- Elecciones que ya están resueltas por un ADR existente — sólo se referencia el ADR.

Si hay duda sobre si una elección amerita ADR, default a **sí, registrarla**: es más fácil tener ADRs de más que perder rastro de una decisión que después aparece como surpresa.

### Forma de presentar las opciones (template para el chat)

Cuando la IA pausa para preguntar, usa este formato:

```
Antes de seguir, necesito decidir: <nombre de la decisión>.

Veo 2-3 caminos viables:

**Opción A — <título>**
- Pros: ...
- Contras: ...

**Opción B — <título>**
- Pros: ...
- Contras: ...

**Opción C — <título>** (opcional)
- Pros: ...
- Contras: ...

Mi recomendación tentativa: <A/B/C> porque ... — pero confirma vos.
¿Cuál camino tomamos?
```

Una vez el usuario elige, la IA confirma con: *"Listo, registro el ADR-XXX (<título>) en <archivo> y sigo."*

### Anti-patrones a evitar

- ❌ Elegir librería/pattern/protocolo y mencionarlo en pasada en el doc de design (cualquier artifact) sin ADR.
- ❌ Listar opciones y elegir una "porque parece la más razonable" sin preguntar.
- ❌ Avanzar el artefacto con TBDs que arrastran la decisión a etapa posterior (viola el principio rector — ver Regla 6).
- ❌ Crear el ADR **después** de implementar (el ADR justifica la implementación, no al revés).

---

## Regla 20 — ADRs y bugs siguen la jerarquía de scopes

Los ADRs y bugs son artefactos que pueden vivir en **múltiples scopes** según su naturaleza. Cada scope tiene su skill y ubicación específica.

### ADRs — 3 scopes (ver Regla 3)

| Scope | Ubicación | Skill |
|---|---|---|
| Producto | `docs/works/product/decisions.md` | `/fremi-product-adr` |
| Feature | `docs/works/features/FT-XX/decisions.md` | `/fremi-feature-adr FT-XX` |
| Story | `docs/works/features/FT-XX/user-stories/HU-YY/decisions.md` | `/fremi-story-adr FT-XX/HU-YY` |

- **Numeración de ADR-XXX es global al proyecto** — se calcula tomando `max(ADR-XXX) + 1` sobre los 3 scopes.
- **Story-scope es delta** — al firmar `/fremi-story-closure`, los ADRs de la story se mergean al `FT-XX/decisions.md` living (Regla 17).

### Bugs — 2 scopes (ver Regla 15)

| Scope | Ubicación | Skill | Numeración |
|---|---|---|---|
| Story | `docs/works/features/FT-XX/user-stories/HU-YY/bugs/BG-XX_<slug>.md` | `/fremi-story-bug FT-XX/HU-YY` | Local a la story |
| Feature | `docs/works/features/FT-XX/bugs/BG-XX_<slug>.md` | `/fremi-feature-bug FT-XX` | Local a la feature |

- **Numeración de BG-XX es local al scope** (cada story/feature arranca desde `BG-01`).

### Enablers — 3 scopes (ver Regla 15)

| Scope | Ubicación | Invocación |
|---|---|---|
| Global | `docs/works/enablers/{EN-XX}/` | `/fremi-enabler <nombre>` |
| Feature | `docs/works/features/FT-XX/enablers/{EN-XX}/` | `/fremi-enabler <nombre> --feature FT-XX` |
| Story | `docs/works/features/FT-XX/user-stories/HU-YY/enablers/{EN-XX}/` | `/fremi-enabler <nombre> --story FT-XX/HU-YY` |

- **Numeración de EN-XX es global al proyecto** — evita colisiones entre scopes.

### Cómo aplicar

Al detectar necesidad de crear un ADR / bug / enabler:
1. **Determinar el scope real** — ¿aplica a producto entero, a UNA feature, o a UNA story?
2. **Usar el skill del scope correcto**. Si la decisión trasciende — usar el skill del scope superior.
3. **Sync-back** (Regla 12): si durante la ejecución del skill se descubre que la decisión aplica arriba → promover al scope superior.
