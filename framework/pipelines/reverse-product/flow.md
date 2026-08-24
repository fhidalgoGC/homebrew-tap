---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-reverse-product
  version_at_creation: null
---

# Flujo — Pipeline REVERSE-PRODUCT (`/fremi-pipeline-reverse-product`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Skill subyacente:** [`~/.fremi/framework/reverse-engineering/reverse-product/SKILL.md`](../../reverse-engineering/reverse-product/SKILL.md) — lógica de inferencia de los 7 docs de producto.
> **Sub-pipeline:** [`/fremi-pipeline-reverse-feature`](../reverse-feature/PIPELINE.md) — encadenado por cada feature descubierta.
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md).

Este documento describe la **narrativa del flujo** que el pipeline atraviesa cuando corre.

---

## Qué hace el pipeline

**Este es el pipeline más ambicioso y de mayor riesgo del framework.** Reconstruye la capa producto entera a partir de features/stories existentes + código + docs sueltos, siguiendo el orden canónico de discovery → formalización (Regla 4), y luego encadena un sub-pipeline por cada feature.

Riesgo declarado **alto** en `config.reverse.core.yaml` por potencial de **racionalización post-hoc** — la IA puede inferir iniciativas de negocio que suenan coherentes pero no reflejan la historia estratégica real.

Modo `--mode interactive` es el default **y la recomendación fuerte**.

---

## Alcance del pipeline

| # | Fase (id) | Qué hace | Produce |
|---|---|---|---|
| −1 | `verify_preconditions` (preflight) | Verifica R25 + R24 + existencia de features | — (aborta si falla) |
| −2 | `check_product_state` (preflight) | Detecta docs de producto ya existentes | — |
| 0 | `show_risk_warning` | Muestra advertencia de riesgo alto — bloquea en interactive | — |
| 1 | `identify` | Escanea features + docs + README + package.json + IaC | Inventario en memoria |
| 2 | `reconstruct_discovery` | Reconstruye `iniciativas`, `ideas`, `planteamiento` | 3 docs discovery |
| 3 | `reconstruct_formalization` | Reconstruye `definition`, `strategies`, `decisions`, `plan` | 4 docs formalización |
| 4 | `reconstruct_features` | Sub-pipeline reverse-feature por cada FT-XX (secuencial) | Todos los docs de cada feature |
| 5 | `report_aggregate` | Reporte global: confidence + gaps críticos + revisión humana obligatoria | Reporte final |

---

## Arco narrativo

### 1. Advertencia obligatoria — riesgo declarado

Antes de cualquier escaneo, el pipeline muestra al usuario:

```
REVERSE-PRODUCT es de RIESGO ALTO

Vas a reconstruir la capa producto de un proyecto que ya existe. La IA va a
inferir INICIATIVAS de negocio, IDEAS descartadas y DEFINITION del producto
a partir del código y las features existentes.

Riesgo: la IA puede racionalizar decisiones que en realidad nunca se tomaron
formalmente. El resultado puede sonar coherente pero no reflejar la historia
real del negocio.

Recomendación fuerte:
  1. Correr en --mode interactive (default).
  2. Revisar CADA doc antes de aceptar.
  3. Preguntar al usuario original del producto por las iniciativas reales
     ANTES de aceptar las inferidas.
  4. Mantener --transparent (default) para dejar la marca del origen reverse.

¿Continuar? [Sí / No / Necesito el usuario original del producto primero]
```

En `--mode interactive` (default): bloquea hasta respuesta del usuario.
En `--mode auto`: muestra la advertencia pero no bloquea.

### 2. Descubrimiento — inventario del producto

La fase `identify` escanea todas las fuentes del proyecto:

```
Features:      docs/works/features/*/ — FT-XX existentes + stories
Docs:          docs/works/product/* — qué docs de producto ya existen
README:        descripción del producto (resumen de negocio)
Package.json:  stack tecnológico elegido
IaC:           serverless.yml, CDK, terraform — infra declarada
Git:           git log del root — evolución del proyecto
```

