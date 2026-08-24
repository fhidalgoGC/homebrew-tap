---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: pipeline-reverse-feature
  version_at_creation: null
---

# Flujo — Pipeline REVERSE-FEATURE (`/fremi-pipeline-reverse-feature`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de orquestación.
> **Invocación / documentación de skill:** [`PIPELINE.md`](./PIPELINE.md).
> **Skill subyacente:** [`~/.fremi/framework/reverse-engineering/reverse-feature/SKILL.md`](../../reverse-engineering/reverse-feature/SKILL.md) — lógica de inferencia del `definition.md` de feature.
> **Sub-pipeline:** [`/fremi-pipeline-reverse-story`](../reverse-story/PIPELINE.md) — encadenado por cada story descubierta.
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md).

Este documento describe la **narrativa del flujo** que el pipeline atraviesa cuando corre.

---

## Qué hace el pipeline

Reconstruye en modo **automático** toda una feature cuyo código ya existe:

1. Primero reconstruye el `FT-XX/definition.md` (+ opcionalmente `FT-XX/decisions.md`).
2. Luego encadena un sub-pipeline `/fremi-pipeline-reverse-story` por cada story descubierta bajo la feature.

**Termina con la feature completamente formalizada en el framework.** No ejecuta código nuevo.

---

## Alcance del pipeline

| # | Fase (id) | Qué hace | Produce |
|---|---|---|---|
| −1 | `verify_preconditions` (preflight) | Verifica R25 + R24 | — (aborta si falla) |
| −2 | `identify_feature_scope` (preflight) | Resuelve path, enumera stories identificables | — |
| 0 | `identify` | Escanea stories existentes + código compartido + ADRs de feature | Inventario en memoria |
| 1 | `reconstruct_feature` | Reverse del `FT-XX/definition.md` + `decisions.md` (si aplica) | 1–2 docs de feature |
| 2 | `reconstruct_stories` | Sub-pipeline reverse-story por cada HU descubierta (secuencial) | 11 docs FW-XX por story |
| 3 | `bump_parent` | Bumpea `product/plan.md` si feature no estaba listada | Versión bumpeada |
| 4 | `report_aggregate` | Reporte global: confidence + gaps + sync-back sugerido | Reporte final |

**Fuera del alcance** (no encadenado automáticamente):
- Reconstrucción de la capa producto — si tampoco existe, usar `/fremi-pipeline-reverse-product`.

---

## Arco narrativo

### 1. Preflight — verificar antes de tocar archivos

Antes de cualquier escaneo, el pipeline verifica:

- Framework instalado (Regla 24).
- Código de la feature mergeado a main o en branch de release confirmado — no experimental (Regla 25).
- El folder de feature existe (aunque `definition.md` esté vacío) o hay código de feature identificable.
- Al menos una story identificable (cuando `--skip-stories = false`).

Si falla cualquier check → pipeline aborta antes de tocar ningún archivo.

### 2. Descubrimiento — inventario de la feature

La fase `identify` escanea:

```
Stories:     docs/works/features/FT-XX/user-stories/* — HU-YY existentes
Código:      src/ — módulos compartidos de la feature (helpers, lib, utils)
Tests:       tests comunes a múltiples stories de la feature
ADRs:        FT-XX/decisions.md existente o ADRs en HU-YY (delta local)
Git:         git log del folder de la feature — evolución histórica
```

Resultado: lista de stories a procesar + capacidades transversales + ADRs de feature.

### 3. Reconstrucción de la feature

La fase `reconstruct_feature` invoca `/fremi-reverse-feature` para reconstruir:

**`FT-XX/definition.md`** — agrega desde las stories existentes:
- Título + descripción de la feature (de títulos de stories).
- Capacidades in-scope (agregado de FW-03 de cada story).
- Fuera de alcance (agregado de out-of-scope de stories).
- Criterios de éxito de la feature (refinados de CAs de stories → pedir al usuario).
- Lista de stories con estado (Planeada / En curso / Cerrada).
- Glosario local (términos del dominio que aparecen en 2+ stories).

**`FT-XX/decisions.md`** (condicional — si hay ADRs):
- Consolida ADRs locales de la feature.
- Entradas retroactivas por cada ADR aceptado.

**Gaps que requieren pregunta del usuario** (Regla 27):
- Iniciativa vinculada (`init-XXX`) — no inferible del código.
- Métricas de aporte a negocio de la feature — no derivables de CAs.
- Sync-back hacia producto — si aparecen capacidades transversales que pertenecen a `product/definition.md`.

### 4. Reconstrucción de stories (sub-pipeline)

La fase `reconstruct_stories` encadena `/fremi-pipeline-reverse-story` por cada story identificada:

- Procesamiento **secuencial** (una a la vez — no paralelo) para evitar conflictos en el bump de padres compartidos.
- Cada invocación hereda el `--mode`, `--stealth` y `--from-git-history` del pipeline padre.
- Con `--skip-stories`: omite esta fase completamente.
- Con `--only-stories HU-01,HU-02`: procesa sólo las HU enumeradas.

