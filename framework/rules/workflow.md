# Reglas del flujo de trabajo — makingFileReport

> **Documento de referencia:** `~/.fremi/framework/flows/workflow.md`
>
> Estas reglas son **obligatorias** para todo trabajo en este proyecto. Si una regla bloquea una acción, hay que volver a la etapa correspondiente del flujo, no saltarla.

---

## Jerarquía del trabajo

El proyecto se organiza en **3 capas**: PRODUCTO → FEATURE → USER STORY. Cada acción ocurre en una capa específica.

```
docs/works/
├── product/                                  ← capa PRODUCTO
│   ├── iniciativas.md         ┐
│   ├── ideas.md               │ discovery
│   ├── planteamiento.md       ┘
│   ├── definition.md          ┐
│   ├── strategies.md          │ formalización
│   ├── decisions.md           │
│   └── plan.md                ┘
└── features/
    └── FT-XX_<slug>/                         ← capa FEATURE
        ├── definition.md
        ├── decisions.md      (opcional, ADRs específicos)
        └── user-stories/
            └── HU-XX_<slug>/                 ← capa USER STORY
                ├── FW-00_explore.md          (OPCIONAL — investigación previa)
                ├── FW-01_definition.md       (problema / por qué — negocio/usuario)
                ├── FW-02_proposal.md         (OPCIONAL — intent + approach + risk)
                ├── FW-03_scope.md            (límites: in-scope / out-of-scope)
                ├── FW-04_bdd-userstories.md  (qué OBSERVABLE: Given/When/Then)
                ├── FW-05_sdd-spec.md         (qué CONTRACTUAL: interfaces externas)
                ├── FW-06_design.md           (cómo ESTRUCTURAL: tech, librerías, capas)
                ├── FW-07_tdd-plan.md         (cómo se VERIFICA: plan de tests)
                ├── FW-08_plan.md             (en qué ORDEN se construye)
                ├── FW-09_checkwork.md        (estado EN VIVO: listo / en curso / pendiente)
                └── FW-10_closure.md          (DoD + trazabilidad + sign-off)
```

### Convención de nomenclatura

> **Fuente de verdad de la NOMENCLATURA:** `~/.fremi/framework/settings/methodology.core.yaml`. Las descripciones de abajo son resumen — la configuración formal (regex, formats, scopes) vive en ese JSON. Para cambiar prefijos o padding (ej: `FT-01` → `F-001`), editar el JSON y hacer sweep.
>
> **Fuente de verdad OPERATIVA:** `~/.fremi/framework/settings/config.core.yaml`. Manda para scripts/tooling y define la **obligatoriedad condicional** de `FW-00_explore.md` y `FW-02_proposal.md` (ver `config.story.yaml → conditional_rules`), además del stack técnico, testing capabilities y reglas por fase.

- **Features:** `FT-XX_<slug>` (`FT-01`, `FT-02`, ...). ID secuencial de 2 dígitos a nivel proyecto. Slug kebab-case descriptivo.
- **Stories:** `HU-XX_<slug>` (`HU-01`, `HU-02`, ...). ID secuencial de 2 dígitos **dentro de cada feature** (cada feature arranca desde `HU-01`).
- **Docs dentro de stories:** prefijados con `FW-XX_` (FrameWork) reflejando el **orden de ejecución del workflow**. La cadena tiene 11 docs (FW-00..FW-10), es una progresión de abstracción que **siempre baja** (abstracto → concreto): explore → definition → proposal → scope → bdd → sdd → design → tdd → plan → checkwork → closure. `FW-00_explore` y `FW-02_proposal` son **condicionales** (ver `config.yaml`); los otros 9 son obligatorios siempre. `FW-09_checkwork.md` es el único doc "vivo" (se actualiza durante la implementación); los demás se escriben una vez.
- **Docs de producto y feature:** **sin prefijo `FW-XX_`**. Sólo las stories usan el prefijo porque sólo ellas tienen un flujo lineal estricto.
- **Tasks:** `task-XXX` (3 dígitos), locales al `FW-08_plan.md` de cada story. ID compuesto opcional: `FT-XX_HU-YY_task-ZZZ`.
- **ADRs:** `ADR-NNN` con numeración global de 3 dígitos en `product/decisions.md`, o local de feature en `FT-XX/decisions.md`.
- **IDs internos de story:** `CA-XXX` (criterios), `SC-XXX` (escenarios BDD), `TC-XXX` (tests). 3 dígitos, locales a la story.
- **Iniciativas:** `init-XXX` (3 dígitos), globales en `product/iniciativas.md`.

### Principio rector

> **La spec dirige el diseño.** Cada artefacto sólo puede consumir decisiones tomadas en los artefactos **anteriores**. Nunca puede depender de uno **posterior**. Si un contenido depende de una decisión que se toma más adelante, está en el archivo equivocado: se mueve, no se invierte el orden.

Progresión de abstracción (docs entre corchetes son condicionales):
```
[explore]  →  definition  →  [proposal]  →  scope  →  qué observable  →  qué contractual  →  cómo estructural  →  cómo se verifica  →  en qué orden  →  vivo  →  cierre
 FW-00        FW-01           FW-02        FW-03    FW-04 (bdd)          FW-05 (sdd-spec)   FW-06 (design)      FW-07 (tdd)        FW-08 (plan)   FW-09    FW-10
```

Ver Regla 6 para las **reglas de frontera** entre artefactos.

---

## Regla 1 — No se salta etapas

**Capa PRODUCTO:**
```
iniciativas → ideas → planteamiento → definition → strategies → decisions → plan
```

**Capa FEATURE:** requiere `product/plan.md` listando la feature.
```
feature/definition → (feature/decisions opcional)
```

**Capa USER STORY:** requiere `FT-XX/definition.md` existente.
```
[FW-00_explore] → FW-01_definition → [FW-02_proposal] → FW-03_scope → FW-04_bdd-userstories → FW-05_sdd-spec → FW-06_design → FW-07_tdd-plan → FW-08_plan → FW-09_checkwork → FW-10_closure
```
Docs entre corchetes `[...]` son **condicionales**: obligatorios cuando aplican los criterios declarados en `~/.fremi/framework/skills/story/config.user.yaml → conditional_rules`, opcionales en el resto. Ver Regla 16 abajo.

Antes de proponer trabajar en la etapa N, verificar que N-1 existe y tiene contenido.

Si falta una etapa previa:
1. Avisar al usuario.
2. Proponer crearla primero.
3. No avanzar hasta que el usuario confirme.

---

## Regla 2 — No se escribe código sin SDD + TDD de la story

Antes de tocar código de producción, debe existir, para la story correspondiente:
- `docs/works/features/FT-XX_<slug>/user-stories/HU-XX_<slug>/FW-05_sdd-spec.md` con el contrato relevante.
- `docs/works/features/FT-XX_<slug>/user-stories/HU-XX_<slug>/FW-07_tdd-plan.md` con tests planeados.

**Excepciones permitidas:**
- Configuración de tooling (linters, formatters, tsconfig).
- Scaffolding inicial (`package.json`, estructura de carpetas).
- Los archivos de `docs/` y `~/.fremi/framework/`.

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

**La IA no toma decisiones técnicas por su cuenta cuando hay alternativas viables.** Cuando durante cualquier etapa del flujo (especialmente `FW-05_sdd-spec.md`, `FW-06_design.md`, o al armar feature/producto) la IA detecta una **bifurcación** — un punto donde hay 2+ caminos técnicos razonables — el procedimiento obligatorio es:

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

Típicamente:

| Momento | Bifurcaciones típicas |
|---|---|
| `FW-05_sdd-spec.md` (contrato externo) | Formato de la interfaz (REST vs GraphQL vs gRPC), schema de un payload, política de un código de error expuesto, modo de delivery. |
| `FW-06_design.md` (cómo interno) | Elección de librería (Puppeteer vs Playwright), tooling de IaC (SAM vs CDK), pattern interno (repository vs servicio plano), storage (DynamoDB vs Aurora). |
| `feature/definition.md` | Si una restricción técnica de la feature aplica también a otras → promover a ADR de producto. |
| `product/strategies.md` | Comparación de stacks/arquitecturas — las decisiones que salen de acá ya nacen como ADRs en `product/decisions.md`. |

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

