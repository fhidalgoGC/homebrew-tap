# Template — `definition.md` de una feature (living)

> **Para qué:** estructura del archivo `definition.md` que vive en cada `FT-XX_<slug>/`.
> **Usado por:** `/fremi-feature`, Paso 4 (crear folder y `definition.md`).
> **Placeholders:** entre `<...>`. `{id}` y `{slug}` vienen del Paso 2 y 3 del skill (ej: `FT-01_core-report-generation`).
> **Tipo (Regla 17):** **living** — bumpea versión y registra changelog cuando la feature evoluciona (nueva capacidad in-scope, ADR nuevo, story cerrada que confirma o cambia supuestos).
> **Rol de la feature:** una línea de trabajo grande dentro del producto que contiene varias user stories y aporta a una o más iniciativas. **No es una story** (1-2 sprints): si lo que describís se hace en una sprint, probablemente sea una story, no una feature.

---

```markdown
---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: product
  version_at_creation: "<versión de product/plan.md al momento de crear la feature>"
---

# Feature: <título descriptivo> (`{id}_{slug}`)

## Qué hace
<Descripción de qué hace esta feature en 2-3 líneas. Tono observable: qué capacidad nueva entrega al producto/usuario, no cómo se implementa.>

## Por qué (conexión con producto)
- **Iniciativas conectadas:** init-XXX, init-YYY (deben existir en `docs/works/product/iniciativas.md`)
- **Cómo aporta a las métricas estratégicas:** <qué indicador (leading o lagging) de la iniciativa va a mover esta feature>
- **Dependencias de capacidades:** <capacidades del producto declaradas en `product/definition.md` (In-scope) que esta feature consume>

## Alcance de la feature (in-scope)
- <capacidad/comportamiento 1 que la feature SÍ incluye>
- <capacidad/comportamiento 2>
- <capacidad/comportamiento 3>

## Out-of-scope de la feature
- <lo que la feature explícitamente NO incluye — para evitar scope creep>
- <referenciar otras features si esas piezas viven en otro lado>

## User stories planeadas
- (lista — se completan a medida que se crean con `/fremi-story <FEATURE_ID> <nombre>`)
- **<HU-01_slug>** — <título corto>. Estado: en planificación.
- **<HU-02_slug>** — <título corto>. Estado: en planificación.

## Restricciones específicas de la feature
- <restricciones técnicas, de negocio o de UX que aplican a esta feature pero NO necesariamente a otras>
- <si una restricción aplica a más features → es de PRODUCTO, no de feature; pasarla a `product/definition.md` (Regla 12 sync-back)>

## Criterios de éxito de la feature
- <qué tiene que ser verdad para considerar la feature completa — independiente de las stories individuales>
- <métricas medibles cuando aplique>

## Decisiones técnicas vinculadas
- <ADR-XXX globales del producto que esta feature aplica>
- <ADR-XXX específicos de feature en `decisions.md` local — opcional>

## Glosario local (opcional)
- <término>: <definición específica al contexto de esta feature, si no está en el glosario de producto>

## Changelog

- **v0.1.0** — YYYY-MM-DD — Feature creada. [origen: usuario]
```

---

## Reglas de uso

1. **No saltarse iniciativas.** Si una feature no conecta con ninguna iniciativa de `iniciativas.md`, falta una iniciativa o la feature no tiene razón estratégica de existir.
2. **In-scope describible.** Cada bullet de in-scope debe ser concreto y demostrable. "Hacer el sistema robusto" no es in-scope; "Manejar reintentos de queries GraphQL fallidas" sí.
3. **Sync-back de restricciones (Regla 12).** Si al escribir restricciones detectás algo transversal → mover a `product/definition.md` y referenciar desde acá.
4. **Stories nacen vacías.** La lista de "User stories planeadas" empieza vacía y se llena con `/fremi-story`. No declarar stories que aún no se diseñaron.
5. **ADRs por bifurcación (Regla 3b).** Si al escribir la feature aparece una decisión técnica con 2+ caminos viables → pausar, ofrecer opciones, crear ADR via `/fremi-feature-adr` antes de continuar.