Resultado: lista de features a procesar + capacidades del producto + stack elegido + estado actual de los docs de producto.

### 3. Reconstrucción discovery — iniciativas, ideas, planteamiento

La fase `reconstruct_discovery` es donde el riesgo de racionalización post-hoc es mayor:

**`iniciativas.md`** (riesgo más alto):
- La IA agrupa las features en 1-3 iniciativas estratégicas (hipótesis de negocio SAFe).
- **PAUSA OBLIGATORIA** en interactive: mostrar las iniciativas inferidas y preguntar al usuario original del producto si reflejan la realidad estratégica.
- Si el usuario original no está disponible → `rationale: TBD — requiere usuario original del producto`.

**`ideas.md`** (sólo si hay evidencia real):
- Inferible sólo de branches abandonados o commits revertidos claros.
- Si no hay evidencia → la sección queda vacía con warning explícito: "No se detectaron ideas descartadas — puede haberlas; requiere entrevista con el equipo original."

**`planteamiento.md`** (preguntas fuertes al usuario):
- Framing del problema + approach elegido.
- Restricciones del approach.
- **Nunca inventar** — preguntar al usuario o marcar TBD con nota de gap.

### 4. Reconstrucción formalización — definition, strategies, decisions, plan

**`definition.md`**:
- Capacidades in-scope agregadas de todas las features.
- Glosario: términos de dominio del código → pedir definiciones formales al usuario.
- Usuarios primarios/secundarios, KPIs medibles → preguntar obligatoriamente (Regla 27).

**`strategies.md`**:
- Stack elegido inferido de `package.json` + IaC.
- Alternativas: mencionar sólo si el git history muestra experimentación real.
- Marcar la estrategia actual como "Elegida".

**`decisions.md`** (ADRs de hecho, no de derecho):
- ADRs globales retroactivos por decisiones técnicas transversales del stack.
- Cada ADR marcado `reverse_engineered: true` + nota: "Decisión de facto al arrancar. Formalizada retroactivamente."
- **Advertencia**: un ADR que dice "elegimos Node.js sobre Python" asume comparación que puede no haber existido.

**`plan.md`**:
- Features actuales marcadas como completadas.
- Roadmap futuro: vacío o TBD — reverse no puede inferir dirección futura del producto.

### 5. Encadenamiento de features (sub-pipeline)

La fase `reconstruct_features` invoca `/fremi-pipeline-reverse-feature` por cada FT-XX:

- Procesamiento **secuencial** (una feature a la vez — no paralelo).
- Hereda `--mode`, `--stealth`, `--from-git-history`, y opcionalmente `--skip-stories` y `--only-stories`.
- Con `--skip-features`: omite esta fase completamente.
- Con `--only-features FT-01,FT-02`: procesa sólo las features enumeradas.

En modo `interactive`: el pipeline pausa entre cada feature, muestra el summary y pregunta si continuar.

### 6. Stop events — dónde pausa el pipeline

El pipeline pausa (no aborta) ante 9 condiciones — ver `workflow.yaml → stop_events`:

1. **`initiative_rationale_required`** — PAUSA OBLIGATORIA: iniciativas inferidas necesitan validación del usuario original del producto.
2. **`discarded_ideas_not_inferrable`** — no hay evidencia de branches/commits revertidos; `ideas.md` queda vacío con warning.
3. **`success_criteria_not_measurable`** — criterios de éxito del producto no derivables del código.
4. **`strategic_bifurcation_inferred`** — stack elegido refleja decisión estratégica → ADR retroactivo (Regla 3b).
5. **`glossary_terms_need_definitions`** — términos de dominio en el código sin definición formal.
6. **`initiatives_contradictory`** — features apuntan a iniciativas que se pisan o contradicen.
7. **`feature_vs_product_boundary`** — al procesar una feature se detectan capacidades que el producto ya registró diferente (Regla 12 — sync-back descendente).
8. **`low_confidence_product`** — confidence de la capa producto (separado de features) cae bajo el umbral.
9. **`stealth_product_override`** — ADVERTENCIA ESPECIAL: `--stealth` en producto oculta el origen reverse de la estrategia. Requerir confirmación explícita.

