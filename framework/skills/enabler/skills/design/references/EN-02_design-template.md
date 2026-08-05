# Template — `EN-02_design.md` de un enabler

> **Para qué:** decisiones técnicas concretas para construir el enabler. Es el "cómo" estructural.
> **Usado por:** `/fremi-enabler`, Paso 4 (crear archivo).
> **Rol del archivo:** describe **tecnologías, librerías, arquitectura, fases de migración, rollback plan**. Sólo después de tener `EN-01_definition.md` cerrado.
> **Bifurcaciones técnicas → Regla 3b.** Si hay 2+ caminos viables (ej: Puppeteer vs Playwright para el layer), pausar, proponer opciones al usuario y crear ADR antes de continuar.

---

```markdown
# Diseño técnico del enabler

## Resumen

<2-3 líneas: estrategia general y por qué este approach gana frente a las alternativas.>

## Decisiones técnicas

> Cada decisión con su justificación. Si hubo bifurcación, referenciar el ADR correspondiente.

### D-01 — <título de la decisión>

- **Decisión:** <qué se eligió>
- **Justificación:** <por qué>
- **Alternativas descartadas:** <qué se evaluó y por qué se descartó>
- **ADR aplicable:** `ADR-XXX` (si hubo bifurcación con 2+ caminos viables — ver Regla 3b)

### D-02 — ...

## Arquitectura / estructura

<Diagrama ASCII, descripción de componentes y cómo se relacionan. Para enablers de infra: qué recursos AWS/IaC se crean, qué configs cambian, dónde viven los scripts.>

```
<diagrama ASCII o descripción estructurada>
```

## Estructura de archivos a crear/modificar

> Lista concreta. Sin esta sección el plan (EN-03) no tiene en qué apoyarse.

- `<path/a/archivo>` — <qué cambia / qué se agrega>
- `<path/a/otro>` — <idem>

## Fases / orden de despliegue

> Si el enabler requiere despliegue por fases (ej: migración con cutover), describirlas. Si es atómico, decirlo explícitamente.

1. **Fase 1 — <título>:** <qué se hace, qué queda funcionando>
2. **Fase 2 — <título>:** <qué se hace>
3. **Fase final — verificación:** <criterios de éxito por fase>

## Rollback plan

<¿Qué pasa si falla? ¿Cómo se revierte? ¿Hay ventana? Una línea por escenario.>

- Si falla en fase 1: <acción de rollback>
- Si falla en fase 2: <acción de rollback>

## Compatibilidad e impacto

- **Backward compatible:** sí / no — <con qué>
- **Breaking changes para consumidores:** <lista o "ninguno">
- **Tiempo de downtime esperado:** <0 / X minutos / ventana>

## Dependencias externas

- **Librerías nuevas:** <nombre@versión, justificación>
- **Servicios AWS / infra:** <qué se toca>
- **Equipos / aprobaciones:** <quiénes deben dar OK>

## Riesgos técnicos identificados

- <riesgo + plan de mitigación>
- <riesgo + plan de mitigación>
```

---

## Reglas de uso

1. **Las decisiones tienen ADR.** Cualquier elección entre 2+ caminos viables → invocar `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr` antes de cerrar este doc (Regla 3b).
2. **Sin librerías sin justificación.** Si elegís Puppeteer sobre Playwright, decí por qué.
3. **El rollback es obligatorio** para enablers de plataforma/infra. Si no se puede revertir, decirlo y explicar por qué es aceptable.
4. **Estructura de archivos concreta.** "Algunos cambios en config" no vale — listar paths.
5. **Sin comportamiento user-facing acá.** Esto no es BDD ni SDD — es decisiones de tecnología/estructura.
