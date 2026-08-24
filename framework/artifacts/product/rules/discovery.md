# Regla de discovery antes de formalización (dominio PRODUCT)

> **Regla 4 — Domain-específica de la capa PRODUCT.**
>
> **Alcance:** este archivo aplica SÓLO al dominio product. Vive en
> `~/.fremi/framework/artifacts/product/rules/` y es cargado por el
> orquestador product cuando ejecuta los steps de discovery y formalización.
> No aplica a feature, story, enabler, extra.
>
> Se lee junto con el índice global `~/.fremi/framework/rules/workflow.md`
> y con las reglas cross-domain referenciadas en `rules/applies.yaml`.
>
> **Nota sobre identificadores:** esta regla usa nombres CONCEPTUALES de los
> docs (`iniciativas`, `ideas`, `planteamiento`, `definition`) — los filenames
> concretos son configurables desde
> `~/.fremi/framework/settings/methodology.core.yaml → layers.product.stages_order[].files[]`.
> No hardcodear nombres de archivo — ver `.claude/rules/no-hardcoded-identifiers.md`.

---

## Regla 4 — Discovery antes de formalización en capa PRODUCT

No se escribe el doc `definition` sin los docs `iniciativas` + `ideas` + `planteamiento` previos con contenido. El descubrimiento informa la definición — al revés es justificar un producto ya decidido.

### Justificación

La capa PRODUCT tiene dos zonas con propósito opuesto:

- **Discovery** (divergente): explora sin decidir — hipótesis de negocio, brainstorm de enfoques, elección de approach.
- **Formalización** (convergente): define con compromisos — producto formal, estrategia técnica, roadmap.

Invertir el orden produce documentación post-hoc que no refleja el razonamiento real: se escribe `definition.md` con lo que ya se había decidido tácitamente, y los docs de discovery se convierten en papeleo que nadie lee. Eso rompe la utilidad del framework como herramienta de razonamiento.

### DAG de precondiciones (en términos de steps del workflow)

```
iniciativas  →  ideas  →  planteamiento  →  definition  →  strategies
                                                         ↘
                                                           plan
```

El step `decisions` (ADRs) es transversal — puede aparecer en cualquier momento.

Regla dura: el step `definition` **no puede iniciarse** sin que existan los docs producidos por los steps `iniciativas`, `ideas` y `planteamiento` con contenido real (no placeholders vacíos).

### Procedimiento

Al ejecutar cualquier step del workflow product:

1. **Antes de cada step**, el orquestador verifica las `requires_complete` declaradas en `workflow.yaml → steps[<step>].requires_complete`.
2. Si algún precursor falta o está vacío → **avisar al usuario**, proponer crearlo primero, y no avanzar hasta que el usuario confirme.
3. **No crear placeholders vacíos** para "rellenar después" — un doc creado sin contenido real viola la precondición.

### Aplicación por step

| Step | Precondición aplicable desde esta regla |
|---|---|
| `iniciativas` | ninguna — es la raíz del discovery |
| `ideas` | `iniciativas` existe con al menos una iniciativa con contenido |
| `planteamiento` | `ideas` existe con ideas exploradas (mínimo un enfoque evaluado) |
| `definition` | `planteamiento` existe con approach elegido ← **precondición principal de R4** |
| `strategies` | `definition` existe con capacidades in-scope declaradas |
| `decisions` | ninguna — transversal |
| `plan` | `definition` + `strategies` existen y están completos |

### Anti-patrones a evitar

- ❌ Escribir `definition` antes de tener `planteamiento` completo — viola R4 directamente.
- ❌ Crear `planteamiento` con el approach "a definir" y seguir a `definition` — el approach debe estar ELEGIDO antes de formalizar.
- ❌ Saltarse `ideas` porque "ya se sabe qué construir" — las ideas documentan el espacio de posibilidades; sin ellas el planteamiento es un monólogo, no una elección informada.
- ❌ Tratar los docs de discovery como trámite burocrático y copiar contenido de `definition` para rellenarlos retroactivamente — R4 exige que el discovery PRECEDA e INFORME la formalización, no que quede como espejo.
- ❌ Usar reverse-engineering para "regularizar" discovery saltado en un producto nuevo en curso — reverse aplica a trabajo ya en producción/mergeado, no para justificar saltarse el flujo forward (ver `~/.fremi/framework/reverse-engineering/rules/reverse.md → Regla 31`).

### Cuándo NO aplica

- Trabajo dentro de `decisions` (ADRs) — es transversal y no tiene precondición de discovery.
- Actualizaciones PATCH a docs existentes (clarificaciones, typos) — no requieren re-verificar el DAG.
- Proyectos en modo reverse-engineering donde el código ya existe en producción — ver `~/.fremi/framework/reverse-engineering/rules/reverse.md` (Reglas 25-32).
