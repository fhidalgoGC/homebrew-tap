---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-engineering/flow.md
  version_at_creation: null
---

# Flujo — Skill REVERSE-PRODUCT (`/fremi-reverse-product`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de ejecución.
> **Invocación / documentación de skill:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — describe las 6 fases genéricas. Este documento detalla cómo ese arco se materializa en la capa producto.

---

## Qué hace este skill

Reconstruye los **7 docs de la capa producto** — iniciativas, ideas, planteamiento, definition, strategies, decisions, plan — a partir de features y stories existentes, el stack del proyecto y una conversación guiada con el usuario.

Es el caso **más ambicioso** de reverse-engineering en el framework. A diferencia de reverse-story (que infiere principalmente de código y tests) o reverse-feature (que consolida stories), reverse-product debe reconstruir **intención estratégica** que frecuentemente no existió formalmente al arrancar. El riesgo de racionalización post-hoc es alto y se declara explícitamente (R28).

**Cuándo invocarlo:**
- El proyecto tiene 3+ features en producción pero `docs/works/product/` está vacío o incompleto.
- Se importó código legacy al framework y hay que formalizar la capa producto.
- Se hace una auditoría de fundación de producto.

**Cuándo NO invocarlo:**
- El producto está arrancando ahora → usar el flow normal (`/fremi-product-iniciativas` → ideas → planteamiento → ...).
- No existen features en `docs/works/features/` → sin material para reconstruir.

**Modo `--interactive` fuertemente recomendado**: la capa producto depende del input del usuario en 5 rondas de preguntas. En modo non-interactive el skill acumula las preguntas y las hace juntas — útil para automatización pero puede producir respuestas de menor calidad.

---

## Alcance — docs que produce

| Doc | Fuente principal | Confianza típica |
|---|---|---|
| `iniciativas.md` | Ronda 2 de preguntas + agrupado de features | Baja-media (retroactivas) |
| `ideas.md` | Ronda 3 de preguntas | Baja (memoria del equipo) |
| `planteamiento.md` | Ronda 4 de preguntas + estructura del código | Media |
| `definition.md` | Ronda 1 de preguntas + capacidades de features | Media-alta |
| `strategies.md` | Ronda 5 + stack inferido de package.json / IaC | Media |
| `decisions.md` | Stack inferido + ADRs globales + input del usuario | Media |
| `plan.md` | Enumeración de features con estado | Alta |

---

## Arco narrativo

### Fase 0 — Cargar configuración

El skill lee los archivos de configuración:
- `methodology.core.yaml` — para identificadores y estructura.
- `config.reverse.core.yaml` — defaults de reverse (modo, confidence).

Si alguno falta → abortar.

### Fase 1 — Inventario de features y estado de la capa producto

El skill escanea el folder de features para recolectar el material disponible:
- Enumera cada feature (`FT-XX_<slug>/`), extrae título, descripción, capacidades in-scope, cantidad y estado de stories.
- Revisa `docs/works/product/` para saber qué docs existen (con contenido real), cuáles están vacíos y cuáles faltan.

Si no hay ninguna feature → abortar. Sin features no hay material para reconstruir la capa producto.

El inventario se usa como base para las rondas de preguntas al usuario y para construir `plan.md` directamente.

### Fase 2 — Escanear artifacts técnicos sobrevivientes

Con el inventario como punto de partida, el skill complementa con información técnica:

- **Stack**: `package.json` (dependencias), `serverless.yml` / CDK / Terraform / IaC files (infraestructura), `tsconfig` / build config.
- **Docs**: `README.md` raíz, `CLAUDE.md`, docs de producto existentes (aunque incompletos).
- **ADRs globales**: `product/decisions.md` si existe; ADRs en features que tienen alcance global.

El stack inferido se usa para la ronda de estrategias y para los ADRs retroactivos.

### Fase 3 — Preguntas dirigidas al usuario (5 rondas, Regla 27)

El núcleo del skill: una conversación estructurada que convierte el conocimiento del usuario en el contenido de los docs.

**Regla dura (R27)**: el skill infiere y **pregunta al usuario**. **Nunca inventa**. Si el usuario no puede responder, el campo queda TBD con nota explicativa.

**Advertencia obligatoria (R28)**: al iniciar las rondas, el skill emite siempre:

> "ATENCIÓN — reverse-product tiene riesgo alto de racionalización post-hoc. Las iniciativas y el planteamiento que vamos a reconstruir pueden no reflejar la motivación estratégica original (que puede no haber existido formalmente). Se recomienda --transparent y validación con stakeholders originales si están disponibles."

**Las 5 rondas:**