- ❌ Elegir librería/pattern/protocolo y mencionarlo en pasada en `FW-06_design.md` sin ADR.
- ❌ Listar opciones y elegir una "porque parece la más razonable" sin preguntar.
- ❌ Avanzar el artefacto con TBDs que arrastran la decisión a etapa posterior (viola el principio rector — ver Regla 6).
- ❌ Crear el ADR **después** de implementar (el ADR justifica la implementación, no al revés).

---

## Regla 4 — Discovery antes de formalización en capa PRODUCTO

No se escribe `product/definition.md` sin `iniciativas.md` + `ideas.md` + `planteamiento.md` previos. El descubrimiento informa la definición — al revés es justificar un producto ya decidido.

---

## Regla 5 — Toda user story empieza por su `FW-01_definition.md`

Formato obligatorio:
```markdown
# <Título de la story>

**As a** <rol>
**I want** <acción/funcionalidad>
**So that** <beneficio>

## Criterios de aceptación
- ...
- ...
```

---

## Regla 6 — Cadena BDD → SDD → Design (la spec dirige el diseño)

Dentro de cada story el orden de los artefactos centrales es:

```
FW-04_bdd-userstories  →  FW-05_sdd-spec  →  FW-06_design
   (qué OBSERVABLE)        (qué CONTRACTUAL)    (cómo ESTRUCTURAL)
```

**Cada artefacto sólo puede consumir decisiones tomadas en los artefactos ANTERIORES. Nunca puede depender de uno POSTERIOR.** Si un contenido depende de una decisión que se toma más adelante, ese contenido está en el archivo equivocado: se mueve, no se invierte el orden.

### Regla 6.1 — Scope antes que BDD

Antes de escribir `FW-04_bdd-userstories.md` debe existir `FW-03_scope.md` con listas explícitas:
```markdown
## In-scope
- ...
## Out-of-scope
- ...
## Dependencias
- (otras stories o features de las que depende)
```
El scope **acota** la story. Sin él los escenarios BDD se expanden sin control.

### Regla 6.2 — BDD antes que SDD

Antes de escribir `FW-05_sdd-spec.md` debe existir `FW-04_bdd-userstories.md` con al menos:
- El caso feliz.
- Un caso de error o borde relevante.

BDD contiene el **"qué observable"** por el usuario en formato Given/When/Then. **No contiene** firmas, tipos ni decisiones técnicas. Si no se puede formular el comportamiento como Given/When/Then, la story está mal definida — volver a `FW-01_definition.md`.

### Regla 6.3 — SDD antes que Design (la spec dirige)

Antes de escribir `FW-06_design.md` debe existir `FW-05_sdd-spec.md` con el **"qué contractual"** — únicamente fronteras que se sostienen **sin haber decidido tecnología**:
- Contratos de interfaces externas (firmas que otros consumen, endpoints, schemas de request/response).
- Tipos de entrada/salida.
- Tabla de códigos/errores expuestos por la interfaz.
- Requisitos no funcionales medibles (latencia, throughput, etc.).

**No se incluye en SDD** nada que dependa de una decisión técnica interna (elección de librería, capas/wrappers internos, adaptadores de una librería concreta). Eso pertenece a `FW-06_design.md`.

### Regla 6.4 — Design satisface el contrato, no lo redefine

`FW-06_design.md` contiene el **"cómo estructural"** — decisiones técnicas que **satisfacen** el contrato de la SDD:
- Tecnologías y librerías elegidas (Puppeteer, AWS SDK, etc.) con su justificación.
- Componentes y responsabilidades internas; wrappers/adaptadores de las librerías.
- Contratos **internos** derivados de esas decisiones (firmas de funciones módulo-a-módulo).
- Diagramas de secuencia, modelo de datos / ER, pseudocódigo de algoritmos clave.
- Patrones aplicados (repository, strategy, factory, etc.).
- Manejo de errores internos, concurrencia, transacciones.
- Estructura de archivos/carpetas a crear.

`FW-06_design.md` resuelve el **cómo interno** antes de codear. **No es UI/UX** — para necesidades visuales se referencia desde otro lugar (ej: link a Figma).

### Reglas de frontera (anti-solapamiento)

- **BDD vs SDD:** "qué ve el usuario ante tal acción" = **BDD**. "Qué código HTTP / qué schema devuelve la interfaz" = **SDD**.
- **SDD vs Design:** si el contrato puede escribirse sin decidir tecnología → **SDD**. Si sólo existe porque ya se eligió una librería/capa → **Design**.
- Cualquier "TBD" se resuelve en el artefacto donde nace la decisión, no se arrastra al posterior.

---

## Regla 7 — TDD: test rojo primero

Al implementar código:
1. Escribir el test (debe fallar — **rojo**).
2. Implementar lo mínimo para que pase (**verde**).
3. Refactorizar manteniendo tests verdes.

Los tests planeados en `FW-07_tdd-plan.md` se marcan como `[x]` cuando se implementan.

---

## Regla 7b — Plan = tareas con detección de completitud verificable

`FW-08_plan.md` no es texto narrativo: es una lista de tareas atómicas. Cada tarea debe tener:

1. **ID** `T-XXX` secuencial dentro de la story.
2. **Objetivo** explícito (qué construye).
3. **Mapeo** a piezas de `FW-05_sdd-spec.md`, `FW-04_bdd-userstories.md` o `FW-07_tdd-plan.md`. Sin mapeo, la tarea no tiene razón de existir.
4. **Criterios verificables de detección de completitud** (DoD de la tarea), idealmente automatizables:
   - Comando que retorna exit 0.
   - Test específico (`archivo::función`) que pasa.
   - Archivo que existe con contenido X.
   - Métrica de coverage cumplida.
   - Behavior observable manualmente (sólo último recurso, y describiendo cómo se observa).
5. **Estado** explícito: `[ ]` pendiente / `[/]` en curso / `[x]` hecho.

Una tarea **no se marca `[x]`** sin que todos sus criterios pasen. Si un criterio falla, la tarea sigue `[/]`.

Ver template en `~/.fremi/framework/flows/workflow.md` sección "Plan de ejecución".

---

## Regla 8 — Bug fix = test de reproducción antes del fix

Para un bug:
1. Identificar la story afectada.
2. **Registrar el bug** con `/fremi-story-bug FT-XX/HU-YY <nombre>` — crea `BG-XX_<slug>.md` dentro de `HU-YY/bugs/` (Regla 15).
3. Agregar un test al `FW-07_tdd-plan.md` de esa story que reproduzca el bug (debe fallar — **rojo**).
4. Implementar el fix.
5. Confirmar que el test pasa (**verde**).
6. Cerrar el bug completando la sección "Cierre" de `BG-XX_<slug>.md` con evidencia.

Si el bug no encaja en ninguna story existente, describe comportamiento no especificado → crear/extender la story correspondiente **antes** de registrar el bug.

---

## Regla 9 — Refactor no cambia comportamiento

- No requiere doc nuevo.
- Tests existentes deben pasar antes y después.
- Si durante el refactor se descubre un cambio de comportamiento necesario, detenerse y proponer el cambio vía BDD/SDD.

---

## Regla 10 — Los docs son fuente de verdad

Si el código diverge del spec:
- Divergencia intencional → actualizar `FW-05_sdd-spec.md` + ADR.
- Divergencia accidental → corregir el código.
- Nunca dejar la divergencia silenciosa.

---

## Regla 11 — Una story no es DONE sin `FW-10_closure.md` validado

**Precondición:** `FW-09_checkwork.md` muestra **100 % completado** (Regla 13). Si quedan tasks ⬜ o 🚧 en checkwork, **no se firma el closure** — antes hay que cerrar el trabajo.

