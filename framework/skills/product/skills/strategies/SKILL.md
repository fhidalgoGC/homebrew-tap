---
name: fremi-product-strategies
description: Puebla `docs/works/product/strategies.md` — 2-3 estrategias técnicas/arquitectónicas globales (stack, arquitectura, patterns) con pros/contras. Doc living. Cada estrategia elegida dispara ADRs. Es el paso entre `definition.md` y `plan.md`: define CÓMO se va a construir el producto a alto nivel.
---

# /fremi-product-strategies — Formalización: estrategias técnicas

Crea o actualiza `docs/works/product/strategies.md` — evalúa **2-3 estrategias** técnicas globales para construir el producto. Cada estrategia expone: stack, arquitectura, patterns, pros y contras.

**Rol del doc**: comparación de estrategias antes de elegir. La estrategia elegida se materializa en `product-adr` (ADRs globales) + guía las decisiones de feature/story.

## Sintaxis

```
/fremi-product-strategies
```

## Cuándo invocarlo

- `definition.md` completo (in-scope claro).
- Se necesita decidir stack, arquitectura o patterns transversales.
- Se descubre una estrategia nueva viable — sumarla como opción.
- Se cambia de estrategia (marcar la vieja como descartada).

## Cuándo NO invocarlo

- Sin definition → `/fremi-product-definition` primero.
- Para registrar UNA decisión concreta → `/fremi-product-adr`.
- Para roadmap → `/fremi-product-plan`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.design` (aplica también para strategies).

### Paso 1 — Precondiciones
- `definition.md` con capacidades in-scope declaradas.
- `planteamiento.md` con approach elegido (el approach guía las estrategias).

### Paso 2 — Cargar template
- `references/strategies-template.md`.

### Paso 3 — Poblar

Cada estrategia:
1. **Nombre** — descriptivo (ej: "Monolito Node.js + Lambda").
2. **Descripción** — 5-10 líneas de cómo se construye el producto con este approach.
3. **Stack técnico** — lenguajes, frameworks, runtime, infra.
4. **Arquitectura** — patterns transversales (event-driven, monolito, microservicios, etc.).
5. **Pros** — qué gana este approach.
6. **Contras** — qué se sacrifica.
7. **Riesgos** — qué puede fallar.
8. **Estado** — Evaluando / Elegida / Descartada.

**Regla 3b**: si sólo hay UNA estrategia viable, no hay bifurcación (no genera ADRs). Si hay 2+ → al elegir → **ADR obligatorio** vía `/fremi-product-adr`.

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `ancestor.version_at_creation` = versión de `definition.md`.
- Estrategia nueva evaluada → **MINOR**.
- Cambio de estrategia elegida (breaking) → **MAJOR**.
- Refinamiento de pros/contras → **PATCH**.
- Changelog al pie.

### Paso 5 — Reportar
- Estrategias evaluadas.
- Estrategia elegida (si aplica) + ADR generado.
- Sugerir `/fremi-product-plan` como próximo paso.

## Validaciones
- Al menos 2 estrategias comparadas (para hacer honesta la comparación).
- Cada estrategia con pros + contras + riesgos.
- Si hay estrategia Elegida → ADR referenciado en `decisions.md`.

## Anti-patrones
- ❌ Sólo 1 estrategia (no es comparación, es imposición).
- ❌ Contras vacíos ("no tiene contras") — todas tienen tradeoffs.
- ❌ Elegir sin ADR (viola Regla 3b).
- ❌ Estrategia = feature (esto es global al producto, no una feature).

## Referencias
- Template: [`references/strategies-template.md`](references/strategies-template.md).
- Skill `/fremi-product-adr` — para registrar la decisión que sale de acá.
- `docs/frmwk/rules/workflow.md` → Regla 3b (bifurcaciones + ADR).
