---
name: fremi-story-sdd
description: Puebla o actualiza el doc `sdd` (`{workflow.sdd}`) de una story — contratos externos (interfaces que otros consumen) SIN haber decidido tecnología. Doc snapshot. Incluye firmas, schemas de request/response, tabla de errores expuestos, RNFs medibles. Nada que dependa de una decisión técnica interna (librería, wrapper, capa) — eso es Design.
---

> **Nota sobre identificadores:** los prefijos concretos (feature, story, workflow doc, escenarios) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-story-sdd — Poblar el doc `sdd` (contratos externos)

Puebla el `{workflow.sdd}` con los **contratos que se sostienen SIN haber decidido tecnología**:
- Endpoints / eventos / comandos expuestos.
- Schemas de request/response.
- Tabla de códigos de error / mensajes expuestos.
- RNFs medibles (latencia, throughput, límites).

**Rol del doc**: qué CONTRACTUAL cumple la story. NO incluye librerías, wrappers ni capas internas — eso es Design (Regla 6.3).

## Sintaxis

```
/fremi-story-sdd <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- El doc `bdd` está completo y hay que aterrizar los contratos técnicos externos.
- Se descubrió un contrato adicional que hay que exponer.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.workflow_doc.items[name=sdd-spec]`.
- `config.yaml` → `phase_rules.sdd`.

### Paso 1 — Validar padre y precondiciones
- `{workflow.bdd}` con escenarios completos (happy path + borde).
- `{workflow.definition}` con CAs.

### Paso 2 — Cargar template
- `references/{workflow.sdd}-template.md`.

### Paso 3 — Poblar aplicando `phase_rules.sdd`

Reglas duras:
- **Contratos que se sostienen SIN decidir tecnología.** Si necesitás elegir librería para definirlo, es Design.
- Tabla de códigos/errores expuestos por la interfaz — cada uno mapea a un escenario de error del doc `bdd`.
- NFRs medibles (latencia, throughput) cuando apliquen — con unidad y target.
- **Bifurcaciones técnicas → Regla 3b**: si hay 2+ opciones de contrato (ej: query param vs body, REST vs GraphQL), **pausar**, presentar opciones al usuario, invocar `/fremi-story-adr`, referenciar el ADR.

### Paso 4 — Versionado (Regla 17)
- Snapshot: `version: 1.0.0`, `ancestor.version_at_creation` = versión feature/definition.

### Paso 5 — Escribir y reportar
- Guardar.
- Reportar contratos y errores declarados. Mencionar ADRs generados (si hubo bifurcación).
- Sugerir próximo paso: `/fremi-story-design`.

## Validaciones

- Cada escenario del doc `bdd` debe tener contrato SDD asociado (endpoint/schema/error).
- Todos los códigos de error expuestos tienen semántica clara y mapean a un escenario de error.
- NFRs con unidad + target (no "rápido"; sí "p95 < 500ms").
- Sin refs a librerías internas específicas (Puppeteer, Zod, etc.).
- Si hubo bifurcación técnica → ADR registrado y referenciado.

## Anti-patrones

- ❌ "Usar Zod para validar" — eso es Design.
- ❌ "El handler llama a X wrapper" — eso es Design.
- ❌ NFRs vagos ("rápido", "escalable") — deben ser medibles.
- ❌ Contratos con TBDs — se resuelven acá.
- ❌ Decisión técnica sin ADR — viola Regla 3b.

## Referencias

- Template: [`references/{workflow.sdd}-template.md`](references/{workflow.sdd}-template.md).
- `config.yaml → phase_rules.sdd`.
- `~/.fremi/framework/rules/workflow.md` → Regla 6.3 (SDD antes que Design), Regla 3b (bifurcaciones).