Una user story sigue **abierta** mientras no exista `FW-10_closure.md` con:

1. **Matriz de trazabilidad completa**: cada criterio de aceptación de `FW-01_definition.md` mapeado a:
   - escenario BDD de `FW-04_bdd-userstories.md`
   - contrato SDD de `FW-05_sdd-spec.md`
   - test concreto (archivo:función) que pase
   - archivo de implementación que lo cumpla
2. **Checklist DoD completo**:
   - Nada fuera del `FW-03_scope.md` fue implementado.
   - Implementación coincide con `FW-06_design.md`.
   - Todos los escenarios BDD tienen test que pasa.
   - Todos los contratos SDD implementados.
   - Todos los items de `FW-07_tdd-plan.md` marcados `[x]`.
   - ADRs aplicables respetados.
   - Coverage de la story ≥ umbral del proyecto.
   - **Sin divergencias con capas superiores** (Regla 12).
3. **Evidencia**: link a PR/commits, demo si aplica.
4. **Sign-off**: fecha.

Sin `FW-10_closure.md` validado:
- No se cierra la story.
- No se mueve a la siguiente.
- No se reportan métricas de "feature completada".

La skill `/fremi-story-closure-check` audita automáticamente la story y reporta gaps. Usarla antes de firmar el closure.

---

## Regla 12 — Sincronía bidireccional entre capas (sync-back obligatorio)

El flujo principal es **top-down**: producto → feature → story. Pero los docs son **fuente de verdad viva**, no fotos del arranque. Si trabajando en una capa inferior se descubre algo que debería vivir en una capa superior, **actualizar la superior PRIMERO**, antes de continuar el trabajo de la inferior.

### Casos típicos que disparan sync-back

| Descubierto en | Pertenece a | Acción |
|---|---|---|
| `FW-03_scope.md` o `FW-04_bdd-userstories.md` de una story: una restricción que claramente aplica a otras stories | `product/definition.md` (Restricciones) | Mover/copiar al producto, referenciar desde la story |
| `FW-06_design.md` de una story o `FT-XX/decisions.md` de feature: decisión técnica que aplica a más de una feature | `product/decisions.md` (ADR global) | Promover el ADR al nivel producto, marcar el anterior como "promovido a ADR-XXX" |
| `FW-01_definition.md` o `FW-04_bdd-userstories.md` de una story: una capacidad nueva referenciada (ej: nuevo formato, nuevo adapter, nuevo modo de entrega) que no está en producto | `product/definition.md` (In-scope) | Sumar al in-scope de producto y, si afecta a la iniciativa, ajustar `iniciativas.md` |
| Cualquier nivel: un término técnico que se usa transversalmente y no está definido | `product/definition.md` (Glosario) | Sumar al glosario |
| `feature/definition.md`: una iniciativa nueva o ajuste al MVP | `product/iniciativas.md` | Actualizar la iniciativa o sumar `init-002` si es realmente otra |
| `story/...` durante implementación: el alcance se infló o redujo | `feature/definition.md` y posiblemente `product/plan.md` | Reflejar el cambio antes de proceder |

### Procedimiento

1. **Detectar la divergencia** (manual o vía `/fremi-sync-check`).
2. **Pausar** el trabajo en la capa inferior.
3. **Actualizar** la capa superior (con justificación en el commit o ADR).
4. **Validar** que la actualización no rompe otras features/stories existentes.
5. **Continuar** el trabajo en la capa inferior con la base sincronizada.

### Anti-patrones a evitar

- ❌ Dejar la divergencia silenciosa "porque ya está y funciona".
- ❌ Documentar en la story algo que es producto y nunca subirlo.
- ❌ Crear ADR a nivel feature cuando aplica a producto.
- ❌ Inventar glosario inline en una story para términos que se van a reusar.

### Cuándo NO hace falta sync-back

- Detalle puramente local a la story (ej: nombre de una variable interna, decisión de algoritmo entre opciones equivalentes).
- ADR que **explícitamente** sólo afecta a una feature por construcción (ej: layout específico de un único reporte).

Si hay duda, **default a promover hacia arriba**. Es más fácil bajar después que detectar divergencias acumuladas.

---

## Regla 13 — `FW-09_checkwork.md` se mantiene al día durante la implementación

`FW-09_checkwork.md` es el doc que captura el **estado en vivo** de la story (qué está listo, qué en curso, qué falta). Es el único doc del workflow que se actualiza durante la implementación — los demás (FW-01..FW-08) se escriben una vez y se referencian.

### Cuándo actualizarlo

**Obligatorio** (la story queda incoherente si no se hace):

1. **Al cerrar una task** (cambia de `[ ]` o `[/]` a `[x]` en `FW-08_plan.md`):
   - Moverla a la sección `## ✅ Listo` con fecha de cierre.
   - Actualizar el % progreso.
   - Marcar los archivos / tests que esa task agregó en sus secciones.

2. **Al arrancar una task** (cambia de `[ ]` a `[/]`):
   - Moverla a `## 🚧 En curso` con fecha de inicio.
   - Listar los criterios de detección de completitud pendientes.

3. **Al descubrir un bloqueo o un TBD nuevo**:
   - Agregarlo a `## ❓ Decisiones pendientes / bloqueos`.
   - Si bloquea una task en curso, marcar la task como bloqueada.

**Opcional / automatizable:**

- Cambio de criterio de aceptación cubierto (cuando un test nuevo lo verifica) → marcar `✅` en la tabla de cobertura.
- Archivos nuevos creados → agregar a `## Archivos implementados`.

### Quién lo actualiza

- **Por default:** el agente (Claude / humano) que cierra la task lo actualiza en el mismo paso que marca `[x]` en `FW-08_plan.md`.
- **Opcional:** un hook en `~/.fremi/framework/hooks/sync-checkwork.sh` puede observar cambios en `FW-08_plan.md` y sincronizar checkwork automáticamente. Está disponible como stub; el usuario decide si lo activa en `.claude/settings.json`. **El hook no exime del paso manual** — si el hook falla, la regla sigue aplicando.

### Cuándo NO se actualiza

- Refactor interno que no avanza ninguna task ni cubre ningún CA.
- Cambios de docs (BDD/SDD/Design) — esos viven en sus archivos. Checkwork sólo refleja progreso de implementación, no cambios de spec.
- Edición de comentarios / formatting de código sin tocar lógica.

### Anti-patrones a evitar

- ❌ Marcar una task como `[x]` en `FW-08_plan.md` sin moverla en `FW-09_checkwork.md` — checkwork queda obsoleto.
- ❌ "Lo actualizo al final" — el día del closure se descubre que no se sabe qué falta porque nadie llevó el seguimiento.
- ❌ Confiar 100% en el hook sin validar — si el hook tiene un bug, la divergencia es silenciosa.
- ❌ Marcar `✅` en una task sin que su comando de detección retorne exit 0 (eso es la Regla 7b).

### Reemplazo de FW-08 con checkwork — NO

`FW-08_plan.md` y `FW-09_checkwork.md` son distintos:
- **FW-08** = el plan tal como se diseñó. Estable, referenciable. Se edita sólo si el plan **cambia** (nueva task descubierta, una task se subdivide, etc.).
- **FW-09** = el estado actual. Cambia constantemente durante la implementación.

Nunca borrar el FW-08 ni reemplazarlo por el FW-09.

---

## Regla 14 — Trabajo fuera del flujo se documenta en `docs/works/extra/EX-NN_<slug>.md`

No todo el trabajo cae en feature / story / task. Tooling, scripts, fixes de IaC, mejoras a la metodología, refactor de utilidades y limpieza de código heredado son legítimos pero no son spec-driven — no tienen `As a / I want / So that` de usuario. Igual deben quedar trazados.

### Cuándo aplica

Va a `docs/works/extra/EX-NN_<slug>.md` cualquier trabajo que:

