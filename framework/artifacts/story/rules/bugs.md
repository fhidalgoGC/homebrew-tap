# Reglas de bug como artefacto opcional

> **Regla 15 (parte bugs).** Un bug es un artefacto opcional del flujo — se crea bajo demanda cuando el trabajo lo amerita. Cubre estructura del archivo, scopes (story/feature), numeración, procedimiento y anti-patrones.
>
> **Categorizada bajo story** — el scope primario de bugs es story (los bugs nacen de comportamiento no especificado por una story). Referenciada por feature/enabler/reverse-* vía `applies.yaml`.
>
> **Reglas relacionadas** (en otros archivos):
> - **R8** (test rojo primero al fixear un bug) → `bug-fix-and-refactor.md`.
> - **R9** (refactor no cambia comportamiento) → `bug-fix-and-refactor.md`.
> - **R11** (closure story con bugs abiertos) → `closure.md`.
> - **R14** (trabajo fuera del flujo) → `~/.fremi/framework/artifacts/extra/rules/extra-doc.md`.
> - **R15-enabler** (enablers como artefacto opcional) → `~/.fremi/framework/artifacts/enabler/rules/enabler-lifecycle.md`.
> - **R20** (scope de bugs — 2 scopes) → `~/.fremi/framework/artifacts/story/rules/adr.md`.

---

## Regla 15 — Bugs son artefactos OPCIONALES del flujo

El flujo principal (producto → feature → story) **no obliga** a crear bugs. Un bug se agrega **bajo demanda** cuando aparece un defecto en producción.

### Qué es un bug

Un **bug** es un defecto detectado en código de producción (o en la suite que protege producción): el sistema hace algo distinto a lo que la story/feature que lo creó dejó especificado.

**Si el comportamiento "incorrecto" NO está cubierto en ninguna story** → no es bug, es un gap de spec. Crear/extender la story primero, después registrar el bug.

### Ubicación — 2 scopes (ver R20)

| Scope | Ubicación | Skill | Cuándo |
|---|---|---|---|
| **Story** (default) | carpeta `bugs/` de la story (filename pattern configurable — ver methodology) | `/fremi-story-bug <feature-id>/<story-id>` | Bug atribuible a UNA story concreta |
| **Feature** | carpeta `bugs/` de la feature (filename pattern configurable — ver methodology) | `/fremi-feature-bug <feature-id>` | Bug transversal a varias stories, o afecta contrato de feature sin trazar a UNA story |

**Numeración del bug LOCAL al scope** — cada story/feature arranca desde el primer número en su carpeta `bugs/`. El identificador compuesto combina feature + story + bug según `methodology.core.yaml → layers.bug.*`.

### Estructura del archivo

**Un archivo único por bug**, no folder. Secciones obligatorias:

- **Síntoma observado, impacto y severidad.**
- **Reproducción + test rojo** (R8 — `bug-fix-and-refactor.md`).
- **Causa raíz.**
- **Fix aplicado** (¿cambió la spec? → R10 + ADR en el scope correcto).
- **Vinculaciones** (story origen, ADRs, releases).
- **Cierre** (DoD + sign-off).

### Procedimiento

1. **Identificar scope** — ¿bug atribuible a UNA story o transversal a varias/afecta contrato de feature?
2. **Crear el bug** con el skill del scope correcto:
   - `/fremi-story-bug <feature-id>/<story-id>` — bug local a UNA story.
   - `/fremi-feature-bug <feature-id>` — bug transversal a la feature.
   - Los nombres concretos de los skills están declarados en `methodology.core.yaml → layers.bug`.
3. **Aplicar R8** — test rojo de reproducción primero, después el fix (ver `bug-fix-and-refactor.md`).
4. **Si el fix cambia la spec** → aplicar R10 + registrar ADR en el scope correcto (ver `adr.md → R20`).
5. **Bugs abiertos en una story bloquean parcialmente su cierre** (R11 en `closure.md`) — el doc `checkwork` de la story debe reflejarlo en su sección "Bugs abiertos asociados".

### Interacción con otros artefactos opcionales

- **Enablers vs bugs** — un enabler habilita capacidad técnica (ver `~/.fremi/framework/artifacts/enabler/rules/enabler-lifecycle.md`); un bug corrige defecto. Si un enabler revela un defecto durante su implementación → registrar bug aparte.
- **Extras vs bugs** — un extra documenta trabajo sin ciclo BDD/SDD (tooling, refactor de metodología — ver `~/.fremi/framework/artifacts/extra/rules/extra-doc.md`); un bug corrige comportamiento. No confundirlos.

### Anti-patrones

- ❌ Llamar bug a una capacidad faltante — eso es feature/story nueva.
- ❌ Bug fuera de una story (en carpeta global) — los bugs salen de stories, viven en stories o en la feature que las contiene.
- ❌ Fix sin test rojo previo (viola R8).
- ❌ Cerrar story con bugs abiertos sin resolverlos o transferir el seguimiento (viola R11).
- ❌ Registrar un bug cuando el comportamiento nunca estuvo especificado — eso es gap de spec, crear/extender la story primero.
