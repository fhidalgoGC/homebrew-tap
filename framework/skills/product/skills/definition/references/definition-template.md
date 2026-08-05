# Template — `docs/works/product/definition.md` (living)

> **Rol:** definición FORMAL del producto — in-scope, capacidades, usuarios, criterios éxito, restricciones globales, glosario.
> **Living (Regla 17):** bumpea versión + changelog con cada cambio.

```markdown
---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: product
  version_at_creation: "<versión actual de planteamiento.md>"
---

# Definition del producto — <nombre del producto>

## Descripción

<3-5 líneas de qué hace el producto, para quién, cómo se diferencia. Tono ejecutivo, no técnico.>

## Usuarios

- **Primarios**: <quiénes lo usan directo — roles, personas, casos>
- **Secundarios**: <a quiénes beneficia sin usarlo directo>

## Capacidades in-scope

Lo que el producto DEBE hacer. Cada bullet es concreto y demostrable.

- <capacidad 1 — verbo + qué + cómo se mide>
- <capacidad 2>
- <capacidad 3>

## Explícitamente out-of-scope

Cosas que un lector razonable esperaría que SÍ estén, y NO están (para acotar expectativas).

- <no incluye X — por razón Y>
- <no incluye Z — decisión estratégica: reservado para vN+1>

## Criterios de éxito medibles

Cómo se sabe que el producto funciona.

| KPI | Meta | Cómo se mide |
|---|---|---|
| <ej: tasa de adopción> | 60% en 3 meses | Analytics |
| <ej: latencia p95> | < 500ms | Datadog |

## Restricciones globales

Aplican a TODAS las features del producto.

- **Regulatorias**: <ej: GDPR, HIPAA>
- **Técnicas**: <ej: debe correr en AWS us-west-2>
- **De negocio**: <ej: no procesar más de N req/s>
- **Compatibilidad**: <ej: soporta browsers Chrome/Firefox últimas 2 versiones>

## Glosario

Términos del dominio que se usan en features y stories. Si un término aparece en 2+ features, va acá.

- **<Término A>**: <definición precisa, 1-2 líneas>
- **<Término B>**: <definición>

## Referencias

- Iniciativas: `init-XXX`, `init-YYY` (en `iniciativas.md`).
- Planteamiento: approach elegido en `planteamiento.md`.
- ADRs globales aplicables: <ADR-XXX> en `decisions.md`.

## Changelog

- **v0.1.0** — YYYY-MM-DD — Definition creado. [origen: /fremi-product-definition]
```

## Reglas de uso

1. **Concreción**: cada capacidad in-scope es un bullet demostrable. "Hacer el sistema robusto" NO va.
2. **Out-of-scope no vacío**: siempre hay algo razonable que un lector esperaría y no está.
3. **KPIs medibles**: cada criterio de éxito con métrica + unidad + target.
4. **Glosario compartido**: si un término aparece en 2+ features, subirlo acá (Regla 12 sync-back).
5. **Restricciones transversales**: si una feature descubre una restricción que aplica a otras → moverla acá.