**Ronda 1 — Producto (`definition.md`)**
- ¿Qué hace este producto en 3-5 líneas? (para quién, cómo se diferencia)
- ¿Quiénes son los usuarios primarios y secundarios?
- ¿Qué KPIs medibles definen el éxito del producto?
- ¿Qué restricciones globales aplican?

**Ronda 2 — Iniciativas (`iniciativas.md`)**
El skill propone un agrupado de las features en 1-3 iniciativas estratégicas y pide al usuario confirmación o ajuste. Para cada iniciativa: hipótesis de negocio, métricas leading/lagging, escala esperada.

**Ronda 3 — Ideas exploradas (`ideas.md`)**
- ¿Qué approaches se descartaron al arrancar? (brainstorm retroactivo)
- Para cada idea descartada: pros, contras, motivo de descarte.

Las ideas descartadas son casi imposibles de reconstruir sin memoria del equipo. El skill acepta respuestas parciales o vacías con warning, sin inventar.

**Ronda 4 — Planteamiento (`planteamiento.md`)**
- ¿Cuál fue el approach elegido y por qué?
- ¿Qué restricciones guiaron el approach?

**Ronda 5 — Estrategias técnicas (`strategies.md`)**
El skill muestra el stack actual inferido (package.json / IaC) y pide al usuario:
- Confirmar si el stack inferido es correcto.
- Nombrar alternativas que se consideraron.
- Explicar por qué se eligió este stack.

En modo `--interactive`, el skill hace las rondas una por una, mostrando las inferencias parciales y preguntando antes de continuar. En modo non-interactive, acumula todo y pregunta al final.

### Fase 4 — Reconstruir los 7 docs

Con las respuestas de las rondas + el escaneo técnico, el skill construye los 7 docs:

- **`iniciativas.md`**: 1-3 iniciativas con hipótesis y métricas de las Rondas 2.
- **`ideas.md`**: brainstorm retroactivo de la Ronda 3 (o sección vacía con nota si no hay memoria).
- **`planteamiento.md`**: framing + approach + restricciones de la Ronda 4.
- **`definition.md`**: producto formal de la Ronda 1 + capacidades in-scope agregadas de features.
- **`strategies.md`**: comparación de 2-3 estrategias (Ronda 5). Estrategia actual marcada como Elegida.
- **`decisions.md`**: ADRs retroactivos del stack. Cada ADR lleva la fecha del primer commit relacionado y la nota "Decisión tomada de facto al arrancar el proyecto (YYYY-MM). Formalizada retroactivamente." En modo `--transparent`: `discovered_during_reverse: true`.
- **`plan.md`**: roadmap con todas las features enumeradas con estado (Cerrada / En curso / Planeada).

**Sobre `decisions.md` y los ADRs retroactivos:**

Un ADR que dice "elegimos Node.js sobre Python" retroactivamente asume que hubo comparación real. Si sólo se usó Node.js por default sin evaluación, el ADR sería ficticio. El skill marca explícitamente esta situación para que el lector sepa que fue una decisión de facto, no de derecho (R28).

### Fase 5 — Timestamps + linaje (Regla 17, R30)

Para cada doc producido:
- `created` = fecha del primer commit en el repo (raíz del proyecto).
- `version` = `0.1.0` para todos (living docs — la capa producto evoluciona).
- Changelogs retroactivos con `--from-git-history` si es posible.
- `ancestor`: `iniciativas.md` es la raíz del framework — no tiene ancestor externo. Los demás docs de producto se referencian entre sí según la cadena.

**Modo `--transparent`** (default, especialmente crítico en producto): agrega el bloque `reverse_engineered:*` al frontmatter de todos los docs.
**Modo `--stealth`** (fuertemente desaconsejado para producto): los docs quedan indistinguibles del flow forward. El riesgo: un ADR de stack sin marca puede confundir revisores futuros sobre si la decisión fue real o ficticia.

**Si no hay `.git`**: usar fecha actual con `reverse_engineered_confidence: 0.3` para todos.

### Fase 6 — Reporte final

La capa producto es la capa raíz del framework — no hay padre externo que bumpear. El skill emite el reporte final con los 7 docs producidos, gaps declarados y advertencias.

---

## Stop events — dónde pausa el skill

