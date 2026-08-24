---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-product
  version_at_creation: null
---

# Flujo — Pipeline PRODUCT (`/fremi-pipeline-product`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Artifact subyacente:** [`~/.fremi/framework/artifacts/product/flow.md`](../../artifacts/product/flow.md) — describe los 7 steps del ciclo completo. El pipeline ejecuta la **cadena completa**.

Este documento describe la **narrativa del flujo** que el pipeline atraviesa cuando corre. Complementa `PIPELINE.md` (invocación, sintaxis) y `workflow.yaml` (secuencia machine-readable).

---

## Qué hace el pipeline

Corre en modo **automático** la secuencia completa de la capa producto — desde `iniciativas` hasta `plan` inclusive — sin pausar entre pasos, salvo:

- Precondiciones ausentes (aborta).
- Stop events reales (Regla 4, 3b — ver abajo).

**Termina con la capa producto completa y lista para arrancar la primera feature.** No crea features ni stories.

---

## Alcance del pipeline (cadena completa del artifact product)

| # | Step (id) | Sub-skill invocado | Doc producido | Fase | Obligatoriedad |
|---|---|---|---|---|---|
| −1 | `validate_input` (preflight) | — | — (sólo evalúa input) | — | Siempre |
| 0 | `iniciativas` | `/fremi-product-iniciativas` | `iniciativas.md` | discovery | Siempre |
| 1 | `ideas` | `/fremi-product-ideas` | `ideas.md` | discovery | Siempre |
| 2 | `planteamiento` | `/fremi-product-planteamiento` | `planteamiento.md` | discovery | Siempre |
| 3 | `definition` | `/fremi-product-definition` | `definition.md` | formalización | Siempre |
| 4 | `strategies` | `/fremi-product-strategies` | `strategies.md` | formalización | Siempre |
| 5 | `decisions` | `/fremi-product-adr` | `decisions.md` | formalización | Cuando hay ADRs |
| 6 | `plan` | `/fremi-product-plan` | `plan.md` | formalización | Siempre |

**No hay steps fuera del alcance** — el pipeline product abarca toda la capa. Las features y stories se arrancan con sus propios pipelines después.

---

## Arco narrativo

### 1. Preflight — evaluar el input antes de arrancar

Antes del primer step, el pipeline evalúa la descripción libre del producto que aporta el usuario. Si la descripción no permite derivar ni una hipótesis de negocio (problema, usuarios, resultado esperado no inferibles), pausa y pide 3 datos mínimos antes de continuar.

Si el input es suficiente → arranca `iniciativas` sin pausa.

### 2. Fase discovery — iniciativas → ideas → planteamiento

Los primeros 3 steps construyen el entendimiento del negocio antes de formalizar nada (Regla 4):

- **`iniciativas`**: el pipeline propone 1-3 `init-XXX` derivadas de la descripción inicial — hipótesis de negocio SAFe. No filtra ni prioriza en esta etapa.
- **`ideas`**: brainstorm de enfoques por cada iniciativa aceptada. Sin filtrar — la amplitud es el objetivo.
- **`planteamiento`**: elige el approach entre las ideas. Es el primer punto de posible stop event (bifurcación de approach, Regla 3b aplicada a discovery).

Cada step del discovery es **living** — el doc crece durante la vida del proyecto. La versión inicial es `0.1.0`.

### 3. Fase formalización — definition → strategies → decisions → plan

Los últimos 4 steps convierten el entendimiento en documentación formal del producto:

- **`definition`**: formaliza in-scope, capacidades, usuarios, glosario y criterios de éxito medibles. Es el doc que cascadea a TODAS las features — su calidad pesa sobre todo el proyecto. Posible stop event si no hay criterios de éxito medibles.
- **`strategies`**: elige la estrategia técnica global (stack, arquitectura, decisiones de plataforma). El punto de mayor bifurcación técnica (Regla 3b → ADR en `decisions.md`).
- **`decisions`**: transversal — registra los ADRs que hayan surgido de strategies (y de cualquier otro momento del pipeline). La skill `/fremi-product-adr` puede invocarse en cualquier momento; el pipeline la llama cuando hay bifurcaciones confirmadas.
- **`plan`**: roadmap inicial de features priorizado. Puede tener 0 features si el usuario prefiere agregarlas después.

### 4. Stop events — dónde pausa

El pipeline pausa (no aborta) ante 4 condiciones — ver `workflow.yaml → stop_events`:

