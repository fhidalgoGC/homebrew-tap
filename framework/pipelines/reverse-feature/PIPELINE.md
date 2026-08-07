---
name: fremi-pipeline-reverse-feature
description: Pipeline de auto-ejecución de la VÍA REVERSE para la capa FEATURE. Reconstruye el `FT-XX/definition.md` (+ `decisions.md` si aplica) Y encadena la reconstrucción de todas las stories de la feature vía sub-pipelines de reverse-story. Aplica Regla 25-32. Default mode transparent (Regla 26). Alternativa manual: `/fremi-reverse-feature FT-XX` para reconstruir sólo la feature sin stories.
---

# /fremi-pipeline-reverse-feature — Pipeline REVERSE capa FEATURE

Corre en modo **automático** la reconstrucción de una feature entera cuyo código ya existe: primero el `FT-XX/definition.md` (+ opcionalmente `decisions.md`), después una story reverse por cada carpeta bajo `user-stories/` (o inferida de la estructura del código).

**Fuente de verdad:** [`config.reverse.yaml`](../../settings/config.reverse.core.yaml) + [`flow.reverse.md`](../../flows/flow.reverse.md).

## Sintaxis

```
/fremi-pipeline-reverse-feature <FEATURE_ID> [--mode interactive|auto] [--stealth] [--from-git-history] [--skip-stories] [--only-stories HU-01,HU-02]
```

- `<FEATURE_ID>`: ej `FT-05` (con o sin slug — se resuelve).
- `--mode` *(default `interactive` — recomendación)*: en interactive pausa entre feature-doc y cada story; en auto corre todo.
- `--stealth`: override explícito del default transparent.
- `--from-git-history`: usa git log para fechas + inferencia.
- `--skip-stories`: sólo reconstruye la feature, no las stories. Útil si las stories se van a hacer una a una.
- `--only-stories <lista>`: reconstruye sólo las HU-XX enumeradas.

## Precondiciones duras

- Regla 24 (framework instalado).
- Regla 25 (trabajo en producción).
- Existe el folder `docs/works/features/FT-XX_<slug>/` (aunque `definition.md` esté vacío/faltante) O existe código identificable de la feature.
- `config.reverse.yaml → active: true`.
- Si `--skip-stories = false` (default): al menos 1 carpeta de story identificable bajo `user-stories/` o inferible del código.

## Cadena de ejecución

| # | Fase | Sub-skill | Produce |
|---|---|---|---|
| 0 | Descubrimiento feature | (inline) | Inventario de stories existentes + código compartido + tests comunes |
| 1 | Reverse del `FT-XX/definition.md` | `/fremi-reverse-feature` (interno) | `definition.md` (v1.0.0 snapshot) |
| 2 | Reverse de `FT-XX/decisions.md` (si aplica) | `/fremi-reverse-feature` (interno) | `decisions.md` living con ADRs descubiertos |
| 3 | Por cada HU descubierta | `/fremi-pipeline-reverse-story` (sub-pipeline) | Los 11 docs FW-* de cada story |
| 4 | Bump padre | (inline) | `product/plan.md` bumpeado (nueva feature registrada) |
| 5 | Reporte agregado | (inline) | Resumen por story + gaps globales |

## Stop events específicos

Además de los del [README](../README.md) y los de `/fremi-pipeline-reverse-story` (heredados en las stories):

1. **Feature vs producto** — si al inferir el `FT-XX/definition.md` aparecen capacidades transversales que pertenecen a `product/definition.md`, pausar y sugerir sync-back (Regla 12) — proponer correr `/fremi-pipeline-reverse-product` primero si producto tampoco existe.
2. **Story ambigua** — el código muestra 2 funcionalidades que podrían ser 1 o 2 stories. Pausar y preguntar al usuario cómo agruparlas.
3. **Iniciativa del producto no clara** — la feature debería vincular a una iniciativa (`init-XXX`). Si no existe la capa producto o no hay iniciativa clara → preguntar o dejar sin vincular con warning.
4. **Conflictos entre stories** — si dos stories descubiertas comparten código de forma incompatible, pausar y clarificar el reparto.

## Después del pipeline

```
docs/works/features/FT-XX_<slug>/
├── definition.md              (v1.0.0 snapshot — reverse_engineered:*)
├── decisions.md               (si hubo ADRs — living con reverse_engineered:*)
└── user-stories/
    ├── HU-01_<slug>/          (11 docs FW-* reconstruidos)
    ├── HU-02_<slug>/          (11 docs FW-* reconstruidos)
    └── HU-NN_<slug>/          ...
```

+ `product/plan.md` bumpeado si producto existe (Regla 17).

## Reglas del framework que aplican

- Regla 12 (sync-back a producto) — activa durante fase 1.
- Regla 17 + 30 (versionado + timestamps inferidos).
- Regla 25-28 (reverse general).
- Regla 27 — preguntas dirigidas por gaps.
- Regla 32 — reportar ratio reverse/forward al terminar.

## Reporte final (obligatorio)

1. **Feature reconstruida**: `FT-XX_<slug>` + path.
2. **Stories reconstruidas**: lista con confidence individual.
3. **ADRs descubiertos**: cantidad + scope (feature o producto).
4. **Gaps globales**: agregado de gaps por story.
5. **Sync-back sugerido a producto**: si aplica.
6. **Confidence global**: promedio ponderado de todas las stories + feature.
7. **Áreas de revisión humana**: prioridad alta (definition, ADRs) vs media (SC-XXX, RNFs).

## Referencias

- [`config.reverse.yaml`](../../settings/config.reverse.core.yaml)
- [`rules/reverse.md`](../../rules/reverse.md)
- [`flow.reverse.md`](../../flows/flow.reverse.md)
- Sub-pipeline: [`/fremi-pipeline-reverse-story`](pipeline.reverse.story.md)
- Pipeline padre: [`/fremi-pipeline-reverse-product`](pipeline.reverse.product.md)
