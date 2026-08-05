# `docs/frmwk/pipelines/` — Pipelines de auto-ejecución

> **Un pipeline es una invocación única que corre el flujo COMPLETO de una capa (o subconjunto declarado) sin pausar entre pasos, salvo cuando aparece una duda que la IA no puede resolver por su cuenta.**
>
> Los pipelines contrastan con la invocación manual (skills sueltos), donde el usuario decide en qué momento correr cada sub-skill del flujo.

---

## Modo de ejecución (`interactive` vs `auto`)

Todos los skills y pipelines del framework respetan un `execution_mode` declarado en `config.yaml` (default global) y overridable por capa en `config.<capa>.yaml`. Ver [`docs/frmwk/settings/config.yaml → execution_mode`](../settings/config.yaml) para el schema completo.

**La semántica del modo depende del nivel de invocación**. Un skill suelto no se comporta igual que un pipeline aunque el modo se llame igual.

### Semántica por nivel

| Nivel | `interactive` | `auto` |
|---|---|---|
| **Skill suelto** (`/fremi-story-proposal`, `/fremi-product-ideas`, …) | Pausa **DENTRO** del skill. Valida cada sección/decisión antes de escribirla. | Escribe el doc entero de un tirón. Pausa sólo ante stop events. |
| **Pipeline** (`/fremi-pipeline-story`, `/fremi-pipeline-*`) | Pausa **ENTRE STEPS**. Cada sub-skill interno corre en `auto` (escribe su doc completo), y la IA pausa antes de arrancar el siguiente. | Corre toda la cadena sin pausa. Pausa sólo ante stop events. |

**Regla dura:** dentro de un pipeline, cada sub-skill **SIEMPRE corre en `auto`**. El modo `interactive` de un pipeline modifica sólo la política de pausa **entre steps**, nunca la política interna de cada sub-skill. Ver `config.yaml → execution_mode.pipeline_internal_skill_mode`.

### Precedencia (mayor prioridad primero)

1. Flag `--mode interactive|auto` en la invocación.
2. `execution_mode.default` (para skills) o `execution_mode.pipeline_default` (para pipelines) del `config.<capa>.yaml` de la capa activa.
3. `execution_mode.default` del master `config.yaml`.

### Defaults

| Invocación | Modo por default | Efecto |
|---|---|---|
| Skill suelto | `interactive` | valida contigo cada sección al armar el doc |
| Pipeline | `auto` | corre toda la cadena sin pausas |

### Override explícito por invocación

```
/fremi-story-proposal FT-03/HU-05 --mode auto           # skill: escribe el proposal entero solo
/fremi-story-proposal FT-03/HU-05 --mode interactive    # skill: valida cada sección (default)

/fremi-pipeline-story FT-03 nombre                      # pipeline: corre todo (auto, default)
/fremi-pipeline-story FT-03 nombre --mode interactive   # pipeline: pausa entre cada FW-XX
                                                        #   (skills internos SIGUEN corriendo en auto)
```

### Ejemplo concreto — `/fremi-pipeline-story` en modo `interactive`

```
1. Arranca `/fremi-story-explore` (interno, auto) → escribe FW-00 completo.
2. IA pausa: "Terminé FW-00_explore. ¿Continuamos con FW-01_definition?"
3. Usuario: "sí" (o edita FW-00 antes de dar OK).
4. Arranca `/fremi-story-definition` (interno, auto) → escribe FW-01 completo.
5. IA pausa: "Terminé FW-01_definition. ¿Continuamos con FW-03_scope?"
6. …y así hasta FW-08.
```

El sub-skill `/fremi-story-definition` **no** valida sección por sección con el usuario — lo escribe entero. La pausa es sólo **entre docs**.

### Ejemplo concreto — `/fremi-story-definition` invocado suelto en modo `interactive`

```
1. IA propone título de story y pregunta si va.
2. IA propone CA-001 y pregunta si va o se ajusta.
3. IA propone CA-002 y pregunta si va o se ajusta.
4. …hasta terminar el FW-01_definition.md.
```

Aquí sí hay validación por decisión, porque es skill suelto — no está corriendo dentro de un pipeline.

---

## Qué es un pipeline

Un pipeline **orquesta la secuencia canónica de sub-skills** de una capa (definida en `config.<capa>.yaml → flow.sequence`) en modo automático:

