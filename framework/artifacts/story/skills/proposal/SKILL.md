---
name: fremi-story-proposal
description: Crea o actualiza el doc de proposal (fase `proposal`) de una story — típicamente `{workflow.proposal}`. Puente entre definition y scope detallado. Declara intent + approach elegido (con opciones si hubo bifurcación) + decisions ancladas a ADRs + impact + risk + rollout. Genérico — filename se resuelve por config, no hardcoded. Usar cuando la story amerita proposal según `config.yaml → conditional_rules.proposal_when` (contrato externo nuevo, bifurcación técnica, 3+ archivos, cambio user-facing, riesgo de rollback).
---

# /fremi-story-proposal — Proposal técnica (fase proposal de una story)

Este skill instancia o actualiza el doc **`proposal`** de una story (por default `{workflow.proposal}`; el filename real sale de config).

Su objetivo es **cerrar el approach técnico** antes de bajar al scope detallado + BDD. Contiene:
- **Intent** técnico específico.
- **Approach** elegido, con **opciones evaluadas** si hubo bifurcación (Regla 3b).
- **Decisions numeradas**, cada una anclada a un ADR.
- **Known Limitations** aceptadas.
- **Impact** (archivos afectados + delta LOC).
- **Rollout** y **Risk**.

**No define scope detallado ni BDD** — eso va en `{workflow.scope}` y `{workflow.bdd}`.

---

## Sintaxis

```
/proposal <FEATURE_ID> <STORY_ID>
```

---

## Cuándo invocarlo

**Obligatorio** (Regla 16 + `config.yaml → conditional_rules.proposal_when`): cuando al menos UNO aplica:
- La story introduce un contrato externo nuevo (endpoint, evento, comando público).
- La story tiene una bifurcación técnica que dispara Regla 3b.
- La story afecta 3+ archivos no triviales o cruza módulos.
- La story cambia comportamiento visible al usuario final.
- La story tiene riesgo de rollback (migración de datos, API break).

**Opcional**: bug fixes locales, cambios de wording, ajustes de configuración interna.

**Precondición**: `{workflow.definition}` debe existir y estar completo (Regla 1). Si existe `{workflow.explore}`, este skill lo lee para heredar contexto y alternativas ya identificadas.

