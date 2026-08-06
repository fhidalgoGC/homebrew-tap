# Flujo — Capa EXTRA

> **Config operativa:** [`~/.fremi/framework/settings/config.extra.yaml`](../settings/config.extra.yaml)
> **Skill:** ninguno — edición manual del archivo.
> **Rol:** trabajo fuera del flujo lineal (tooling, scripts, IaC, refactor de utilidades, mejoras a la metodología). NO usar como excusa para saltar el flujo cuando el trabajo SÍ es spec-driven (Regla 14).

---

## Qué produce esta capa

**1 archivo único** por concepto cohesivo:

- Ubicación: `docs/works/extra/EX-NN_<slug>.md`
- Numeración: **global al proyecto** — EX-NN secuencial (no reciclar).

**Secciones del archivo**:

| # | Sección | Obligatoriedad |
|---|---|---|
| 1 | `what-was-done` | Siempre |
| 2 | `why-not-feature-story-task` | Siempre |
| 3 | `concrete-changes` | Siempre |
| 4 | `validation` | Siempre |
| 5 | `linkages` | Condicional (`extra_linkages_when`) |
| 6 | `notes-learnings` | Condicional (`extra_notes_when`) |

---

## Diagrama del flujo

```
     Trabajo detectado fuera del flujo lineal:
     tooling, scripts, IaC, refactor de utilidades,
     mejoras a la metodología, limpieza de código zombi...
              │
              ▼
     ¿Es genuinamente fuera del flujo spec-driven?
              │
              ├── NO (es endpoint/feature/story) → usar /fremi-feature o /fremi-story
              ├── NO (habilita capacidad futura) → usar /fremi-enabler
              ├── NO (defecto en producción) → usar /fremi-story-bug o /fremi-feature-bug
              │
              └── SÍ (tooling / refactor / metodología):
              ▼
     ═══ PROCEDURE MANUAL (no hay skill) ═══

     1. Identificar próximo EX-NN
        Comando: `ls docs/works/extra/ | grep EX- | sort | tail -1` → +1

     2. Crear EX-NN_<slug>.md con las 4 secciones obligatorias:
        - what-was-done
        - why-not-feature-story-task
        - concrete-changes
        - validation

     3. Si aplica → agregar secciones condicionales:
        - linkages (si referencia ADRs, stories u otros EX-NN)
        - notes-learnings (si surgen aprendizajes / gotchas reusables)


     ═══ PARALLEL_ALLOWED ═══
     Ninguno — extra es independiente del flujo de skills.
```

---

## `flow.sequence: []` — sin skills

Extra **NO tiene skill dedicado** en el framework. Es edición pura del archivo por el usuario/agente.

Esto se refleja en `config.extra.yaml`:

```yaml
flow:
  sequence: []       # sin steps con skill
  parallel_allowed: []
```

Los pasos de creación viven en `procedure_manual` como **guía informativa**, no como flow de skills.

---

## Regla "un archivo por concepto cohesivo"

- **Un archivo agrupa cambios relacionados a UN concepto**. Aunque haya varios sub-cambios atómicos, si todos responden al mismo problema, viven juntos.
- **Conceptos distintos = archivos distintos**. No fusionar trabajos no-relacionados sólo porque ocurrieron el mismo día.

**Ejemplo válido**: `EX-01_postman-generator-improvements.md` con renombre + multipart override + baseUrl dinámico (todo el mismo concepto: mejoras al generador Postman).

**Ejemplo inválido**: `EX-01_mixed-changes.md` con "arreglé Postman + limpié code zombi + actualicé linter" (3 conceptos distintos → 3 archivos).

---

## Cuándo `EX-NN` se promueve a story

Si un trabajo que arrancó como `extra/` resulta tener **comportamiento user-facing significativo**, se promueve a story:

1. Crear la story con `FW-01..FW-10`.
2. Dejar el `EX-NN_<slug>.md` como **pointer histórico**:
   ```
   > Promovido a story HU-XX de FT-YY el YYYY-MM-DD. Ver allí para el flujo completo.
   ```
3. **No borrar** el `EX-NN` — sirve como rastro de cómo arrancó.

---

## Cuándo NO usar `EX-NN`

| Caso | Skill correcto |
|---|---|
| Endpoint nuevo / capacidad user-facing | `/fremi-feature` o `/fremi-story` |
| Trabajo técnico habilitador (fundación, plataforma) | `/fremi-enabler` |
| Defecto en código de producción | `/fremi-story-bug` o `/fremi-feature-bug` |
| Documentación general del framework | Editar `~/.fremi/framework/` directo |
| Notas personales / scratch pad | Fuera del proyecto (repo personal) — `EX-NN` es para docs comprensibles por otros |

---

## Anti-patrones

- ❌ Usar `extra/` como excusa para **saltar el flujo** cuando el trabajo SÍ es spec-driven (un endpoint nuevo va a story, no a `extra/`).
- ❌ Crear `EX-NN` por cada commit chico — un concepto cohesivo puede tener N commits.
- ❌ Mezclar varios conceptos no-relacionados en un mismo `EX-NN`.
- ❌ Notas personales / scratch pad — `extra/` es para docs comprensibles por otros.
- ❌ Olvidar crear `EX-NN` cuando se hace tooling — si después de cerrar la story alguien se pregunta "cuándo cambió X y por qué", debe haber rastro.

---

## Regla 17 aplicada — snapshot con ancestor.id: global

Los `EX-NN` son **snapshots** con:
```yaml
ancestor:
  id: global   # no tienen padre estructural
  version_at_creation: null
  version_at_closure: null
```

Como no hay padre a bumpear, `EX-NN` no dispara `parent_bump_triggers`. Se firma cuando termina el trabajo (fecha en la sección `validation` o final del archivo).

---

## Reglas aplicables

- **Regla 14** — Trabajo fuera del flujo se documenta en `docs/works/extra/EX-NN_<slug>.md`.

---

## Referencias

- Config operativa: [`config.extra.yaml`](../settings/config.extra.yaml)
- Regla 14 (trabajo fuera del flujo): [`workflow.md`](../rules/workflow.md)
- Ejemplos existentes: `docs/works/extra/EX-*.md`
