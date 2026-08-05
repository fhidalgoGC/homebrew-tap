---
name: fremi-product-planteamiento
description: Puebla `docs/works/product/planteamiento.md` con el framing del problema + el approach ELEGIDO entre las ideas exploradas. Doc living. Cierra el discovery. Es el puente al `definition.md` formal.
---

# /fremi-product-planteamiento — Discovery: framing + approach elegido

Crea o actualiza `docs/works/product/planteamiento.md` con:
- **Framing del problema**: usuarios, contexto, restricciones.
- **Approach elegido** entre las ideas de `ideas.md`.
- **Justificación** contra las ideas descartadas.

**Rol del doc**: **cierra el discovery**. Habilita la formalización (`/fremi-product-definition`).

## Sintaxis

```
/fremi-product-planteamiento
```

## Cuándo invocarlo

- `iniciativas.md` + `ideas.md` con contenido y masa crítica (3-5 ideas exploradas).
- Se llegó al punto de **decidir**: cuál idea es el approach del producto.
- Se re-plantea el approach por descubrimiento.

## Cuándo NO invocarlo

- Sin ideas exploradas → `/fremi-product-ideas` primero.
- Para agregar decisiones técnicas específicas → `/fremi-product-adr` (después).

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.definition`.

### Paso 1 — Precondiciones (Regla 1)
- `iniciativas.md` con iniciativas Aceptadas.
- `ideas.md` con ideas exploradas.

### Paso 2 — Cargar template
- `references/planteamiento-template.md`.

### Paso 3 — Poblar

Estructura obligatoria:
1. **Framing**: problema concreto, usuarios afectados, contexto/restricciones, por qué ahora.
2. **Approach elegido**: cuál idea de `ideas.md` se toma (referenciarla) + justificación.
3. **Alternativas descartadas**: qué ideas se dejaron fuera y por qué.
4. **Restricciones del approach**: qué NO cubre el approach elegido.
5. **Riesgos y mitigaciones**: qué puede fallar.

### Paso 3b — Bifurcaciones (Regla 3b)

Si al elegir approach aparecen decisiones técnicas concretas (stack, protocolo, etc.) con 2+ opciones viables → **pausar**, presentar opciones, invocar `/fremi-product-adr` con la decisión (ADRs son documentar la decisión, no repetir el approach).

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `ancestor.version_at_creation` = versión de `ideas.md`.
- Refinamiento del framing → **PATCH**.
- Cambio de approach elegido → **MAJOR** (es breaking del producto).
- Agregar restricciones/riesgos → **MINOR**.
- Actualizar changelog.

### Paso 5 — Reportar
- Approach elegido con su referencia a idea.
- ADRs generados (si hubo).
- Sugerir `/fremi-product-definition` como próximo paso.

## Validaciones
- Approach elegido referencia UNA idea concreta de `ideas.md`.
- Al menos 1 alternativa descartada con justificación.
- Sin TBDs.

## Anti-patrones
- ❌ "Approach elegido" con múltiples ideas listadas sin decidir.
- ❌ Justificación tipo "porque es mejor" sin comparar contra alternativa.
- ❌ Restricciones vagas ("hay que ser rápido") — deben ser concretas.
- ❌ Decisión técnica sin ADR (viola Regla 3b).

## Referencias
- Template: [`references/planteamiento-template.md`](references/planteamiento-template.md).
- `docs/frmwk/rules/workflow.md` → Regla 4 (discovery), Regla 3b (bifurcaciones).
