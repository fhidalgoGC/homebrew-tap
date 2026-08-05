---
name: fremi-product-definition
description: Puebla `docs/works/product/definition.md` — la definición FORMAL del producto (in-scope, capacidades, usuarios, glosario, criterios de éxito medibles, restricciones globales). Doc living. Primer paso de formalización, después del planteamiento cerrado.
---

# /fremi-product-definition — Formalización: qué producto construimos

Crea o actualiza `docs/works/product/definition.md` — la definición **formal** del producto: alcance global, capacidades, usuarios primarios/secundarios, criterios de éxito medibles, restricciones globales, glosario.

**Rol del doc**: el "contrato del producto". Fuente de verdad de qué está y qué no está in-scope. Las features y stories no pueden introducir algo fuera de acá sin sync-back.

## Sintaxis

```
/fremi-product-definition
```

## Cuándo invocarlo

- Discovery completo (iniciativas + ideas + planteamiento con contenido real).
- Se descubre una capacidad transversal en una feature/story y hay que sumarla al in-scope de producto (Regla 12 sync-back).
- El scope del producto cambia por decisión estratégica.

## Cuándo NO invocarlo

- Sin planteamiento → arrancar por `/fremi-product-planteamiento`.
- Para roadmap de features → `/fremi-product-plan`.
- Para estrategias técnicas → `/fremi-product-strategies`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.definition`.

### Paso 1 — Precondiciones (Regla 1)
- `planteamiento.md` cerrado (con approach elegido).
- `iniciativas.md` con al menos 1 iniciativa aceptada.

### Paso 2 — Cargar template
- `references/definition-template.md`.

### Paso 3 — Poblar

Estructura obligatoria:
1. **Descripción del producto** — 3-5 líneas de qué hace, para quién.
2. **Usuarios** — primarios (quiénes lo usan directo) + secundarios (a quiénes beneficia).
3. **Capacidades in-scope** — bullets concretos de qué DEBE hacer el producto.
4. **Explícitamente out-of-scope** — qué el producto NO hace (para acotar).
5. **Criterios de éxito medibles** — cómo se sabe que el producto funciona (KPIs, métricas de negocio).
6. **Restricciones globales** — regulatorias, técnicas, de negocio (aplican a TODAS las features).
7. **Glosario** — términos del dominio que se usan en features/stories.
8. **Referencias** — iniciativas conectadas (init-XXX), planteamiento (approach elegido).

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `ancestor.version_at_creation` = versión de `planteamiento.md`.
- Capacidad nueva in-scope → **MINOR**.
- Capacidad removida o modificada (breaking) → **MAJOR**.
- Aclaración / glosario nuevo → **PATCH**.
- Restricción global nueva → **MINOR**.
- Changelog al pie.

### Paso 5 — Reportar
- Cantidad de capacidades in-scope declaradas.
- Restricciones globales.
- Sugerir `/fremi-product-strategies` como próximo paso.

## Validaciones
- Cada capacidad tiene 1 bullet concreto (no "hacer sistema robusto").
- Criterios de éxito con métrica + unidad + target.
- Glosario define términos que aparecen en features/stories.
- Sin TBDs.

## Anti-patrones
- ❌ In-scope trivial ("hacer un producto que funcione").
- ❌ Out-of-scope vacío — siempre hay algo razonable que NO se hace.
- ❌ Criterios de éxito subjetivos ("que le guste al usuario").
- ❌ Repetir contenido del planteamiento en vez de referenciarlo.

## Referencias
- Template: [`references/definition-template.md`](references/definition-template.md).
- `docs/frmwk/rules/workflow.md` → Regla 4, Regla 12 (sync-back).
