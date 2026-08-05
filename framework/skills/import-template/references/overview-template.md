# Template — `overview.md` (para uso de `/fremi-import-template`)

Doc de investigación #1 de 7. Rellenar leyendo la raíz del template importado. Foco: **qué es** el template y para qué sirve, no la lógica de negocio.

```markdown
# Overview — <nombre del template importado>

## Qué es este template

<Descripción en 3-5 líneas: qué tipo de proyecto es (ej: monolito Django, monorepo NX, Lambda handlers, CLI Go), qué problema pretende resolver como scaffolding, y qué NO cubre. Extraer del README.md del origen si existe; si no, inferir del código.>

## Propósito declarado (del CLAUDE.md o README del template)

<Cita literal del propósito declarado si existe, o "El template no declara propósito explícito — se infiere del código.">

## Contadores de la importación

| Métrica | Valor |
|---|---|
| Archivos copiados a `/template/` | <N> |
| Directorios de agentes excluidos | <lista: `.claude/`, `.cursor/`, `.agent/`, etc.> |
| Archivos ignorados por `.gitignore` | <N (aprox)> |
| `.env` / `.env.example` copiados (política especial) | <sí/no> |
| Fecha de importación | YYYY-MM-DD |
| Commit/tag de origen (si aplica) | <ref> |

## Mapa de docs en `docs/template/`

- `overview.md` (este archivo) — qué es el template.
- `stack.md` — lenguajes, frameworks, versiones.
- `data.md` — persistencia, storage, colas.
- `structure.md` — árbol de carpetas + entrypoints.
- `patterns.md` — patrones estructurales y convenciones.
- `implementation-guide.md` — cómo crear/extender siguiendo el patrón (conocimiento aplicado).
- `notes.md` — decisiones, gotchas, TODOs, cosas a revisar.

## Cuándo consultar este template

<Casos típicos donde el usuario debería consultar este template importado: "cuando arranques una Lambda nueva", "cuando necesites replicar el patrón de auth", etc.>

## Cuándo NO consultar

<Casos donde el template NO aplica: "para lógica de negocio X", "para stacks distintos", etc.>
```
