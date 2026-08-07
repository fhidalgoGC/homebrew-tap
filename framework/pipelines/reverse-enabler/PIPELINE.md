---
name: fremi-pipeline-reverse-enabler
description: Pipeline de auto-ejecución de la VÍA REVERSE para un ENABLER — trabajo técnico habilitador ya montado (IaC, packages instalados, scripts de tooling, layers de Lambda). Reconstruye los 4 docs EN-01..EN-04 a partir de artifacts existentes. Aplica Regla 25-32 + Regla 15 (enabler = habilita capacidad futura). Default mode transparent (Regla 26). Alternativa manual: `/fremi-reverse-enabler`.
---

# /fremi-pipeline-reverse-enabler — Pipeline REVERSE capa ENABLER

Corre en modo **automático** la reconstrucción de los 4 docs de un enabler cuya infraestructura/tooling ya está en producción: `EN-01_definition.md`, `EN-02_design.md`, `EN-03_plan.md`, `EN-04_closure.md`.

**Fuente de verdad:** [`config.reverse.yaml`](../../settings/config.reverse.core.yaml) + [`flow.reverse.md`](../../flows/flow.reverse.md).

## Cuándo usarlo

- IaC montado (serverless.yml, CDK, terraform) sin haber creado el enabler formal.
- Package/library instalado como fundación (ej: Chromium layer para Lambda) sin `EN-XX`.
- CI/CD pipeline armado sin doc.
- Migración de infra completada sin registrar (ej: Node 20 → Node 24).

## Sintaxis

```
/fremi-pipeline-reverse-enabler <nombre-o-slug> [--scope global|feature FT-XX|story FT-XX/HU-YY] [--mode interactive|auto] [--stealth] [--from-git-history]
```

- `<nombre-o-slug>`: título en lenguaje natural o slug (ej: `nodejs24-migration`, `chromium-lambda-layer`).
- `--scope` *(default `global`)*: dónde vive el enabler — global en `docs/works/enablers/`, o dentro de una feature/story (Regla 15).
- `--mode` *(default `interactive`)*: pausa entre los 4 docs; en auto los escribe de un tirón.
- `--stealth`: override explícito del default transparent.
- `--from-git-history`: usa git log para fechas y evolución del enabler.

## Precondiciones duras

- Regla 24 (framework instalado).
- Regla 25 (infra/tooling en producción — no experimental).
- Artifacts identificables: al menos UNO de → IaC file cambiado, package instalado, layer creado, script de tooling agregado, workflow CI/CD agregado.
- `config.reverse.yaml → active: true`.
- Si `--scope feature/story`: la feature/story padre existe (o se reverse-engineerea primero).

## Cadena de ejecución

| # | Fase | Produce |
|---|---|---|
| 0 | Descubrimiento enabler | Inventario de: package.json deps, IaC diff, scripts, config files, layers, workflows |
| 1 | Reverse `EN-01_definition.md` | Qué habilita + vinculado a qué features/stories + criterios técnicos |
| 2 | Reverse `EN-02_design.md` | Decisiones técnicas concretas + ADRs aplicables (retroactivos si aplica) |
| 3 | Reverse `EN-03_plan.md` | Tareas atómicas inferidas de commits — todas [x] (el enabler ya está montado) |
| 4 | Reverse `EN-04_closure.md` | Sign-off + qué quedó habilitado + evidencia (paths de archivos + commits) |
| 5 | Bump padre | Según scope: global → registra en índice; feature → bumpea `feature/definition.md`; story → bumpea `feature/spec.md` |
| 6 | Reporte final | Confidence, gaps, revisión humana |

## Stop events específicos

1. **Scope ambiguo** — si el enabler afecta varias features → preguntar si global o feature-específico. Recomendación: cuando duda, global.
2. **Numeración EN-XX** — asignar el próximo `EN-XX` global. Si hay conflicto (ej: se descubren múltiples enablers a la vez) → serializar la numeración (Regla 17 — numeración global se serializa).
3. **Features/stories vinculadas** — el enabler debe declarar qué habilita. Si no está claro cuáles → preguntar al usuario.
4. **ADRs retroactivos técnicos** — Node 24 vs 20 fue una decisión con opciones (Regla 3b retroactiva). Registrar ADR — preguntar rationale al usuario o marcar `discovered_during_reverse: true`.
5. **Regla 8 y bugs** — si el enabler nació como fix de un bug de infra, marcar Regla 29 (test rojo no reconstruible) + sugerir `/fremi-reverse-bug`.

## Reglas del framework que aplican

- Regla 15 (enabler es opcional pero canónico — Regla 25 lo confirma como vía formal).
- Regla 25-32 (reverse general).
- Regla 17 (versionado + linaje).
- Regla 3b (retroactivo — ADRs por decisiones técnicas descubiertas).

## Después del pipeline

Según scope:

**Global:**
```
docs/works/enablers/EN-XX_<slug>/
├── EN-01_definition.md   (v1.0.0 snapshot — reverse_engineered:*)
├── EN-02_design.md
├── EN-03_plan.md
└── EN-04_closure.md      (firmado)
```

**Feature:**
```
docs/works/features/FT-XX/enablers/EN-XX_<slug>/
├── EN-01_definition.md
├── EN-02_design.md
├── EN-03_plan.md
└── EN-04_closure.md
```

**Story:**
```
docs/works/features/FT-XX/user-stories/HU-YY/enablers/EN-XX_<slug>/
├── EN-01_definition.md
├── EN-02_design.md
├── EN-03_plan.md
└── EN-04_closure.md
```

## Reporte final (obligatorio)

1. **Enabler reconstruido**: `EN-XX_<slug>` + scope + path completo.
2. **Docs producidos**: los 4 EN-01..EN-04 con versión + reverse_engineered:*.
3. **Confidence**: valor de la corrida.
4. **Features/stories vinculadas**: qué habilita este enabler.
5. **ADRs retroactivos**: técnicos inferidos + scope.
6. **Padres bumpeados**: según scope declarado.
7. **Regla 8 status**: N/A para enabler (Regla 29 aplica sólo a bugs).
8. **Áreas de revisión humana**: motivación del enabler, rationale de decisiones técnicas.

## Referencias

- [`config.reverse.yaml`](../../settings/config.reverse.core.yaml)
- [`rules/reverse.md`](../../rules/reverse.md) — Regla 25-32.
- [`flow.reverse.md`](../../flows/flow.reverse.md)
- Skill suelto: [`/fremi-reverse-enabler`](../../reverse-engineering/reverse-enabler/SKILL.md)
- Regla 15 (enablers): [`rules/workflow.md`](../../rules/workflow.md)
