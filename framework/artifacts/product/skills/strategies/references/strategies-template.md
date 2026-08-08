# Template — `docs/works/product/strategies.md` (living)

> **Rol:** evaluación de 2-3 estrategias técnicas globales para construir el producto.
> **Living (Regla 17):** bumpea versión + changelog con cada cambio de estrategia.
> **Cada estrategia elegida → ADR obligatorio** vía `/fremi-product-adr` (Regla 3b).

```markdown
---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: product
  version_at_creation: "<versión actual de definition.md>"
---

# Estrategias técnicas del producto

Evaluación de las alternativas de stack, arquitectura y patterns transversales. Cada estrategia se compara contra las otras; la elegida se materializa en ADR global.

## Estrategia A — <nombre corto>

**Estado**: Evaluando | Elegida | Descartada

### Descripción
<5-10 líneas de cómo se construye el producto con este approach.>

### Stack técnico
- **Lenguaje/runtime**: <ej: TypeScript + Node.js 20>
- **Framework(s)**: <ej: Express, NestJS, Serverless Framework>
- **Datos**: <BD, cache, storage>
- **Infra**: <cloud, IaC, deploy>

### Arquitectura
- **Pattern principal**: <ej: monolito modular, microservicios, event-driven, hexagonal, ...>
- **Patrones aplicados**: <repository, adapter, CQRS, saga, ...>
- **Fronteras**: <cómo se separan los módulos>

### Pros
- <ganancia 1>
- <ganancia 2>

### Contras
- <sacrificio 1>
- <sacrificio 2>

### Riesgos
- <riesgo 1 + mitigación>
- <riesgo 2 + mitigación>

---

## Estrategia B — <nombre corto>

**Estado**: Evaluando | Elegida | Descartada

### Descripción
…

### Stack técnico
…

### Arquitectura
…

### Pros
…

### Contras
…

### Riesgos
…

---

## Estrategia C — <opcional, si hay 3ª viable>

…

---

## Comparación resumen

| Dimensión | Estrategia A | Estrategia B | Estrategia C |
|---|---|---|---|
| Complejidad inicial | Baja | Media | Alta |
| Complejidad a escala | Alta | Media | Baja |
| Time-to-market | Rápido | Medio | Lento |
| Costo operativo | Bajo | Medio | Alto |
| Curva de aprendizaje | Baja | Media | Alta |
| ... | ... | ... | ... |

## Estrategia elegida

**<Estrategia X>** — <título>.

**Justificación**: <por qué se elige esta y no las otras. Cita las dimensiones críticas del contexto del producto.>

**ADR generado**: <ADR-XXX> en `decisions.md` (registra la decisión formalmente).

## Consecuencias de la elección

Qué implica que la estrategia elegida sea X:
- <feature/story A> va a construirse de tal manera.
- <feature/story B> va a estar limitada por Y.
- <riesgo Z> se acepta como tradeoff.

## Changelog

- **v0.1.0** — YYYY-MM-DD — Strategies creado con N estrategias evaluadas. Estrategia elegida: <X>. [origen: /fremi-product-strategies]
```

## Reglas de uso

1. **Al menos 2 estrategias.** 1 sola no es comparación.
2. **Pros + Contras balanceados.** Todas las estrategias tienen tradeoffs — sin contras es sospechoso.
3. **Estrategia elegida → ADR obligatorio.** Regla 3b: la decisión se registra en `decisions.md` vía `/fremi-product-adr`.
4. **No confundir con decisiones específicas.** "Usar PostgreSQL" es un ADR, no una estrategia. Una estrategia es "monolito modular + PostgreSQL + eventos internos" completo.
5. **Estrategia descartada NO se borra.** Se marca `Estado: Descartada` para dejar rastro.