---

## Diferencia con `/fremi-reverse-product` manual

| Aspecto | `/fremi-pipeline-reverse-product` (auto) | `/fremi-reverse-product` manual |
|---|---|---|
| Alcance | 7 docs de producto + todas las features (encadenadas) | Sólo los 7 docs de producto |
| Features | Encadenadas automáticamente vía sub-pipelines | Invocar `/fremi-pipeline-reverse-feature` por separado |
| Modo | `interactive` por default (7 pausas entre docs + pausas entre features) | Igual, más flexible |
| Advertencia de riesgo | Siempre muestra antes de arrancar | Igual |
| Cuándo conviene | Proyecto sin ningún doc de producto + features sin docs | Producto con features ya documentadas — sólo falta la capa producto |

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- **R25** — Trabajo real en producción (al menos una feature mergeada).
- Al menos 1 feature existe en `docs/works/features/` o código de features identificable.
- `config.reverse.core.yaml → active: true`.

Si el proyecto está arrancando ahora → **no usar reverse-product**. Usar el flow forward (`/fremi-product-iniciativas` → ...).

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: trabajo en producción.
- **R26** — Default `--transparent` — ESPECIALMENTE importante para producto (trazabilidad estratégica).
- **R27** — Gaps no-inferibles → preguntar obligatoriamente (especialmente iniciativas).
- **R28** — Reverse-product SIEMPRE requiere revisión humana profunda.
- **R30** — Regla 17 aplica retroactivamente con timestamps inferidos.
- **R31** — Si el proyecto está arrancando → flow forward, no reverse.
- **R32** — Ratio reverse/forward reportado.
- **R4** — Respetar orden discovery → formalización al reconstruir.
- **R12** — Sync-back descendente: restricciones globales propagadas a features.
- **R3b** — ADRs retroactivos globales por decisiones estratégicas.

---

## Estado final después del pipeline

```
docs/works/product/
├── iniciativas.md         (v0.1.0 living — reverse_engineered:* — riesgo alto)
├── ideas.md               (v0.1.0 living — típicamente incompleto)
├── planteamiento.md       (v0.1.0 living — con TBDs de negocio)
├── definition.md          (v0.1.0 living — capacidades + glosario)
├── strategies.md          (v0.1.0 living — stack elegido)
├── decisions.md           (v0.1.0 living — ADRs retroactivos de hecho)
└── plan.md                (v0.1.0 living — features actuales marcadas [x])

docs/works/features/
├── {feature_1_folder}/    (definition.md + decisions.md + stories — reverse_engineered:*)
├── {feature_2_folder}/    ...
└── {feature_N_folder}/    ...
```

**Próximos pasos naturales:**
1. Revisar el reporte agregado — confidence por capa (producto suele ser más bajo).
2. Completar iniciativas TBD con el usuario original del producto.
3. Completar criterios de éxito medibles (KPIs).
4. Revisar ADRs retroactivos — separar "decisión real" de "decisión de facto".
5. Completar glosario con definiciones formales de dominio.
6. Después del reverse: hacer un ejercicio real de discovery hacia adelante (reverse no reemplaza estrategia).
7. Correr `/fremi-sync-check` para verificar coherencia global del framework.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Skill subyacente: [`/fremi-reverse-product`](../../reverse-engineering/reverse-product/SKILL.md)
- Sub-pipeline: [`/fremi-pipeline-reverse-feature`](../reverse-feature/PIPELINE.md)
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../../reverse-engineering/rules/reverse.md) — Reglas 25–32

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del pipeline reverse-product.
