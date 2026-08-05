# Template — `iniciativas.md` (living)

> **Para qué:** estructura del archivo `docs/works/product/iniciativas.md` + bloque por cada iniciativa (`init-XXX`).
> **Usado por:** `/fremi-product-iniciativas`, Paso 3 (caso "iniciativas vacío" o "agregar nueva iniciativa").
> **Placeholders:** entre `<...>`. `{init_id}` viene del Paso 3 del skill (`init-001`, `init-002`, …).
> **Tipo (Regla 17):** este doc es **living** — bumpea versión y registra changelog al pie con cada modificación.
> **Recordatorio crítico:** una iniciativa es un **concepto/hipótesis de negocio completo** (SAFe / Lean Business Case), no una feature ni un objetivo ni una tarea. Si lo que escribís se implementa en 1-2 sprints, NO es una iniciativa — es una feature dentro de una.

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
  version_at_creation: null    # iniciativas.md es raíz del producto — no tiene ancestor real
---

# Iniciativas del producto

> Conceptos/hipótesis de negocio que el producto se propone validar. Cada iniciativa es un "todo macro" (SAFe / Lean Business Case) que justifica meses/quarters de trabajo y contiene múltiples features y stories.
>
> **No reciclar IDs.** Una iniciativa abandonada se marca `Estado: Kill` y queda en el archivo como rastro histórico.

<bloque por cada {init_id} — ver template de abajo>

## Changelog

- **v0.1.0** — YYYY-MM-DD — Doc creado con {init_id}. [origen: usuario]
```

---

## Bloque por iniciativa

```markdown
## {init_id} — <Título descriptivo del concepto completo>

### Hipótesis de negocio
**Creemos que** <problema/oportunidad observada>
**Si construimos** <capacidad principal>
**entonces** <resultado de negocio esperado>
**Sabremos que la hipótesis se valida cuando:**
- <indicador temprano 1>
- <indicador temprano 2>

### Alineamiento estratégico
- <a qué objetivo organizacional/estratégico aporta>
- <con qué métricas top-line conecta>

### Indicadores tempranos (leading)
- <qué señales de validación buscamos en el corto plazo (semanas)>

### Resultados de negocio esperados (lagging)
- <qué resultados de mediano/largo plazo (meses/quarters)>

### MVP (lo mínimo para validar la hipótesis)
- <qué hay que construir SÍ o SÍ para testear la iniciativa>
- <qué queda explícitamente fuera del MVP>

### Decisión de pivot/persevere/kill
- **Persevere si:** <umbral/condición concreta>
- **Pivot si:** <umbral/condición concreta>
- **Kill si:** <umbral/condición concreta>

### Capacidades / epics potenciales contenidas
- <lista de features de alto nivel que la iniciativa probablemente requiere — sin todavía decidir cuáles>

### Horizonte / inversión
- **Horizonte estimado:** <quarter(s) en los que se espera evolucionar la hipótesis>
- **Inversión estimada:** <esfuerzo aproximado — equipos/semanas>

### Estado
- **Estado:** Discovery | Building MVP | Validating | Persevere | Pivot | Kill
- **Última revisión:** YYYY-MM-DD
```

---

## Reglas de uso

1. **Una iniciativa por bloque.** Numeración global con padding `{number:03d}` (default).
2. **No mezclar iniciativas con ideas o features.** Las ideas viven en `ideas.md`; las features en `features/<FT-XX>/definition.md`.
3. **Heurística de escala:** un producto pequeño/focal típicamente valida **1 sola iniciativa**. Si tenés "3 iniciativas pequeñas", probablemente sean **1 iniciativa con 3 outcomes**.
4. **Toda iniciativa debe ser falsable.** Si no podés escribir un criterio de "Kill si…", la hipótesis es demasiado vaga.