En modo `interactive`: el pipeline pausa entre cada story, muestra qué se generó y pregunta si continuar.

### 5. Stop events — dónde pausa el pipeline

El pipeline pausa (no aborta) ante 8 condiciones — ver `workflow.yaml → stop_events`:

1. **`feature_vs_product_scope`** — durante `reconstruct_feature`, cuando aparecen capacidades que pertenecen a la capa producto (Regla 12 → sync-back).
2. **`story_grouping_ambiguous`** — durante `identify`, cuando código que podría ser 1 o 2 stories genera ambigüedad.
3. **`initiative_not_clear`** — durante `reconstruct_feature`, cuando no existe la capa producto o no hay iniciativa vinculable.
4. **`story_code_conflict`** — durante `reconstruct_stories`, cuando dos stories comparten código de forma incompatible.
5. **`gap_non_inferrable_feature`** — durante `reconstruct_feature`, para gaps de negocio de la feature (iniciativa, métricas).
6. **`low_confidence_aggregate`** — después de stories, cuando el confidence promedio cae bajo el umbral.
7. **`reverse_ratio_exceeded`** — al final, si el ratio reverse/forward superó el umbral (Regla 32 — notificación).
8. **`stealth_without_adr`** — antes de `reconstruct_feature`, si `--stealth` sin ADR de justificación.

**Anti-patrones — el pipeline NO debe pausar por esto:**
- Confirmar wording de cada campo del `definition.md` individualmente.
- Pedir feedback tras cada story completada (en modo `auto`).
- Preguntar si un ADR local "debería" promoverse — reportarlo en el reporte final.

---

## Diferencia con `/fremi-reverse-feature` manual

| Aspecto | `/fremi-pipeline-reverse-feature` (auto) | `/fremi-reverse-feature` manual |
|---|---|---|
| Alcance | Feature + todas sus stories (vía sub-pipelines) | Sólo la feature (`definition.md` + `decisions.md`) |
| Stories | Encadenadas automáticamente | Hay que invocar `/fremi-pipeline-reverse-story` por separado |
| Cuándo conviene | Feature entera sin ningún doc | Feature que ya tiene `definition.md` pero stories sin docs |
| `--skip-stories` | Disponible — iguala el comportamiento al skill suelto | N/A |

---

## Precondiciones duras (abortan el pipeline)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- **R25** — Código de la feature mergeado / en producción.
- Folder de feature existe o código de feature identificable.
- Al menos 1 story identificable (si `--skip-stories = false`).
- `config.reverse.core.yaml → active: true`.

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: trabajo en producción.
- **R26** — Default `--transparent` — marca de origen reverse en frontmatter.
- **R27** — Gaps no-inferibles → preguntar, nunca inventar.
- **R28** — Reverse no reemplaza revisión humana.
- **R30** — Regla 17 aplica retroactivamente con timestamps inferidos.
- **R31** — Código en curso → abortar.
- **R32** — Ratio reverse/forward reportado.
- **R17** — Bumpear `product/plan.md` al registrar la feature.
- **R12** — Sync-back: capacidades transversales que pertenecen a producto → reportar.
- **R3b** — ADRs retroactivos por bifurcaciones técnicas descubiertas.

---

## Estado final después del pipeline

```
docs/works/features/{feature_folder}/
├── definition.md              (v1.0.0 snapshot — reverse_engineered:*)
├── decisions.md               (si hay ADRs — living con reverse_engineered:*)
└── user-stories/
    ├── {story_1_folder}/      (11 docs FW-XX reconstruidos — reverse_engineered:*)
    ├── {story_2_folder}/      (11 docs FW-XX reconstruidos)
    └── {story_N_folder}/      ...
```

+ `product/plan.md` bumpeado si la feature no estaba listada.

**Próximos pasos naturales:**
1. Revisar el reporte agregado — confidence por story + gaps críticos.
2. Completar iniciativa vinculada si quedó sin vincular.
3. Revisar el `definition.md` — métricas de éxito de negocio (pedir al stakeholder original).
4. Ejecutar sync-back sugerido si aparecieron capacidades que pertenecen a `product/definition.md`.
5. Correr `/fremi-sync-check` para verificar coherencia global del framework.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`PIPELINE.md`](./PIPELINE.md)
- Skill subyacente: [`/fremi-reverse-feature`](../../reverse-engineering/reverse-feature/SKILL.md)
- Sub-pipeline: [`/fremi-pipeline-reverse-story`](../reverse-story/PIPELINE.md)
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../../reverse-engineering/flow.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../../reverse-engineering/rules/reverse.md) — Reglas 25–32
- Pipeline padre: [`/fremi-pipeline-reverse-product`](../reverse-product/PIPELINE.md)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del pipeline reverse-feature.