- **No** genera código user-facing nuevo (no es endpoint, no es bug fix con test, no es comportamiento observable).
- Pero **sí** modifica el repo de forma duradera: cambia tooling, mejora un script, ajusta IaC sin cambiar contratos externos, introduce o modifica metodología (skills, hooks, docs de `~/.fremi/framework/`), refactoriza utilidades sin cambiar API pública, o limpia código zombi.

### Regla "un archivo por concepto cohesivo"

- **Un archivo agrupa cambios relacionados a UN concepto.** Aunque haya varios sub-cambios atómicos, si todos responden al mismo problema, viven juntos.
- **Conceptos distintos = archivos distintos.** No fusionar trabajos no-relacionados sólo porque ocurrieron el mismo día.

Ejemplo: "mejoras al generador de Postman" (renombre + multipart override + baseUrl dinámico) es UN archivo. "Duplicar servicios" hecho la semana siguiente es otro archivo distinto.

### Estructura obligatoria del archivo

Cada `EX-NN_<slug>.md` debe contener (las primeras 4 son obligatorias, las últimas 2 opcionales):

1. **Qué se hizo** — resumen ejecutivo.
2. **Por qué no es feature/story/task** — justificación de por qué cae fuera del flujo.
3. **Cambios concretos** — lista de archivos/paths con qué cambió en cada uno.
4. **Validación / cómo se probó** — comandos o pasos para verificar.
5. **Vinculaciones** (opcional) — ADRs, stories, otros EX relacionados.
6. **Notas / aprendizajes** (opcional) — lo que se descubrió.

Plus frontmatter informativo: `Tipo`, `Fecha`, `Estado`, `Disparador`.

Ver template en `~/.fremi/framework/flows/workflow.md` § "Trabajo fuera del flujo".

### Numeración

`EX-NN` es global y secuencial al proyecto. El próximo número se toma del último archivo existente (`ls docs/works/extra/ | grep EX- | sort | tail -1` + 1).

### Anti-patrones a evitar

- ❌ Usar `extra/` como excusa para saltar el flujo cuando el trabajo SÍ es spec-driven (un endpoint nuevo va a story, no a `extra/`).
- ❌ Crear `EX-NN` por cada commit chico — un concepto cohesivo puede tener N commits.
- ❌ Hacer un `EX-NN` que mezcla varios conceptos no-relacionados.
- ❌ Notas personales / scratch pad — `extra/` es para docs comprensibles por otros.
- ❌ Olvidar crear el `EX-NN` cuando se hace tooling. Si después de cerrar la story alguien se pregunta "cuándo cambió X y por qué", debe haber rastro.

### Cuándo `extra/` se promueve a story

Si un trabajo que arrancó como `extra/` resulta tener comportamiento user-facing significativo, se promueve a story:
1. Crear la story con `FW-01..FW-10`.
2. Dejar el `EX-NN_<slug>.md` como pointer histórico: `> Promovido a story <HU-XX> de <FT-YY> el YYYY-MM-DD. Ver allí para el flujo completo.`
3. No borrar el `EX-NN` — sirve como rastro de cómo arrancó.

---

## Regla 15 — Enablers y bugs son artefactos OPCIONALES del flujo

El flujo principal (producto → feature → story) **no obliga** a crear enablers ni bugs. Son artefactos que se agregan **bajo demanda** cuando el trabajo concreto los amerita.

### Enablers (`EN-XX_<slug>`)

Un **enabler** es trabajo técnico que **habilita capacidad futura** del producto, feature o story, pero que **no entrega valor user-facing por sí solo**. Ejemplos: migrar a Node 25, levantar un layer Chromium en Lambda, montar pipeline CI/CD, fundación de seguridad.

**Cuándo crear un enabler:**
- El usuario lo pide explícitamente ("antes de la feature X hay que migrar Z").
- Al planificar una feature/story aparece un bloqueante técnico que no es feature/story por sí mismo.
- Si NO hago este trabajo, una o más features/stories quedan bloqueadas/degradadas.

**Cuándo NO es enabler:**
- Entrega valor user-facing → es feature/story.
- Es tooling/script/refactor que no habilita nada nuevo → es `EX-NN` en `extra/` (Regla 14).
- Es defecto en código de producción → es bug (`/fremi-story-bug` o `/fremi-feature-bug`).

**Ubicación según alcance** (declarado al invocar `/fremi-enabler`):
- **Global** (default): `docs/works/enablers/EN-XX_<slug>/`.
- **Por feature** (`--feature FT-XX`): `docs/works/features/FT-XX_<slug>/enablers/EN-XX_<slug>/`.
- **Por story** (`--story FT-XX/HU-YY`): `docs/works/features/FT-XX/user-stories/HU-YY/enablers/EN-XX_<slug>/`.

Numeración `EN-XX` **global al proyecto** — un enabler dentro de FT-03 podría ser `EN-04` si hay 3 enablers en otras ubicaciones.

**Estructura — cadena liviana (4 docs):**
```
EN-01_definition.md   ← qué habilita, vinculado a quién, criterios técnicos
EN-02_design.md       ← decisiones técnicas + ADRs aplicables
EN-03_plan.md         ← tareas atómicas con criterios verificables (Regla 7b)
EN-04_closure.md      ← sign-off + qué quedó habilitado
```

**Sin BDD/SDD/TDD separados** — el enabler no tiene comportamiento user-facing. Esa parte vive en las features/stories que consumen el enabler.

### Bugs (`BG-XX_<slug>.md`)

Un **bug** es un defecto detectado en código de producción (o en la suite que protege producción): el sistema hace algo distinto a lo que la story/feature que lo creó dejó especificado.

**Ubicación — 2 scopes** (ver Regla 20 para detalle):

| Scope | Ubicación | Skill | Cuándo |
|---|---|---|---|
| **Story** (default) | `docs/works/features/FT-XX/user-stories/HU-YY/bugs/BG-XX_<slug>.md` | `/fremi-story-bug FT-XX/HU-YY` | Bug atribuible a UNA story concreta |
| **Feature** | `docs/works/features/FT-XX/bugs/BG-XX_<slug>.md` | `/fremi-feature-bug FT-XX` | Bug transversal a varias stories, o afecta contrato de feature sin trazar a UNA story |

Numeración `BG-XX` **local al scope** — cada story/feature arranca desde `BG-01` en su carpeta `bugs/`. Referencia compuesta: `FT-XX_HU-YY_BG-ZZ` (story) o `FT-XX_BG-ZZ` (feature).

**Un archivo único por bug**, no folder. Estructura:
- Síntoma observado, impacto y severidad.
- Reproducción + test rojo (Regla 8).
- Causa raíz.
- Fix aplicado (¿cambió la spec? → Regla 10 + ADR).
- Vinculaciones (story origen, ADRs, releases).
- Cierre (DoD + sign-off).

**Si el comportamiento "incorrecto" NO está cubierto en ninguna story** → no es bug, es un gap de spec. Crear/extender la story primero, después registrar el bug.

### Procedimiento

1. **Crear enabler:** `/fremi-enabler <nombre> [--feature FT-XX | --story FT-XX/HU-YY]`.
2. **Crear bug** — según scope: `/fremi-story-bug FT-XX/HU-YY <slug>` (bug local a UNA story) o `/fremi-feature-bug FT-XX <slug>` (bug transversal a la feature).
3. Bifurcaciones técnicas durante `EN-02_design.md` → **Regla 3b** (pausar, opciones, ADR).
4. Si un bug revela cambio de spec → **Regla 10** (actualizar `FW-05_sdd-spec.md` + ADR).
5. Enablers tienen su propio closure (`EN-04_closure.md`); sin él, el enabler sigue abierto.
6. Bugs abiertos en una story **bloquean parcialmente** su cierre (Regla 11) — el `FW-09_checkwork.md` debe reflejarlo en su sección "Bugs abiertos asociados".

### Anti-patrones

