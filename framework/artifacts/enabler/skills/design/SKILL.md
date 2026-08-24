---
name: fremi-enabler-design
description: Puebla o actualiza el `{enabler.design}` de un enabler — decisiones técnicas concretas (tecnologías, librerías, capas, infraestructura) + ADRs aplicables. Doc snapshot. Se invoca después de `/fremi-enabler-definition`.
---

> **Nota sobre identificadores:** los prefijos concretos (carpeta enabler, IDs de feature/story, ADR) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos (`definition`, `design`, `plan`, `closure`) y conceptos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-enabler-design — Poblar el doc `design` del enabler

Puebla el `{enabler.design}` de un enabler con las **decisiones técnicas concretas** que satisfacen los criterios del step `definition`.

**Rol del doc**: cómo se construye el enabler. Tecnologías elegidas, componentes internos, ADRs por bifurcación (Regla 3b).

## Sintaxis

```
/fremi-enabler-design <ENABLER_ID>
```

## Cuándo invocarlo

- `{enabler.definition}` completo.
- Se descubre una decisión técnica nueva.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml`.
- `config.yaml` → `phase_rules.design`.

### Paso 1 — Validar padre
- `{enabler.definition}` con contenido real.

### Paso 2 — Cargar template
- `references/{enabler.design}-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.design`

- Tecnologías + librerías + versiones + justificación.
- **Bifurcaciones técnicas → Regla 3b**: pausar, opciones, ADR obligatorio.
- Estructura de archivos/carpetas a crear.
- Preferir firmas TypeScript reales sobre pseudocódigo abstracto.

**Scope del ADR** (según scope del enabler):
- Global: `/fremi-product-adr`
- Feature-scoped: `/fremi-feature-adr`
- Story-scoped: `/fremi-story-adr`

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` capturado.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar ADRs generados.
- Sugerir `/fremi-enabler-plan` como próximo paso.

## Validaciones
- Toda tecnología con justificación.
- ADRs registrados donde hubo bifurcación.
- Sin decisiones "porque sí".

## Anti-patrones
- ❌ Elegir librería sin comparar → Regla 3b + ADR.
- ❌ Design que contradice el step `definition` (los criterios técnicos).
- ❌ Wrappers sin justificación real.

## Referencias
- Template: [`references/{enabler.design}-template.md`](references/{enabler.design}-template.md).
- `config.yaml → phase_rules.design`, `config.enabler.yaml`.
- Regla 3b (ADR por bifurcación).