1. **`iniciativas_sin_hipotesis`** — durante `iniciativas`, cuando la descripción inicial no permite formular ninguna hipótesis (pide 3 datos mínimos).
2. **`bifurcacion_planteamiento`** — durante `planteamiento`, cuando aparecen 2+ approaches viables (presenta opciones, espera decisión, registra como decisión de planteamiento — no ADR).
3. **`bifurcacion_strategies`** — durante `strategies`, cuando aparecen 2+ stacks/arquitecturas con trade-offs no-triviales (Regla 3b → ADR antes de continuar al plan).
4. **`criterios_exito_faltantes`** — durante `definition`, cuando faltan métricas de éxito medibles (pide 1-2 métricas al usuario).

**Anti-patrones — el pipeline NO debe pausar por esto:**
- Confirmar cada nombre de iniciativa o cada capacidad in-scope.
- Preguntar el orden de items en `ideas.md`.
- Pedir feedback tras cada doc completado.

### 5. Cierre — reporte y próximo paso

Al terminar exitosamente, la IA reporta:
- Archivos creados + versión inicial de cada uno.
- Iniciativas declaradas (IDs + títulos).
- Estrategia técnica elegida + ADR-XXX de referencia.
- Features en el plan (cuántas quedaron listadas).
- ADRs registrados durante el pipeline.
- Stop events registrados (pregunta hecha + respuesta del usuario).
- **Próximo paso**: `/fremi-pipeline-feature <slug-primera-feature>` si el plan tiene features; si no, `/fremi-product-plan` para agregarlas.

---

## Diferencia con `/fremi-product` manual

| Aspecto | `/fremi-pipeline-product` (auto) | `/fremi-product` + sub-skills manuales |
|---|---|---|
| Cadena completa | Automática (iniciativas → plan) | Manual — invocás cada sub-skill uno por uno |
| Pausa entre steps | NO (salvo stop events) | Sí — vos elegís cuándo invocar el siguiente |
| Modo por sub-skill | Siempre `auto` | Elegís por invocación (`--mode interactive`) |
| Cuándo conviene | Producto nuevo, contexto claro | Refresh parcial; cuando ya existe algún doc y sólo hace falta actualizar uno |

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado (`.claude/skills/fremi-story` symlink + `CLAUDE.md` referencia workflow.md).
- Methodology + config de producto existen y parsean.
- `config.product.yaml → active: true`.

Si falla cualquiera → abortar con mensaje claro. **No auto-instalar el framework.**

---

## Reglas activas durante la ejecución

- **R4** — Discovery (iniciativas → ideas → planteamiento) se completa antes de formalización (definition → strategies → plan).
- **R3b** — Toda bifurcación técnica o de approach produce ADR o decisión registrada antes de continuar.
- **R12** — No aplica sync-back externo (producto es la capa raíz); sí valida coherencia interna: capacidades en `definition.md` respaldadas por iniciativas aceptadas.
- **R17** — Todos los docs llevan frontmatter versionado (living, `v0.1.0` inicial) + entry en `## Changelog` con `origen: /fremi-pipeline-product`.

---

## Estado final después del pipeline

La capa producto queda completa:

```
docs/works/product/
├── iniciativas.md    (v0.1.0+, con init-XXX declaradas)
├── ideas.md          (v0.1.0+, con brainstorm por iniciativa)
├── planteamiento.md  (v0.1.0+, con approach elegido)
├── definition.md     (v0.1.0+, in-scope + capacidades + criterios éxito)
├── strategies.md     (v0.1.0+, con estrategia elegida)
├── decisions.md      (v0.1.0+, con ADRs que hayan surgido)
└── plan.md           (v0.1.0+, con roadmap inicial — puede tener 0 features aún)
```

**Próximo paso natural:** `/fremi-pipeline-feature <nombre>` para arrancar la primera feature del roadmap.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Reglas duras: [`workflow.md`](../../rules/workflow.md) — Reglas 3b, 4, 12, 17
- Flow del artifact subyacente: [`~/.fremi/framework/artifacts/product/flow.md`](../../artifacts/product/flow.md)
- Orquestador manual: [`/fremi-product`](../../artifacts/product/SKILL.md)
- Pipeline hijo: `/fremi-pipeline-feature`

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del pipeline product extraída de `PIPELINE.md` + `workflow.yaml`. [origen: refactor de categorización — sección por artifact/pipeline/reverse]