- ❌ Crear enabler "porque suena bien" sin features/stories vinculadas que lo justifiquen.
- ❌ Llamar enabler a un refactor sin cambio de capacidad — eso es `extra/`.
- ❌ Llamar bug a una capacidad faltante — eso es feature/story.
- ❌ Bug fuera de una story (en carpeta global) — los bugs salen de stories, viven en stories.
- ❌ Fix sin test rojo previo (Regla 8).
- ❌ Cerrar story con bugs abiertos sin resolverlos o transferir el seguimiento (Regla 11).

---

## Regla 16 — `FW-00_explore` y `FW-02_proposal` son condicionales, gobernados por `config.yaml`

La cadena de story tiene 11 docs (`FW-00..FW-10`) pero dos son **de obligatoriedad condicional**:

- **`FW-00_explore.md`** — investigación previa (contexto del codebase, alternativas técnicas, hallazgos).
- **`FW-02_proposal.md`** — intent + approach + decisions + impact + rollout + risk. Puente entre `FW-01_definition` (por qué usuario) y `FW-03_scope` (alcance detallado).

Los otros 9 (`FW-01`, `FW-03..FW-10`) son **obligatorios siempre**.

### Fuente de verdad: `config.yaml`

`~/.fremi/framework/settings/config.core.yaml` bajo la clave `config.story.yaml → conditional_rules` declara **cuándo son obligatorios y cuándo se pueden omitir**. Es la única fuente autorizada para decidir esto; los skills que generan/validan stories leen ese archivo.

**Criterios actuales (resumen — el detalle vive en `config.yaml`):**

`FW-00_explore.md` es OBLIGATORIO si al menos UNO aplica:
- La story toca un área del codebase que el implementador no conoce.
- Existen 2+ approaches técnicos plausibles que ameritan comparar antes de proponer.
- La story integra con una librería/servicio externo no usado antes en el proyecto.
- La story es de migración o reemplazo.

`FW-02_proposal.md` es OBLIGATORIO si al menos UNO aplica:
- La story introduce un contrato externo nuevo (endpoint, evento, comando público).
- La story tiene una bifurcación técnica que dispara Regla 3b.
- La story afecta 3+ archivos no triviales o cruza módulos.
- La story cambia comportamiento visible al usuario final.
- La story tiene riesgo de rollback (migración de datos, API break).

Ambos son **opcionales** en el resto de los casos (bug fixes chicos, ajustes de configuración interna, refactors locales).

### Procedimiento cuando SÍ aplican

1. Antes de arrancar la story, evaluar los criterios de arriba. Si aplica alguno → crear el doc.
2. `FW-00_explore` se escribe ANTES que `FW-01_definition` (el explore informa el definition — codebase real puede reencuadrar el problema).
3. `FW-02_proposal` se escribe DESPUÉS de `FW-01_definition` y ANTES de `FW-03_scope`. El definition dice "por qué", el proposal dice "cómo alto nivel + qué decidimos + qué riesgo aceptamos", y recién ahí el scope detalla límites.
4. Si en el proposal aparecen bifurcaciones técnicas → aplica Regla 3b (pausar, opciones al usuario, ADR).

### Procedimiento cuando NO aplican

- Omitir el archivo. **No crear placeholders vacíos** con texto tipo "N/A" — un archivo ausente es señal legítima de "no aplica".
- El `FW-10_closure.md` NO exige presencia de FW-00/FW-02 si no aplicaron; solo verifica su completitud si existen.

### Anti-patrones a evitar

- ❌ Escribir `FW-02_proposal` cuando el criterio no aplica sólo por "completitud" — es papeleo puro.
- ❌ Meter en `FW-01_definition` contenido que pertenece a proposal (approach, decisiones técnicas) porque no se creó el proposal.
- ❌ Copiar el `FW-00_explore` de una story vieja porque "el codebase se ve parecido" — el explore es específico al terreno actual.
- ❌ Cambiar los criterios de obligatoriedad inline en una story — se cambian en `config.yaml` y se hace sweep.

---

## Regla 17 — Living Versioning: cada artifact tiene versión + changelog + linaje

Todos los artifacts del framework llevan una **versión semver** (`MAJOR.MINOR.PATCH`) en su frontmatter. Los docs **living** (que crecen con el tiempo) llevan además un **changelog inline** al pie. Los docs **snapshot** registran la **versión del padre** al momento de crear y al momento de cerrar.

**Objetivo**: en cualquier momento poder responder "¿en qué versión del producto/feature nació y se cerró este artifact?" — sin esto, la trazabilidad histórica se pierde.

### Fuente de verdad operativa

`~/.fremi/framework/settings/config.core.yaml → versioning.*` gobierna:
- **`doc_types.living` / `doc_types.snapshot`** — qué archivos son living y cuáles son snapshot.
- **`bump_rules`** — cuándo se bumpea MAJOR / MINOR / PATCH.
- **`frontmatter`** — campos obligatorios en el YAML del inicio de cada doc.
- **`changelog`** — formato del changelog inline al pie de docs living.
- **`parent_bump_triggers`** — cuándo un evento (story cierra, feature cierra, ADR aceptado…) obliga a bumpear un padre.

Los skills consultan este archivo antes de crear o cerrar artifacts. No se cambia la política de versionado inline en el doc — se cambia en el config.

### Frontmatter obligatorio

Todo doc del framework arranca con este bloque YAML:

