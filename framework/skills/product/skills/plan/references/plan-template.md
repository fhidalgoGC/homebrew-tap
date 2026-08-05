# Template — `docs/works/product/plan.md` (living)

> **Rol:** roadmap de features priorizado. Fuente de verdad de qué se construye y en qué orden.
> **Living (Regla 17):** bumpea versión + changelog con cada feature agregada/cerrada.
> **Actualización automática:** `/fremi-feature` agrega entries acá y bumpea MINOR.

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

# Roadmap de features — <nombre del producto>

## Resumen del roadmap

<3-5 líneas del orden general. Qué se construye primero, por qué, cuál es la lógica de secuencia.>

## Features activas

Features planeadas o en curso.

| ID | Título | Estado | Prioridad | Iniciativas | Dependencias | Notas |
|---|---|---|---|---|---|---|
| `FT-01_<slug>` | <título> | Planeada | Alta | init-001 | — | <notas>  |
| `FT-02_<slug>` | <título> | En curso | Alta | init-001, init-002 | FT-01 | <notas> |
| `FT-03_<slug>` | <título> | Planeada | Media | init-002 | FT-01 | <notas> |
| `FT-04_<slug>` | <título> | Planeada | Baja | init-003 | FT-02, FT-03 | <notas> |

**Estados válidos**: Planeada | En curso | Bloqueada | Cerrada | Cancelada.

## Features cerradas

Features completadas (referencia histórica).

| ID | Título | Cerrada | Iniciativas | PR/release |
|---|---|---|---|---|
| `FT-XX_<slug>` | <título> | YYYY-MM-DD | init-XXX | <link> |

## Features canceladas

Features abandonadas con motivo (nunca se borran).

| ID | Título | Cancelada | Motivo |
|---|---|---|---|
| `FT-YY_<slug>` | <título> | YYYY-MM-DD | <ej: se pivotó el approach; se fusionó con FT-ZZ> |

## Dependencias entre features

Diagrama simple del grafo de dependencias (útil para features complejas):

```
FT-01 ──► FT-02 ──► FT-04
   │        │
   └────► FT-03 ─┘
```

## Prioridades — criterios

Cómo se decide qué es Alta/Media/Baja:
- **Alta**: bloquea otras features, cubre una iniciativa Aceptada crítica, va a la próxima release.
- **Media**: cubre iniciativa Aceptada pero no crítica, o mejora significativa.
- **Baja**: nice-to-have, mejoras marginales, dependencias débiles.

## Changelog

- **v0.1.0** — YYYY-MM-DD — Plan creado con N features iniciales. [origen: /fremi-product-plan]
```

## Reglas de uso

1. **Cada feature del plan referencia al menos 1 iniciativa.** Si no, no tiene razón estratégica.
2. **Sin dependencias circulares.** El grafo debe ser DAG.
3. **Prioridades honestas.** No todas pueden ser Alta — si lo son, revisar el filtro.
4. **Features canceladas no se borran.** Se marcan con motivo para no repetir errores.
5. **Actualización automática al crear feature.** `/fremi-feature` agrega la entry acá y bumpea MINOR.
6. **Al cerrar feature**: mover de "Activas" a "Cerradas" con fecha.
