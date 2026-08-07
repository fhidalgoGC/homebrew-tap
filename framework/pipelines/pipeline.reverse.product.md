---
name: fremi-pipeline-reverse-product
description: Pipeline de auto-ejecución de la VÍA REVERSE para la capa PRODUCTO — el más ambicioso. Reconstruye los 7 docs de producto (iniciativas, ideas, planteamiento, definition, strategies, decisions, plan) Y encadena reverse-feature para cada FT-XX existente en el proyecto. Riesgo declarado ALTO — recomendación fuerte de --mode interactive por racionalización post-hoc (Regla 27 + 28). Default mode transparent (Regla 26).
---

# /fremi-pipeline-reverse-product — Pipeline REVERSE capa PRODUCTO

**⚠️ Este es el pipeline más ambicioso y de mayor riesgo del framework.** Reconstruye la capa producto entera a partir de features/stories existentes + código + docs sueltos. Riesgo declarado **alto** en `config.reverse.yaml → skills[fremi-reverse-product].risk: high` por potencial de racionalización post-hoc (inventar iniciativas que "justifiquen" el producto ya construido).

**Fuente de verdad:** [`config.reverse.yaml`](../settings/config.reverse.core.yaml) + [`flow.reverse.md`](../flows/flow.reverse.md) + [`rules/reverse.md`](../rules/reverse.md).

## Sintaxis

```
/fremi-pipeline-reverse-product [--mode interactive|auto] [--stealth] [--from-git-history] [--skip-features] [--only-features FT-01,FT-02]
```

- `--mode` *(default y **fuertemente recomendado**: `interactive`)*: en interactive pausa entre cada uno de los 7 docs de producto Y entre cada feature. En auto corre todo — no recomendado para producto.
- `--stealth`: override explícito del default transparent. **Especialmente desaconsejado para producto** por Regla 26 — la trazabilidad del origen del producto es información valiosa.
- `--from-git-history`: usa git log del root para inferir evolución del producto.
- `--skip-features`: sólo reconstruye los 7 docs de producto; no encadena reverse-feature.
- `--only-features <lista>`: reconstruye sólo las features enumeradas.

## Precondiciones duras

- Regla 24 (framework instalado).
- Regla 25 (trabajo en producción).
- Existe estructura reconocible del proyecto (al menos README.md + package.json + una feature en `docs/works/features/` o código de features identificable).
- `config.reverse.yaml → active: true`.

Si NO existe ninguna feature (proyecto en fase 0) → abortar. Sin features no hay materia prima para reconstruir producto.

## Advertencia obligatoria antes de correr

Antes de arrancar la fase 1, el pipeline **muestra al usuario** este bloque:

```
⚠️ REVERSE-PRODUCT es de RIESGO ALTO

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

En `--mode auto` esta advertencia se muestra pero no bloquea. En `interactive` (default) pausa hasta respuesta.

## Cadena de ejecución

| # | Fase | Produce |
|---|---|---|
| 0 | Descubrimiento producto | Inventario de features + docs sueltos + README + package.json |
| 1 | Reverse `iniciativas.md` | Iniciativas inferidas — con preguntas por rationale |
| 2 | Reverse `ideas.md` | Ideas descartadas (si hay commits reverted / branches abandonados) |
| 3 | Reverse `planteamiento.md` | Framing del problema (con preguntas fuertes al usuario) |
| 4 | Reverse `definition.md` | Definición formal (capacidades in-scope, glosario derivado, criterios de éxito TBD) |
| 5 | Reverse `strategies.md` | Estrategias técnicas inferidas del stack (con opciones descartadas si git muestra) |
| 6 | Reverse `decisions.md` | ADRs globales derivados de decisiones técnicas transversales del código |
| 7 | Reverse `plan.md` | Roadmap living con features actuales marcadas como completadas |
| 8 | Por cada FT-XX | Sub-pipeline `/fremi-pipeline-reverse-feature` |
| 9 | Reporte agregado | Resumen global + gaps críticos + revisión humana obligatoria |

Todos los docs del producto llevan `reverse_engineered: true` en frontmatter (Regla 26).

## Stop events específicos

1. **`So that` de las iniciativas** — la IA propone iniciativas basadas en las features, pero el rationale de negocio no se puede inferir. **Pausa obligatoriamente y pregunta** al usuario original del producto. Si no está disponible → deja las iniciativas con `rationale: TBD — requiere usuario original del producto`.
2. **Ideas descartadas** — sólo se inferirán si hay branches abandonados o commits revertidos claros. Si no, la sección queda vacía con warning "no se detectaron ideas descartadas — puede haberlas o no; requiere entrevista".
3. **Criterios de éxito medibles** — el código no define métricas de éxito de negocio. Preguntar al usuario o dejar TBD.
4. **Bifurcaciones estratégicas** — el stack elegido (Node, TypeScript, AWS Lambda) refleja una decisión estratégica. Registrar ADRs retroactivos globales con `discovered_during_reverse: true`.
5. **Glosario** — el `definition.md` debe tener glosario. Extraerlo de nombres de dominio del código + preguntar al usuario por definiciones formales.
6. **Iniciativas contradictorias** — si features distintas apuntan a iniciativas que se pisan → pausar y clarificar.

## Reglas del framework que aplican

- Regla 25-32 (todas las de reverse).
- Regla 4 (discovery antes de formalización) — reverse la respeta produciendo `iniciativas → ideas → planteamiento → definition` en orden.
- Regla 12 (sync-back) — no aplica hacia arriba (producto ya es tope), pero **sí** hacia abajo: si al reverse-product aparecen restricciones globales, propagarlas a `feature/definition.md` de cada feature.
- Regla 17 + 30 — versionado con timestamps inferidos.
- Regla 27 — preguntas obligatorias por iniciativas, planteamiento, criterios de éxito.
- Regla 28 — reverse-product SIEMPRE requiere revisión humana profunda.

## Después del pipeline

```
docs/works/product/
├── iniciativas.md         (living v1.0.0 — reverse_engineered:*)
├── ideas.md               (living v1.0.0 — típicamente incompleto)
├── planteamiento.md       (living v1.0.0 — con TBDs de negocio)
├── definition.md          (living v1.0.0 — capacidades + glosario)
├── strategies.md          (living v1.0.0 — stack elegido)
├── decisions.md           (living v1.0.0 — ADRs globales retroactivos)
└── plan.md                (living v1.0.0 — features actuales como completadas)
```

+ Todas las features reconstruidas si no se pasó `--skip-features`.

## Reporte final (obligatorio)

1. **Producto reconstruido**: paths de los 7 docs.
2. **Features encadenadas**: lista con confidence individual.
3. **Iniciativas inferidas**: cantidad + cuáles requieren rationale del usuario original.
4. **ADRs globales retroactivos**: cantidad + títulos.
5. **Confidence global producto**: separado del confidence agregado de features (producto suele tener confidence más baja).
6. **Gaps críticos**: iniciativas sin rationale, planteamiento incompleto, criterios de éxito sin métricas.
7. **Revisión humana obligatoria** (Regla 28): áreas específicas — iniciativas, planteamiento, criterios de éxito, glosario.
8. **Recomendación**: "convocar al usuario original del producto (fundador / product owner original) para completar los TBDs identificados".

## Referencias

- [`config.reverse.yaml`](../settings/config.reverse.core.yaml)
- [`rules/reverse.md`](../rules/reverse.md) — Regla 25-32.
- [`flow.reverse.md`](../flows/flow.reverse.md)
- Sub-pipeline: [`/fremi-pipeline-reverse-feature`](pipeline.reverse.feature.md)
- Skill suelto: [`/fremi-reverse-product`](../reverse-engineering/reverse-product/SKILL.md)