---

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.core.yaml`.
2. Leer `~/.fremi/framework/settings/config.core.yaml`.
3. De `config.yaml`:
   - `config.story.yaml → docs[name=proposal]` → `required`, `condition_ref`.
   - `conditional_rules.proposal_when` → criterios.
   - `phase_rules.proposal` → reglas obligatorias del doc.
4. De `methodology.core.yaml`:
   - `identifiers.workflow_doc.items[name=proposal]` → filename real.
   - `identifiers.adr` → para referenciar/crear ADRs.

Si algún archivo no parsea → abortar.

### Paso 1 — Resolver rutas

- `story_folder` (via feature_folder + story_folder).
- `proposal_filename` (via methodology.core.yaml).
- Ruta final: `{story_folder}/{proposal_filename}`.
- **Cargar contexto previo**:
  - `{workflow.definition}` (obligatorio, precondición).
  - `{workflow.explore}` (si existe).
  - ADRs vigentes en `product/decisions.md` y `feature/decisions.md`.

### Paso 2 — Evaluar obligatoriedad (Regla 16)

Presentar al usuario los criterios `obligatory_if_any[]` de `proposal_when`. Si ninguno aplica y el usuario confirma, abortar limpiamente. Si aplica al menos uno, registrar cuál (se cita en el `Trigger` del doc).

### Paso 3 — Detectar bifurcaciones técnicas (Regla 3b)

Este skill DEBE ejecutar Regla 3b activamente durante la redacción:
1. Cada vez que se identifica una decisión técnica con 2+ caminos viables, **PAUSAR** la redacción.
2. Presentar al usuario 2-3 opciones con pros/contras.
3. Esperar la elección.
4. Invocar `/fremi-story-adr` (o guiar al usuario a hacerlo) para registrar la decisión.
5. Referenciar el ADR en la sección "Decisions" del proposal.

Sin ADR, ninguna decision debe quedar registrada en el proposal.

### Paso 4 — Cargar template y poblar

1. Cargar `~/.fremi/framework/skills/proposal/references/{workflow.proposal}-template.md` — **este skill es dueño del template canónico**.
2. `~/.fremi/framework/artifacts/story/references/{workflow.proposal}-template.md` es un **symlink** que apunta acá; no es un archivo alternativo.
3. Si el template local no existe → generar estructura mínima con las secciones obligatorias de `phase_rules.proposal` y avisar al usuario que hay que reponerlo.
2. Aplicar `phase_rules.proposal` como checklist:
   - Estructura fija: Intent, Scope (resumen), Approach, Decisions, Known Limitations, Impact, Acceptance Criteria, Rollout, Risk.
   - Approach expone opciones si hubo bifurcación.
   - Cada Decision ancla a un ADR-XXX.
   - Impact lista archivos con delta LOC.
   - Acceptance Criteria referencia los CA-XXX de definition (no los redefine).

### Paso 5 — Calcular Impact real

Antes de escribir la tabla de "Impact — Archivos afectados":
- Enumerar archivos concretos que la story va a tocar.
- Estimar delta LOC (puede ser rough: +N/-M).
- **No inventar** — si no se puede saber sin implementar, decirlo ("delta estimado a refinar en `{workflow.design}`").

### Paso 6 — Escribir el archivo

1. Reemplazar placeholders con valores derivados.
2. Si el archivo ya existe y tiene contenido → NO sobreescribir. Ofrecer: agregar Decision nueva / actualizar sección específica / cancelar.

### Paso 7 — Actualizar checkwork si existe

Marcar en `{workflow.checkwork}` (o el filename resuelto) que el proposal fue creado, con fecha y qué criterio de `proposal_when` aplicó.

### Paso 8 — Reportar

- Ruta del archivo creado.
- Cuántas decisions se registraron y con qué ADRs quedaron ancladas.
- Riesgos identificados con severidad.
- Próximo paso: `/fremi-story` (si faltan docs de scope/bdd/sdd) o continuar con `{workflow.scope}`.

---

## Validaciones

- `{workflow.definition}` debe existir con contenido real. Si no → abortar (Regla 1).
- Cada Decision debe tener un ADR-XXX referenciado. Si el ADR no existe, invocar `/fremi-story-adr` primero.
- La sección Acceptance Criteria referencia CA-XXX existentes del definition — validar los IDs.
- No sobreescribir contenido existente sin confirmación explícita.

---

## Anti-patrones

- ❌ Escribir Decisions sin ADR anclado ("Decidimos usar Puppeteer" sin ADR-XXX) — viola Regla 3.
- ❌ Repetir criterios de aceptación de definition en vez de referenciar los CA-XXX.
- ❌ Meter detalle de scope in/out en el proposal — eso va en `{workflow.scope}`.
- ❌ Meter firmas de funciones internas o pseudocódigo — eso va en `{workflow.design}`.
- ❌ Elegir approach silenciosamente cuando hubo bifurcación — Regla 3b obliga a pausar y preguntar.
- ❌ Hardcodear `{workflow.proposal}` — resolver por methodology.core.yaml.

---

## Referencias

- `~/.fremi/framework/settings/config.core.yaml` → `config.story.yaml`, `conditional_rules.proposal_when`, `phase_rules.proposal`.
- `~/.fremi/framework/settings/methodology.core.yaml` → `identifiers.workflow_doc.items[name=proposal]`.
- `~/.fremi/framework/rules/workflow.md` → Regla 3b (bifurcaciones), Regla 16 (condicionales), Regla 6 (SDD dirige).
- **Template canónico** (dueño): `~/.fremi/framework/skills/proposal/references/{workflow.proposal}-template.md`.
- `~/.fremi/framework/artifacts/story/references/{workflow.proposal}-template.md` es symlink que delega acá.
