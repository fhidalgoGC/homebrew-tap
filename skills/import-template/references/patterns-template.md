# Template — `patterns.md` (para uso de `/fremi-import-template`)

Doc de investigación #5 de 7 — **el más denso**. Patrones estructurales, convenciones de naming, tooling, forma de trabajar que el template encarna. Foco: patrón, no dominio de negocio.

```markdown
# Patterns — <nombre del template>

## 1. Stack tecnológico

<Resumen ejecutivo del stack — referenciar `stack.md` para detalle.>

## 2. Estructura de carpetas

<Convención top-level del proyecto — referenciar `structure.md`.>

## 3. Convenciones de naming

### Archivos
- `<tipo>` → `<pattern>` (ej: Zod schemas → `<name>.schema.ts`; middlewares → `<name>.middleware.ts`).
- ...

### Carpetas
- `<tipo>` → `<pattern>` (ej: cada Lambda vive en `src/functions/<name>/`).

### IDs / prefijos internos
- <ej: ADRs → `ADR-XXX`; migrations → `MIG-YYYY-MM-DD-<slug>`; tests → describir vs it>

## 4. Patrones de implementación

Para cada patrón: **qué es**, **dónde aplicarlo**, **ejemplo concreto en el template**.

### Patrón <A>
- **Qué**: <descripción>
- **Aplicar cuando**: <casos>
- **Ejemplo en template**: `<path/a/ejemplo>`

### Patrón <B>
- **Qué**: <descripción>
- **Aplicar cuando**: <casos>
- **Ejemplo en template**: `<path>`

(Repetir por cada patrón identificado — repository, adapter, factory, strategy, gateway, etc.)

## 5. Comandos de lifecycle del proyecto

| Fase | Comando | Descripción |
|---|---|---|
| Install | <`npm ci` | `poetry install` | ...> | |
| Lint | <comando> | |
| Type check | <comando> | |
| Test unit | <comando> | |
| Test integration | <comando> | |
| Test e2e | <comando> | |
| Build | <comando> | |
| Deploy | <comando> | |
| Database lifecycle | <migrate, seed, reset> | |
| Generators (scaffolding) | <si aplica> | |

## 6. Tooling de scaffolding (skills del template)

<Si el template tiene sus propios skills/generators, listarlos con qué generan y cómo se invocan.>

- <skill> → <qué genera>

## 7. Tooling de hooks

<Hooks del template (git hooks, agent hooks, pre-commit) con qué disparan y qué validan.>

## 8. Tooling de scripts

<Scripts de mantenimiento en `scripts/` u equivalente. Cada uno con: qué hace, cuándo correrlo.>

- `scripts/<name>` → <qué hace>

## 9. Forma de implementar una nueva unidad (síntesis del patrón)

<Pasos concretos para crear la unidad reusable típica del template (una Lambda nueva, un endpoint, un módulo). Numerados. Referenciar los patterns anteriores.>

1. <paso>
2. <paso>
...

## 10. Convención multi-agente (si aplica)

<Cómo el template se expone a agentes IA (Claude, Cursor, etc.). Symlinks, carpetas dedicadas, CLAUDE.md, etc.>

## 11. Configuración de bundle / build custom

<Si hay algo no-default en el bundler (esbuild config custom, webpack, vite plugins, etc.), documentarlo.>

## 12. Lo que el template NO incluye (observación interna)

<Cosas que el template DELIBERADAMENTE no cubre y son responsabilidad del proyecto destino. Ej: "El template no incluye autenticación — se asume delegada a API Gateway JWT authorizer".>
```