**Doc living** (product/*, feature/definition|spec|decisions, FW-09_checkwork):
```yaml
---
version: 1.3.0
created: 2026-06-15
last_updated: 2026-07-13
doc_type: living
ancestor:                     # sólo si el doc tiene padre
  id: product                 # ID del padre
  version_at_creation: "0.5.0"
---
```

**Doc snapshot** (FW-01..08,10, EN-*, BG-*, EX-*):
```yaml
---
version: 1.0.0                # snapshots suelen quedar en 1.0.0
created: 2026-06-19
last_updated: 2026-06-19
doc_type: snapshot
ancestor:
  id: FT-01
  version_at_creation: "2.1.0"
  version_at_closure: "2.2.0"  # se rellena cuando el snapshot cierra
---
```

### Reglas de bump (docs living)

| Segmento | Cuándo | Ejemplo |
|---|---|---|
| **MAJOR** | Breaking change — el contrato/scope existente cambia | Story MODIFICA un requirement previo del spec; producto re-scoped |
| **MINOR** | Agregado — nuevo contenido válido bajo contrato actual | Story AGREGA nuevo requirement; nuevo ADR aceptado; nueva feature al plan |
| **PATCH** | Aclaración sin cambio semántico | Typo, mejor redacción, completar TBD ya decidido |

### Changelog inline (docs living)

Al pie del doc, sección `## Changelog`:

```markdown
## Changelog

- **v2.2.0** — 2026-06-21 — HU-04 cierra: agrega R3 (modo delivery URL) y modifica R2. [origen: HU-04_delivery-mode-url-and-direct]
- **v2.1.0** — 2026-06-19 — HU-02 cierra: agrega R2 (render PDF). [origen: HU-02_static-html-to-pdf]
- **v1.0.0** — 2026-05-30 — Feature creada. [origen: usuario]
```

Cada entry incluye el **origen** — qué artifact disparó el bump. Es la trazabilidad hacia abajo.

### Fase de "actualización live" al cerrar un artifact

Cerrar un snapshot (firmar `FW-10_closure`, `EN-04_closure`, sección `Cierre` del bug, etc.) **obliga a bumpear los padres afectados** según `parent_bump_triggers`:

- **Story cierra** → bumpear `feature/spec.md` (según qué agregó/modificó la story), `feature/decisions.md` (si hubo ADRs nuevos), `feature/definition.md` (patch si confirmó supuestos).
- **Feature cierra** → bumpear `product/plan.md` (marca completada), `product/definition.md` (patch/minor/major según impacto).
- **Enabler cierra** → bumpear su padre (product/feature/story según scope).
- **Bug cierra** → bumpear `feature/spec.md` según qué implicó el fix.
- **ADR aceptado** → bumpear `product/decisions.md` o `FT-XX/decisions.md` (MINOR por default; MAJOR si reemplaza otro ADR).

Esta operación es **obligatoria antes de firmar el snapshot** — el closure inválido si no bumpeó al padre.

### Rastreo ancestral al crear cualquier artifact

Cuando cualquier skill crea un artifact nuevo, DEBE:

1. Leer la versión **actual** del padre inmediato (feature, product, o story según aplique).
2. Rellenar el `ancestor.version_at_creation` en el frontmatter del artifact recién nacido.
3. Registrar en el changelog del padre (si el padre es living) que el nuevo artifact nació apoyado en esa versión.

**Ejemplo concreto**:
- Feature FT-05 nace cuando `product/plan.md` está en v1.5.0. `FT-05/definition.md` frontmatter registra `ancestor.version_at_creation: "1.5.0"`.
- Story HU-01 de FT-05 nace cuando `FT-05/definition.md` está en v1.0.0. `HU-01/FW-01_definition.md` frontmatter registra `ancestor.version_at_creation: "1.0.0"`.
- HU-01 cierra cuando `FT-05/definition.md` está en v1.2.0 (bumpeó por otras stories). `HU-01/FW-10_closure.md` frontmatter registra `ancestor.version_at_closure: "1.2.0"`.

Con esto podés reconstruir la línea temporal completa: qué se sabía cuándo, y qué cambió entre creación y cierre.

### Herramientas

- **`/fremi-story-closure-check`** verifica que los padres afectados fueron bumpeados correctamente antes de firmar.
- **`/spec-merge`** (futuro, cuando se implemente living-spec por feature) hace el bump automático al cerrar la story.
- Skills que crean artifacts (`/fremi-story`, `/fremi-feature`, `/fremi-enabler`, `/fremi-story-bug` o `/fremi-feature-bug`, `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr`, `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento`) cachean la versión del padre al momento de crear.

### Anti-patrones a evitar

- ❌ Crear un artifact sin frontmatter (queda huérfano de versionado).
- ❌ Bumpear el número inventando cuál corresponde — aplicar `bump_rules` de `config.yaml` como referencia.
- ❌ Firmar closure sin actualizar el padre — deja el rastro incompleto.
- ❌ Cambiar la versión de un doc snapshot ya firmado (el snapshot es inmutable después de cerrar).
- ❌ Editar el changelog "creativamente" — cada entry debe corresponder a un cambio real y a un origen identificable.
- ❌ Duplicar versiones (dos entries con el mismo número).

---

## Regla 18 — Cada step del `flow.sequence` es un skill invocable

Los `config.<capa>.yaml → flow.sequence` declaran la **secuencia canónica de skills** para completar el ciclo de esa capa. **Cada step debe apuntar a un skill real invocable** (`/fremi-story-explore`, `/fremi-product-adr`, `/fremi-enabler-plan`, etc.).

### Regla dura

- Si un "paso" no tiene skill asociado → **NO es step del flow**.
- Los pasos que ejecuta el usuario a mano dentro de un skill (ej: llenar sección `root-cause` del bug, caracterizar reproducción) viven en `procedure_after_creation` o `procedure_manual`, **NO en `flow.sequence`**.

### Justificación

Confundir "step del flow" con "cualquier cosa que el usuario hace" desdibuja la interfaz. `flow.sequence[i].skill` es el **contrato** que un agente puede invocar. Si algo no se puede invocar como skill, no es step.

### Ejemplos

- **`config.extra.yaml`** tiene `flow.sequence: []` porque extra es edición manual — no hay skills involucrados. Sus "pasos" viven en `procedure_manual`.
- **`config.bug.story.yaml`** y **`config.bug.feature.yaml`** tienen `flow.sequence` con **UN step** (`/fremi-story-bug` o `/fremi-feature-bug` respectivamente). El trabajo interno del bug (caracterizar, fix, firmar) vive en `procedure_after_creation`.
- **`config.enabler.yaml`** tiene 5 steps porque cada uno de los 4 docs (definition, design, plan, closure) tiene su sub-skill dedicado (`/fremi-enabler-definition`, `/fremi-enabler-design`, `/fremi-enabler-plan`, `/fremi-enabler-closure`).

### Cómo aplicar

Cuando se diseña o edita un `config.<capa>.yaml`:
- Cada entry de `flow.sequence` debe tener campo `skill:` con un skill que exista en `~/.fremi/framework/skills/`.
- Si aparece un paso sin skill → crear el sub-skill correspondiente O mover el paso a `procedure_manual`/`procedure_after_creation`.

---

## Regla 19 — Templates viven en el skill dueño (ownership)

**Cada template canónico vive en `references/` del skill que CREA/PUEBLA el artefacto**. Si otro skill orquesta o hace referencia al mismo artefacto, mantiene un **symlink** en su propio `references/` apuntando al canónico.

### Regla dura

- **Un archivo, un dueño**. El template real vive en el skill dueño.
- **Otros skills usan symlinks** (no copias) que apunten al canónico.
- Si querés editar el template, editás el **archivo real** — todos los symlinks reflejan el cambio automáticamente.

### Justificación

Copias duplicadas de un template en múltiples skills derivan (drift) con el tiempo. Symlinks preservan single source of truth y hacen visible la relación dueño → referencia.

### Ejemplos

- `FW-00_explore-template.md` vive en `story/skills/explore/references/` — es dueño `/fremi-story-explore`. `story/references/FW-00_explore-template.md` es symlink al canónico.
- `FW-05_sdd-spec-template.md` vive en `story/skills/sdd/references/` — dueño `/fremi-story-sdd`. `story/references/FW-05_sdd-spec-template.md` es symlink.
- ADR entry template vive en 3 lugares (`product-adr`, `feature-adr`, `story-adr`) — cada scope tiene su template independiente porque los ejemplos son distintos según scope. NO son symlinks entre sí.

### Cómo aplicar

- Al crear un skill que produce contenido nuevo → crear su template en `references/` del propio skill.
- Al crear un skill que orquesta múltiples otros (ej: `/fremi-story` que ejecuta los 11 sub-skills) → mantener symlinks en su `references/` apuntando a los templates de los sub-skills dueños.
- Al modificar un template → editar el archivo real, no el symlink.

### Excepción — templates específicos por scope

Cuando dos skills que operan sobre el "mismo" concepto tienen contexto distinto (ej: `/fremi-product-adr`, `/fremi-feature-adr`, `/fremi-story-adr` — el mismo template ADR con ejemplos por scope), cada uno tiene su **template independiente** (no symlinks). Los templates comparten estructura pero difieren en detalles.

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

---

## Regla 21 — Skills organizados jerárquicamente por capa + prefijo global `fremi-`

Los skills del framework se organizan **físicamente por capa** (`<capa>/skills/<sub>/`) y se exponen en `.claude/skills/` con **doble prefijo**:

1. **`fremi-`** — prefijo global del framework (obligatorio para todo skill de `~/.fremi/framework/`).
2. **`<capa>-`** — prefijo estructural que refleja jerarquía cuando corresponde.

Resultado: `fremi-<capa>-<sub>` (ej: `fremi-story-explore`, `fremi-product-adr`, `fremi-enabler-plan`).

### Regla dura — Prefijo `fremi-`

- **Todo skill de `~/.fremi/framework/`** (orquestador, sub-skill, reverse, tools) debe:
  - Tener `name: fremi-<...>` en el frontmatter de su `SKILL.md`.
  - Publicarse en `.claude/skills/` como symlink `fremi-<...>`.
  - Invocarse por el usuario como `/fremi-<...>`.
- **Los skills de proyecto** (`docs/project/skills/`, creados con `/fremi-add-skill`) **NO llevan prefijo** — así se distinguen los skills reusables del framework de los específicos del proyecto en el autocomplete de Claude Code.
- **El responsable de aplicar la convención** al instalar el framework es el CLI `fremi install`. Al crear symlinks en `.claude/skills/`, garantiza que cada nombre respete el prefijo, aunque el `name:` interno tuviera drift.

### Regla dura — Jerarquía física por capa

- **Sub-skills de una capa** → viven en `~/.fremi/framework/skills/<capa>/skills/<sub>/`.
- **Orquestadores de capa** → `~/.fremi/framework/skills/<capa>/SKILL.md` con `name: fremi-<capa>` (ej: `fremi-story`, `fremi-product`).
- **Skills globales / transversales** → viven directo en `~/.fremi/framework/skills/<name>/` (ej: `fremi-sync-check`, `fremi-tools`).
- **Reverse-engineering** → viven en `~/.fremi/framework/reverse-engineering/<name>/` con `name: fremi-reverse-<...>` (ej: `fremi-reverse-story`).
- **Installer** — no existe como skill. El CLI `fremi install` (binario en PATH) hace la instalación.

### Justificación

- **Prefijo `fremi-` global**: aísla los skills reusables del framework de los skills específicos del proyecto y garantiza que el usuario reconoce visualmente qué skill viene de la metodología. También simplifica el sweep del installer.
- **Jerarquía física por capa**: un ingeniero que abre `~/.fremi/framework/skills/story/` ve inmediatamente todos los skills que operan sobre stories, sin tener que buscar en 20+ carpetas planas.

### Ejemplos

```
~/.fremi/framework/skills/
├── product/                        (name: fremi-product)
│   └── skills/
│       ├── iniciativas/            (name: fremi-product-iniciativas)
│       ├── ideas/                  (name: fremi-product-ideas)
│       ├── planteamiento/          (name: fremi-product-planteamiento)
│       ├── definition/             (name: fremi-product-definition)
│       ├── strategies/             (name: fremi-product-strategies)
│       ├── adr/                    (name: fremi-product-adr)
│       └── plan/                   (name: fremi-product-plan)
├── feature/                        (name: fremi-feature)
│   └── skills/
│       ├── adr/                    (name: fremi-feature-adr)
│       └── bug/                    (name: fremi-feature-bug)
├── story/                          (name: fremi-story)
│   └── skills/
│       └── explore/, definition/, proposal/, ...  (name: fremi-story-<sub>)
├── enabler/                        (name: fremi-enabler)
│   └── skills/
│       └── definition/, design/, plan/, closure/  (name: fremi-enabler-<sub>)
├── tools/                          (name: fremi-tools)
│   └── skills/
│       ├── add-skill/              (name: fremi-add-skill)
│       ├── add-hook/               (name: fremi-add-hook)
│       ├── add-rule/               (name: fremi-add-rule)
│       ├── add-mcp/                (name: fremi-add-mcp)
│       ├── delete-skill/           (name: fremi-delete-skill)
│       ├── delete-hook/            (name: fremi-delete-hook)
│       ├── delete-rule/            (name: fremi-delete-rule)
│       └── delete-mcp/             (name: fremi-delete-mcp)
└── sync-check/                     (name: fremi-sync-check)

~/.fremi/framework/reverse-engineering/
├── reverse-story/                  (name: fremi-reverse-story)
├── reverse-feature/                (name: fremi-reverse-feature)
├── reverse-bug/                    (name: fremi-reverse-bug)
├── reverse-enabler/                (name: fremi-reverse-enabler)
├── reverse-product/                (name: fremi-reverse-product)
└── reverse-extra/                  (name: fremi-reverse-extra)

Bootstrap: el CLI `fremi install` (binario en PATH). No hay skill de
instalación — la instalación se orquesta desde la terminal, no desde
un slash-command.
```

En `.claude/skills/` los symlinks conservan el prefijo: `fremi-story-explore`, `fremi-product-iniciativas`, `fremi-feature-bug`, `fremi-add-mcp`, etc.

### Cómo aplicar

- **Skill nuevo de capa**: ubicarlo en `~/.fremi/framework/skills/<capa>/skills/<sub>/` y usar `name: fremi-<capa>-<sub>`.
- **Skill nuevo transversal**: ubicarlo en `~/.fremi/framework/skills/<name>/` con `name: fremi-<name>`.
- **Skill nuevo de proyecto** (via `/fremi-add-skill`): vive en `docs/project/skills/<name>/`, **sin prefijo** `fremi-`.
- **Verificación en instalación**: el CLI `fremi install` es idempotente y corrige los symlinks para que respeten la convención `fremi-`.

### Anti-patrones

- ❌ Crear un skill de framework con `name: story` (sin prefijo `fremi-`) — colisiona conceptualmente con skills de proyecto.
- ❌ Prefijar un skill de proyecto con `fremi-` — se pierde la señal de que es específico del proyecto.
- ❌ Referenciar un skill como `/story` en lugar de `/fremi-story` en docs/configs — el installer garantiza que sólo `fremi-*` está publicado.

---

## Regla 22 — Config operativa per-capa

La configuración operativa está **dividida por capa** en archivos independientes bajo `~/.fremi/framework/settings/`. El `config.yaml` master contiene **sólo globals** + referencias a los archivos per-capa.

### Regla dura

- **`config.yaml`** (master) contiene: `project`, `stack`, `testing`, `versioning`, `phase_rules` (transversales), `preferences`, y un mapa `layers` con paths a los archivos per-capa.
- **`config.<capa>.yaml`** contiene: `docs` (o `sections` para single-file), `conditional_rules` locales, `flow.sequence` + `flow.parallel_allowed`, y campo `active`.
- **Un archivo por capa/scope**:
  - `config.product.yaml`, `config.feature.yaml`, `config.story.yaml`, `config.enabler.yaml`, `config.extra.yaml`.
  - **`config.bug.story.yaml`** y **`config.bug.feature.yaml`** (2 archivos por los 2 scopes del bug).

### Justificación

- Un solo config monolítico crece rápido (v3 ya iba por 600 líneas) y hace difícil ver qué es específico de una capa vs global.
- Separar por capa facilita: (a) desactivar una capa entera con `active: false`, (b) evolucionar cada capa independientemente, (c) revisar cambios de una capa sin ruido de otras.

### Cómo aplicar

- Cambiar el flow o docs de una capa → editar SÓLO su `config.<capa>.yaml`.
- Cambiar reglas transversales (testing, versioning, phase_rules) → editar `config.yaml` master.
- Agregar una capa nueva → crear su `config.<capa>.yaml` + agregar entry en `layers` del master + crear su orquestador skill.

---

## Regla 23 — Hooks como red de seguridad de Regla 17

Los hooks en `~/.fremi/framework/hooks/` **validan automáticamente** que las reglas del framework se cumplen. Actúan como red de seguridad — detectan violaciones en tiempo real. **Por default AVISAN, no bloquean** (exit 0).

### Regla dura

- **Los skills productores son responsables** de aplicar Regla 17 correctamente al crear/editar artefactos.
- **Los hooks son red de seguridad** — verifican que los skills hicieron bien su trabajo.
- **NO son sustitutos** de la lógica en los skills. Un hook que reporta problema significa que un skill falló.

### Hooks que validan Regla 17

- `check-frontmatter.sh` — verifica que hay frontmatter con campos obligatorios.
- `check-version-bump.sh` — verifica que docs living bumpean al editarse.
- `check-changelog-entry.sh` — verifica que hay entry en `## Changelog` para la versión actual.
- `check-parent-bump-on-closure.sh` — verifica que al firmar closure, el padre bumpeó.
- `check-ancestor-coherence.sh` — verifica que `ancestor.version_at_creation` apunta a versión que existe en el padre.

### Hooks que validan otras reglas

- `check-flow-preconditions.sh` — Regla 1 (docs previos existen antes de crear FW-XX).
- `check-strict-tdd.sh` — Regla 7 (test asociado si `strict_tdd: true`).
- `check-workflow-stage.sh` — reporta estado del flujo al recibir prompt.
- `sync-checkwork.sh` — recuerda actualizar checkwork al editar plan.
- `audit-on-stop.sh` — auditoría ligera al terminar sesión.

### Cómo aplicar

- Registrar los hooks relevantes en `.claude/settings.json` (ver `~/.fremi/framework/hooks/README.md`).
- Los hooks se disparan según su evento (PostToolUse, PreToolUse, UserPromptSubmit, Stop).
- Para hacer un hook **bloqueante**: descomentar la línea `# exit 2` en el hook — sólo cuando el proyecto está listo para rigor estricto.
- Complementar con `/fremi-sync-check` para auditoría bajo demanda (Regla 12 + Regla 17).

### Anti-patrones

- ❌ Confiar 100% en los hooks — son red de seguridad, no motor de actualización.
- ❌ Deshabilitar hooks porque "molestan" — su función es alertar cuando algo se salta.
- ❌ Hacer hooks bloqueantes desde el arranque — arrancan como informativos hasta que el equipo esté cómodo.

---

## Regla 24 — Ningún skill del framework se ejecuta sin instalación previa

Antes de invocar **cualquier** skill del framework (`/fremi-*`), pipeline (`/fremi-pipeline-*`), o hook automatizado, la IA debe verificar que **el framework está instalado en el proyecto**. Si no lo está → **abortar** la invocación y proponer correr `fremi install` (el CLI).

### Justificación

El framework vive en `~/.fremi/framework/` como fuente de verdad, pero los skills se descubren desde `.claude/skills/` (donde el harness los busca). Sin la instalación, `.claude/skills/` no tiene symlinks al framework y las invocaciones fallan silenciosamente o resuelven a versiones stale. Correr un skill "a mano" leyendo el `SKILL.md` desde `~/.fremi/framework/` sin haber instalado deja los hooks desregistrados, los rules sin referenciar en `CLAUDE.md` y la nomenclatura sin garantía de convención `fremi-` (Regla 21) — es peor que no correrlo.

### Definición operativa de "instalado"

El framework está instalado cuando **ambas** condiciones se cumplen:

1. **Symlinks `fremi-*` presentes en `.claude/skills/`.** Al menos los orquestadores (`fremi-product`, `fremi-feature`, `fremi-story`, `fremi-enabler`, `fremi-tools`) deben existir como symlinks apuntando a `~/.fremi/framework/skills/<capa>/`.
2. **`CLAUDE.md` en la raíz** existe y referencia `~/.fremi/framework/rules/workflow.md` y `~/.fremi/framework/flows/workflow.md`.

Check operativo mínimo (barato, sin invocar tooling externo):

```
[ -L .claude/skills/fremi-story ] && [ -f CLAUDE.md ] && \
  grep -q "~/.fremi/framework/rules/workflow.md" CLAUDE.md
```

Si el check falla → framework NO instalado.

### Bootstrap

El bootstrap del framework es el **CLI `fremi install`**, no un skill. No existe un `/fremi-install-framework` slash-command — la instalación se orquesta desde el binario `fremi` en la terminal, que crea los symlinks, actualiza `CLAUDE.md`, y copia los settings al proyecto. Sin el CLI no hay forma de arrancar (chicken-and-egg no aplica: el CLI vive en tu PATH, no depende de que Claude pueda descubrir skills).

### Procedimiento

Al recibir una invocación de skill/pipeline/hook, **antes** de ejecutar el procedimiento del skill:

1. Correr el check operativo.
2. Si pasa → proceder con normalidad.
3. Si falla → **abortar sin efectos laterales** con este mensaje:
   ```
   El framework no está instalado en este proyecto.
   Corré `fremi install` en la terminal antes de invocar cualquier skill del framework.
   ```
4. **No** ejecutar el skill ni instalarlo silenciosamente por el usuario.

### Excepciones (skills exentos del guard)

Ninguna. Todo skill del framework requiere que el CLI `fremi install` haya corrido primero. Los reverse-engineering skills (`/fremi-reverse-*`) no son excepción — requieren framework instalado como cualquier otro.

### Anti-patrones

- ❌ La IA lee `SKILL.md` desde `~/.fremi/framework/skills/…` y ejecuta el procedimiento "manualmente" sin correr install → viola Regla 24.
- ❌ Un hook se dispara y ejecuta lógica del framework sin haber verificado que el framework está instalado.
- ❌ Auto-instalar sin permiso del usuario cuando el check falla — la instalación crea symlinks en `.claude/` que son cambios reales del entorno; requiere aprobación explícita.
- ❌ Instalar "sólo la parte que necesito" ignorando el resto (los hooks, las rules) — la instalación es atómica por diseño.

### Cuándo NO aplica

- Trabajo puramente sobre `docs/works/` **sin invocar un skill** (ej: el usuario edita un `FW-05_sdd-spec.md` a mano en su editor). Regla 24 gobierna invocaciones de skills, no edición manual.
- Lectura de docs (`~/.fremi/framework/**`, `docs/works/**`) — el guard aplica sólo a ejecución de procedimientos.

---

## Reglas de reverse-engineering — archivo separado

Las Reglas 25-32 gobiernan **reverse-engineering** — la vía formal para alinear código pre-existente al framework. Viven en un archivo dedicado:

> **`~/.fremi/framework/rules/reverse.md`** — Reglas 25-32:
>
> - **R25** — Reverse-engineering es vía formal de alineación (no procedimiento excepcional).
> - **R26** — Default `--transparent` (frontmatter con `reverse_engineered:*`).
> - **R27** — Preguntas dirigidas para gaps no-inferibles — nunca inventar.
> - **R28** — Reverse no reemplaza revisión humana — reportar gaps.
> - **R29** — Regla 8 (test rojo primero) es inconstruible retroactivamente.
> - **R30** — Regla 17 (versionado + linaje) sí aplica con timestamps inferidos.
> - **R31** — Reverse NO se usa para trabajo nuevo.
> - **R32** — Ratio reverse/forward = señal de salud del framework.

Este archivo (`rules/workflow.md`) se lee **junto con** `rules/reverse.md` cuando se ejerce reverse. Ambos son obligatorios.

Skills relacionados: `/fremi-reverse-*` (6 skills en `~/.fremi/framework/reverse-engineering/`).
Pipelines: `/fremi-pipeline-reverse-*` (4 pipelines en `~/.fremi/framework/pipelines/`).
Flow: `~/.fremi/framework/flows/flow.reverse.md`.
Config: `~/.fremi/framework/settings/config.reverse.core.yaml`.

---

## Cómo aplicar estas reglas

Antes de cada acción no trivial:

0. **Verificar instalación (Regla 24)**: antes de invocar cualquier skill/pipeline/hook, chequear que alguno de los orquestadores (`.claude/skills/fremi-story` por ejemplo) es symlink y `CLAUDE.md` existe. Si falla → proponer correr `fremi install` en la terminal y abortar la invocación.
1. **Identificar el tipo de pedido**: cambio de visión, nueva idea, nueva feature, nueva story, cambio de comportamiento, **bug** (Regla 8 + 15), **enabler técnico** (Regla 15), refactor, decisión técnica, **tooling/refactor sin habilitar nada** (Regla 14), **alinear código pre-existente sin docs** (Reglas 25-32 en `rules/reverse.md`).
2. **Identificar la capa**: producto, feature, user story — o **artefacto opcional** (enabler global / dentro de feature / dentro de story; bug dentro de story; extra global). Si el trabajo ya está hecho en código sin docs → vía **reverse** (`rules/reverse.md`).
3. **Identificar la etapa** dentro de la capa.
4. **Verificar que las etapas previas existen** (para enabler/bug: la feature/story padre debe existir cuando aplique). En stories, evaluar además si aplican `FW-00_explore` y/o `FW-02_proposal` según **Regla 16** + `config.yaml`.
5. Si falta una etapa previa: **proponer crearla**, no improvisar.
6. Al crear cualquier artifact: **capturar la versión actual del padre** en el frontmatter (Regla 17). Al cerrar: **bumpear el padre** según `parent_bump_triggers`.

