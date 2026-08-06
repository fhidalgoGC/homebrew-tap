---
name: fremi-product-plan
description: Puebla `docs/works/product/plan.md` — roadmap de features priorizado. Doc living. Cada entry es un `FT-XX_<slug>` con estado (planeada / en curso / cerrada) + dependencias + iniciativas que aborda. Se actualiza automáticamente al crear feature nueva (`/fremi-feature` bumpea MINOR) y al cerrar features (marca cerrada).
---

# /fremi-product-plan — Formalización: roadmap de features

Crea o actualiza `docs/works/product/plan.md` — el **roadmap de features** del producto, priorizado. Cada entry es una feature (`FT-XX_<slug>`) con su estado, prioridad, dependencias y las iniciativas que aborda.

**Rol del doc**: qué features se construyen y en qué orden. Fuente de verdad del plan de trabajo.

**Actualización automática**: al crear feature nueva vía `/fremi-feature`, el skill agrega la entry acá y bumpea MINOR (Regla 17). Al cerrar feature, marca como completada.

## Sintaxis

```
/fremi-product-plan [--reorder | --status]
```

- Sin flag: crea el archivo si no existe, o refresca la vista.
- `--reorder`: modo interactivo para reordenar prioridades.
- `--status`: reporta estado sin modificar (features planeadas / en curso / cerradas).

## Cuándo invocarlo

- Discovery + formalización básica listas (definition + strategies con estrategia elegida).
- Se necesita priorizar features (reordenar).
- Se quiere ver el estado actual del roadmap.
- **No se invoca para agregar UNA feature** — eso lo hace `/fremi-feature` (que actualiza el plan automáticamente).

## Cuándo NO invocarlo

- Para crear una feature → `/fremi-feature <nombre>` (agrega al plan automáticamente).
- Para agregar una iniciativa → `/fremi-product-iniciativas`.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.tasks` (el plan del producto tiene rol de "orden", análogo a tasks de story).

### Paso 1 — Precondiciones (Regla 1)
- `definition.md` con capacidades in-scope.
- `strategies.md` con estrategia Elegida (o al menos un approach declarado).

### Paso 2 — Cargar template
- `references/plan-template.md`.

### Paso 3 — Poblar

Estructura obligatoria:
1. **Resumen del roadmap** — 3-5 líneas del orden general.
2. **Features activas** — tabla con `FT-XX_<slug>` | título | estado | prioridad | iniciativas que aborda | dependencias.
3. **Features cerradas** — histórico.
4. **Features canceladas** — con motivo.
5. **Dependencias entre features** — diagrama o listado.

**Cada feature del plan referencia**:
- Al menos 1 iniciativa (init-XXX) que aborda.
- Su `FT-XX_<slug>/definition.md` (link).
- Su estado actual (Planeada / En curso / Cerrada / Cancelada).

### Paso 4 — Versionado (Regla 17)

Doc **living**:
- Primera vez: `version: 0.1.0`, `ancestor.version_at_creation` = versión de `definition.md`.
- **Feature agregada** → **MINOR** (dispara `/fremi-feature` automáticamente).
- **Feature cerrada** → **MINOR**.
- **Reordenar prioridades** → **MINOR**.
- **Feature cancelada** → **PATCH** (registra motivo).
- **Cambio radical de roadmap** (dropear features masivamente) → **MAJOR**.
- Changelog al pie con cada cambio.

### Paso 5 — Reportar
- Cantidad de features (activas / cerradas / canceladas).
- Próxima feature en la cola (por prioridad).
- Sugerir `/fremi-feature <nombre>` para crear la siguiente.

## Validaciones
- Cada feature del plan tiene estado + prioridad + referencia a iniciativa.
- Dependencias no circulares.
- Si hay features con estado "En curso" → verificar que existan en `docs/works/features/`.

## Anti-patrones
- ❌ Features en el plan sin iniciativa asociada (no tienen razón estratégica).
- ❌ Reordenar prioridades sin actualizar el changelog.
- ❌ Dejar features canceladas sin motivo documentado.
- ❌ Roadmap con 20 features todas "Prioridad Alta" (no hay priorización real).

## Referencias
- Template: [`references/plan-template.md`](references/plan-template.md).
- Skill `/fremi-feature` — agrega feature al plan automáticamente.
- `~/.fremi/framework/framework/rules/workflow.md` → Regla 12 (sync-back).