| Stop event | Cuándo aparece | Acción |
|---|---|---|
| `post_hoc_risk_warning` | Siempre — al iniciar la reconstrucción | Emitir advertencia obligatoria sobre riesgo de racionalización |
| `rationale_not_provided` | El usuario no puede dar motivación estratégica clave | Marcar campo TBD + continuar |
| `initiative_grouping_conflict` | El usuario rechaza el agrupado de features propuesto sin alternativa | Preguntar cómo agruparía; si no responde → usar agrupado del skill con low confidence |
| `ideas_not_recoverable` | El usuario no recuerda ideas descartadas | Generar `ideas.md` con sección vacía + nota; no inventar |
| `adr_rationale_missing` | ADR de stack inferido sin motivación real | Marcar "Decisión de facto — Rationale: TBD" |
| `global_adr_scope_ambiguous` | ADR que podría ser feature-scope o product-scope | Preguntar al usuario el alcance |
| `git_history_missing` | No se encuentra `.git` | Pedir fechas manuales o asumir hoy con confidence 0.3 |

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R25** — Trabajo pre-existente; 3+ features en producción o desarrollo formal.
- **R24** — Framework instalado.
- Al menos 1 feature en `docs/works/features/`.
- `methodology.core.yaml` presente.

---

## Transparent vs. stealth — el trade-off en producto

Para reverse-product, el argumento a favor de `--transparent` es más fuerte que en cualquier otra capa:

**Usar `--transparent`** (default, R26): la capa producto refleja intención estratégica. Su origen inferido es información crítica para:
- Retrospectivas — distinguir "así lo planeamos" de "así lo reconstruimos".
- Auditorías de deuda estratégica — saber cuánto de la "estrategia" fue planificada vs post-hoc.
- Decisiones futuras — evitar tratar iniciativas reconstruidas como hipótesis validadas.
- Nuevos integrantes — saber que el `iniciativas.md` tiene confidence 0.6 es contexto valioso.

**Usar `--stealth`** sólo cuando: hay una decisión explícita de proyecto (ADR) de que el historial de deuda estratégica no agrega valor para el equipo. Incluso en ese caso, la advertencia de este skill se aplica.

---

## Este skill no reemplaza estrategia

Reverse-product es útil para **inventariar** el producto tal como está — no para sustituir el trabajo estratégico de definir a dónde va. Después de correr reverse-product, el equipo debería hacer un ejercicio real de discovery para actualizar iniciativas hacia adelante (usando el flow normal de `/fremi-product-iniciativas`).

---

## Advertencias de revisión humana (Regla 28)

El output de reverse-product es **base** con mayor riesgo que otras capas:

- **Iniciativas reconstruidas**: son interpretaciones post-hoc que pueden no reflejar la motivación estratégica original. Validar con stakeholders del producto si están disponibles.
- **ADRs de stack**: pueden representar decisiones de facto (no de derecho). Un ADR-001 "elegimos Node.js" asume evaluación que quizás no ocurrió.
- **Ideas descartadas**: casi imposibles de reconstruir sin memoria del equipo. El `ideas.md` resultante es incompleto por diseño.
- **Planteamiento**: si el producto arrancó sin un approach formal, el planteamiento reconstruido es conjetural. Marcar confidence baja.

---

## Estado final después del skill

La capa producto queda con los 7 docs formales:

```
docs/works/product/
├── iniciativas.md     (v0.1.0 — N iniciativas retroactivas)
├── ideas.md           (v0.1.0 — brainstorm retroactivo)
├── planteamiento.md   (v0.1.0 — approach elegido)
├── definition.md      (v0.1.0 — producto formal + capacidades de features)
├── strategies.md      (v0.1.0 — N estrategias evaluadas; actual marcada Elegida)
├── decisions.md       (v0.1.0 — N ADRs históricos retroactivos)
└── plan.md            (v0.1.0 — N features en roadmap con estado)
```

**Próximo paso natural**: revisar los gaps reportados + correr `/fremi-sync-check` para verificar coherencia entre la capa producto reconstruida y las features/stories existentes. Si hay features sin docs formales, considerar `/fremi-reverse-feature`.

---

## Reglas activas durante la ejecución

- **R25** — Precondiciones de reverse.
- **R26** — Frontmatter transparent por default — especialmente importante en producto.
- **R27** — 5 rondas de preguntas dirigidas; nunca inventar.
- **R28** — Riesgo alto de racionalización post-hoc; advertencia obligatoria.
- **R30** — Regla 17 con timestamps inferidos; no hay padre externo.
- **R31** — Reverse sólo para producto pre-existente; no para producto arrancando ahora.
- **R32** — Monitorear ratio reverse/forward como señal de salud del framework.
- **R17** — Frontmatter versionado; `iniciativas.md` es raíz (sin ancestor externo).
- **R4** — Discovery antes de formalización (aquí invertido; declarar explícitamente).
- **R3b** — Bifurcaciones estratégicas → ADR con `discovered_during_reverse: true`.
- **R20** — ADRs: aclarar scope producto vs feature.
- **R24** — Framework instalado.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md) — R25–R32
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Flow normal de producto: `/fremi-product-iniciativas` + sub-skills
- Skills complementarios: `/fremi-reverse-feature`, `/fremi-reverse-story`

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del skill reverse-product.