1. El usuario invoca el pipeline **una sola vez** con la información inicial.
2. La IA ejecuta cada step del `flow.sequence` en orden, **sin pedir confirmación entre pasos**.
3. Sólo se detiene ante un **stop event** — duda que la IA no puede resolver sola.
4. Al terminar, la IA reporta qué se produjo, qué quedó pausado (si hubo stop) y cuál es el próximo paso.

## Cuándo usar pipeline vs. sub-skills sueltos

| Escenario | Modo recomendado |
|---|---|
| El usuario ya sabe qué historia / feature / producto quiere y no necesita revisar cada doc antes del siguiente | **Pipeline** |
| El usuario está explorando y quiere validar cada artefacto antes de avanzar | **Sub-skills sueltos** |
| Onboarding / práctica del flujo | **Sub-skills sueltos** |
| Trabajo bajo presión, foco en output rápido | **Pipeline** |
| El usuario quiere pausar tras cada paso para editar o discutir | **Sub-skills sueltos** |

Pipeline ≠ velocidad a cualquier costo — respeta **todas** las reglas del framework (Regla 3b, Regla 12, Regla 17, etc.). Sólo evita el ping-pong "hice X → confirmá → hago Y".

---

## Precondición transversal — framework instalado (Regla 24)

Antes de correr **cualquier** pipeline (o skill), el framework debe estar instalado en el proyecto:

- `.claude/skills/fremi-install-framework` es symlink válido.
- `CLAUDE.md` en la raíz referencia `docs/frmwk/rules/workflow.md`.

Si no lo está → el pipeline aborta con `"Corré /fremi-install-framework antes de invocar el pipeline"`. **La IA no auto-instala** — la instalación crea symlinks reales en `.claude/` y necesita aprobación explícita del usuario. Ver Regla 24 en [`docs/frmwk/rules/workflow.md`](../rules/workflow.md).

Excepciones (skills bootstrap): `/fremi-install-framework` y `/fremi-import-template` son los únicos que pueden correr con framework no-instalado.

---

## Stop events — cuándo un pipeline SE DETIENE y pregunta

Un pipeline **pausa y pregunta al usuario** si y sólo si aparece una de estas situaciones. Todo lo demás lo resuelve sola.

1. **Bifurcación técnica (Regla 3b).** Aparece una decisión con 2+ caminos viables. La IA presenta opciones con pros/contras, espera decisión, registra ADR vía `/fremi-<scope>-adr`, y continúa.
2. **Conditional rule ambigua (Regla 16, sólo en story pipeline).** El pipeline necesita evaluar `explore_when` o `proposal_when` de `config.story.yaml` y **no puede inferir** de la información inicial si el criterio aplica. Pregunta puntual al usuario.
3. **Sync-back a capa superior (Regla 12).** El pipeline detecta que un contenido pertenece a una capa superior (ej: en una story descubre restricción de producto). Pausa, avisa, y espera confirmación para actualizar arriba antes de continuar.
4. **Precondición dura ausente.** Un step requiere un archivo/versión previa que no existe (ej: pipeline story pide `feature/definition.md` y no está). Aborta con instrucciones claras.
5. **Información inicial insuficiente.** La IA no puede completar un doc obligatorio ni siquiera con TODOs — pide el mínimo indispensable al usuario.
6. **Fallo de herramienta / config corrupta.** `methodology.json` no parsea, `config.yaml` inconsistente, permisos de escritura fallan, etc.

**Anti-patrones (pipeline NO pausa por esto):**
- ❌ "¿Confirmás el título del CA?" — la IA elige un título razonable y sigue.
- ❌ "¿Querés que agregue este escenario BDD?" — si es obviamente parte del alcance, se agrega.
- ❌ "¿Continuamos?" — el usuario ya dio ok al invocar el pipeline.
- ❌ "¿Bumpeo la versión del padre?" — es obligatorio, se hace sin preguntar.

---

## Diferencia con skills orquestadores

Los orquestadores (`/fremi-story`, `/fremi-product`, `/fremi-feature`) **crean el andamio** (folder + docs vacíos con templates) y devuelven el control al usuario para que llene cada doc invocando sub-skills.

