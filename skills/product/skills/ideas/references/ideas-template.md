# Template — `ideas.md` (living)

> **Para qué:** estructura del archivo `docs/works/product/ideas.md` + bloque por cada idea explorada.
> **Usado por:** `/fremi-product-ideas`, Paso 3 (caso "iniciativas listo, ideas vacío" o "agregar idea nueva").
> **Placeholders:** entre `<...>`.
> **Tipo (Regla 17):** **living** — bumpea versión con cada idea agregada / marcada como descartada.
> **Carácter del archivo:** brainstorm **sin filtro**. Es para abrir el espacio de soluciones, no para elegir. La elección se hace en `planteamiento.md`.

---

## Estructura del archivo (cuando se crea por primera vez)

```markdown
---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: product
  version_at_creation: "<versión de iniciativas.md al momento>"
---

# Ideas exploradas

> Brainstorm sin filtro de enfoques posibles para abordar las iniciativas declaradas en `iniciativas.md`.
>
> Acá no se decide nada. Cada idea es una **opción** para el espacio de soluciones. La elección y descarte se documentan en `planteamiento.md` (approach elegido).

<bloque por cada idea — ver template de abajo>

## Changelog

- **v0.1.0** — YYYY-MM-DD — Doc creado con primer brainstorm de ideas. [origen: usuario]
```

---

## Bloque por idea

```markdown
## Idea: <título corto y evocativo>

- **Descripción:** <2-4 líneas. Qué es la idea, cómo abordaría la iniciativa, qué la hace distinta de otras ideas.>

- **Conecta con:** <init-XXX, init-YYY> (qué iniciativa(s) intentaría validar)

- **Pros (preliminar):**
  - <pro 1>
  - <pro 2>

- **Contras (preliminar):**
  - <contra 1>
  - <contra 2>

- **Estado:** explorando | descartada | adoptada (referencia a `planteamiento.md`)

- **Notas:** <observaciones libres, referencias, links, conversaciones que motivaron la idea>
```

---

## Reglas de uso

1. **Sin filtro al principio.** Ideas malas también van — el descarte se documenta después con motivos.
2. **Una idea = un enfoque.** Si tu idea son varias estrategias mezcladas, partila en 2-3 ideas separadas.
3. **No es una feature.** Una idea es una hipótesis de enfoque; una feature es una línea de trabajo concreta. Si la idea ya tiene scope cerrado, mover a `definition.md` de feature.
4. **Conexión obligatoria.** Toda idea debe conectar con al menos una iniciativa. Si no conecta con ninguna → la iniciativa correspondiente está faltando en `iniciativas.md` (sync-back).
