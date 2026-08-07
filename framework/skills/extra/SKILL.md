---
name: fremi-extra
description: Scaffolder para la capa EXTRA (Regla 14). Calcula el próximo `EX-NN` global, valida el slug, y crea `docs/works/extra/EX-NN_<slug>.md` con el template canónico + frontmatter (Regla 17). El usuario llena las secciones a mano — el skill NO automatiza el contenido (violaría Regla 14 si el trabajo es spec-driven).
---

# /fremi-extra — Crear un archivo EXTRA

Crea un archivo nuevo en la capa **EXTRA** (Regla 14) — trabajo fuera del flujo lineal (tooling, scripts, IaC, refactor de utilidades, mejoras a la metodología). El skill hace el scaffold; el contenido lo llena el usuario.

## Sintaxis

```
/fremi-extra <slug>
```

- `<slug>` — kebab-case (`^[a-z][a-z0-9-]*$`, max 60 chars). Se normaliza si recibe espacios/underscores.

## Cuándo invocarlo

- Cambio de tooling / scripts / config que **modifica el repo de forma duradera** pero **NO** entrega valor user-facing nuevo.
- Refactor de utilidades sin cambio de comportamiento (Regla 9 clásica pero en trabajo transversal).
- Ajustes a IaC que no cambian contratos externos.
- Mejoras a la metodología (`~/.fremi/framework/`) que el usuario aplica al proyecto.

## Cuándo NO invocarlo

- El trabajo es spec-driven (endpoint nuevo, comportamiento observable, bug con test rojo) → usar `/fremi-story`, `/fremi-story-bug`, o el skill apropiado. **Extra NO es excusa para saltar el flujo** (Regla 14 anti-patrón #1).
- El trabajo habilita capacidad técnica futura sin entregar valor → usar `/fremi-enabler`.
- Un solo commit chico de formatting/typo → no amerita EX-NN.

## Procedimiento

### Paso 0 — Validar entrada

1. Normalizar `<slug>` a kebab-case.
2. Validar regex `^[a-z][a-z0-9-]*$` y largo ≤ 60.
3. Verificar Regla 24 — framework instalado (`.claude/skills/fremi-install-framework` es symlink, `CLAUDE.md` referencia rules).
4. Verificar `.fremi/settings/extra/config.user.yaml → active: true` (o `~/.fremi/framework/skills/extra/config.core.yaml` como fallback).

### Paso 1 — Confirmar clasificación (Regla 14)

Preguntar al usuario:

```
Vas a crear un EX-NN — trabajo fuera del flujo. Confirmá que ES uno de:

  ✓ tooling / scripts / config duradera pero NO user-facing
  ✓ refactor sin cambio de comportamiento
  ✓ IaC sin cambio de contratos externos
  ✓ mejora a metodología

y NO es:

  ✗ endpoint / API / comportamiento observable → usar /fremi-story
  ✗ bug con test rojo posible → usar /fremi-story-bug o /fremi-feature-bug
  ✗ trabajo que habilita capacidad futura → usar /fremi-enabler

¿Confirmás? [sí/no]
```

Si el usuario duda, sugerir el skill correcto y abortar.

### Paso 2 — Calcular próximo EX-NN

1. Listar `docs/works/extra/EX-*.md`.
2. Extraer el número más alto (default 0 si no hay ninguno).
3. Siguiente `EX-NN` = max + 1, con padding según `~/.fremi/framework/settings/methodology.user.yaml → identifiers.extra.id_format` (default `EX-NN` con 2 dígitos, o lo que tenga el user file).
4. Verificar que `docs/works/extra/EX-NN_<slug>.md` NO existe todavía.

### Paso 3 — Crear el archivo

1. `mkdir -p docs/works/extra/`
2. Leer `references/EX-NN-template.md`.
3. Escribir `docs/works/extra/EX-NN_<slug>.md` con el template. Reemplazar:
   - `{ID}` → `EX-NN`
   - `{SLUG}` → `<slug>`
   - `{TITLE}` → capitalizar el slug (`user-auth-refactor` → `User Auth Refactor`)
   - Frontmatter (Regla 17):
     - `version: 1.0.0`
     - `created: <today>`
     - `last_updated: <today>`
     - `doc_type: snapshot`
     - `ancestor.id: project`
     - `ancestor.version_at_creation: <project@version>` (leer de `.fremi/settings/config.user.yaml`)

### Paso 4 — Reportar

```
✅ Archivo EXTRA creado: EX-NN_<slug>
📁 Path: docs/works/extra/EX-NN_<slug>.md

Próximos pasos manuales (el skill NO los automatiza — Regla 14):
  1. Llená las 4 secciones obligatorias:
     - what-was-done
     - why-not-feature-story-task
     - concrete-changes
     - validation
  2. (opcional) Agregá `linkages` si referencia ADRs, stories o otros EX.
  3. (opcional) Agregá `notes-learnings` si hay gotchas para otros.

Referencias:
  - Config: ~/.fremi/framework/skills/extra/config.core.yaml
  - Template: ~/.fremi/framework/skills/extra/references/EX-NN-template.md
  - Regla 14: ~/.fremi/framework/rules/workflow.md
```

## Validaciones

- Slug inválido → abortar mostrando la regla.
- Framework no instalado (Regla 24) → abortar.
- `.fremi/settings/extra/config.user.yaml → active: false` → abortar con nota.
- Colisión (`EX-NN_<slug>.md` ya existe) → sugerir sufijo (`-v2`) o pedir slug distinto.

## Anti-patrones

- ❌ Usar `/fremi-extra` para trabajo spec-driven — viola Regla 14.
- ❌ Crear un EX-NN por cada commit — un concepto cohesivo puede tener N commits.
- ❌ Llenar las secciones automáticamente basándose en el diff — el usuario clasifica y contextualiza.

## Referencias

- Regla 14: [`~/.fremi/framework/rules/workflow.md`](../../rules/workflow.md) — trabajo fuera del flujo.
- Regla 17: [`~/.fremi/framework/rules/workflow.md`](../../rules/workflow.md) — living versioning + ancestor.
- Config: [`config.core.yaml`](config.core.yaml).
- Template: [`references/EX-NN-template.md`](references/EX-NN-template.md).