Un pipeline **crea el andamio Y llena cada doc** de forma autónoma, invocando los sub-skills de la capa correspondiente en orden.

| Aspecto | Orquestador (`/fremi-story`) | Pipeline (`/fremi-pipeline-story`) |
|---|---|---|
| Crea folder | ✅ | ✅ |
| Instancia templates vacíos | ✅ | ✅ |
| Llena contenido de cada doc | ❌ (el usuario llama sub-skills) | ✅ (el pipeline llama sub-skills) |
| Pausa entre docs | N/A | Sólo ante stop events |
| Aplica sync-back | El usuario decide cuándo | Automático (pausa sólo para confirmar cambios) |

---

## Convención de nomenclatura

- Los pipelines viven en `docs/frmwk/pipelines/pipeline.<capa>.md`.
- Se invocan como `/fremi-pipeline-<capa>` (ej: `/fremi-pipeline-story`).
- El prefijo `fremi-` respeta Regla 21.

---

## Listado de pipelines

### Forward — flow normal (capas de trabajo nuevo)

| Pipeline | Archivo | Capa | Corre |
|---|---|---|---|
| `/fremi-pipeline-product` | [`pipeline.product.md`](pipeline.product.md) | PRODUCTO | iniciativas → ideas → planteamiento → definition → strategies → plan |
| `/fremi-pipeline-feature` | [`pipeline.feature.md`](pipeline.feature.md) | FEATURE | definition (+ decisions si aplica) |
| `/fremi-pipeline-story` | [`pipeline.story.md`](pipeline.story.md) | STORY | FW-00..FW-08 (los 9 docs de planificación, no ejecuta código) |

### Reverse — vía de alineación de código pre-existente (Reglas 25-32)

| Pipeline | Archivo | Capa | Corre |
|---|---|---|---|
| `/fremi-pipeline-reverse-product` | [`pipeline.reverse.product.md`](pipeline.reverse.product.md) | PRODUCTO | Los 7 docs de producto + encadena reverse-feature |
| `/fremi-pipeline-reverse-feature` | [`pipeline.reverse.feature.md`](pipeline.reverse.feature.md) | FEATURE | `FT-XX/definition.md` (+ decisions) + encadena reverse-story de sus stories |
| `/fremi-pipeline-reverse-story` | [`pipeline.reverse.story.md`](pipeline.reverse.story.md) | STORY | Los 11 docs FW-00..FW-10 reconstruidos de código/tests/commits |
| `/fremi-pipeline-reverse-enabler` | [`pipeline.reverse.enabler.md`](pipeline.reverse.enabler.md) | ENABLER | Los 4 docs EN-01..EN-04 reconstruidos |

**Bug y Extra reverse son 1 archivo** — sin pipeline propio; se invocan los skills sueltos: `/fremi-reverse-bug`, `/fremi-reverse-extra`.

**Config operativa reverse:** [`../settings/config.reverse.yaml`](../settings/config.reverse.yaml).
**Reglas específicas reverse:** [`../rules/reverse.md`](../rules/reverse.md).
**Flow reverse:** [`../flows/flow.reverse.md`](../flows/flow.reverse.md).

---

## Cómo agregar un pipeline

1. Crear `docs/frmwk/pipelines/pipeline.<capa>.md` siguiendo el template de los existentes.
2. Frontmatter con `name: fremi-pipeline-<capa>` + `description`.
3. Referenciar el `config.<capa>.yaml → flow.sequence` como fuente de verdad de la secuencia — **no duplicar la secuencia en el pipeline**, sólo referenciarla y agregar la política de auto-ejecución.
4. Declarar los **stop events específicos** de esa capa (además de los genéricos de este README).
5. Sumar entry al listado de arriba.

---

## Relación con otras carpetas

| Carpeta | Rol |
|---|---|
| `docs/frmwk/skills/` | Sub-skills invocables individualmente (modo manual). |
| `docs/frmwk/pipelines/` | Pipelines que orquestan sub-skills en modo automático (esta). |
| `docs/frmwk/flows/` | Documentación **descriptiva** del flujo canónico (para humanos). |
| `docs/frmwk/settings/` | Configuración operativa (fuente de verdad de la secuencia). |
| `docs/frmwk/rules/` | Reglas duras que ambos modos (manual y pipeline) deben respetar. |
