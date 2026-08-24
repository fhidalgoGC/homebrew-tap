---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-engineering/flow.md
  version_at_creation: null
---

# Flujo — Skill REVERSE-FEATURE (`/fremi-reverse-feature`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de ejecución.
> **Invocación / documentación de skill:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico de reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — describe las 6 fases genéricas. Este documento detalla cómo ese arco se materializa en la capa feature.

---

## Qué hace este skill

Reconstruye los docs formales de una feature — `definition.md` y opcionalmente `decisions.md` — a partir de:
- Stories ya existentes bajo `FT-XX/user-stories/*`.
- Código legacy relacionado con la feature.
- ADRs locales encontrados en el proyecto.

Es un skill **ligero comparado con reverse-story**: produce 1-2 docs, no una cadena completa. Su principal valor es formalizar la capa feature cuando las stories ya existen (o el código existe) pero el `definition.md` nunca se creó o quedó desactualizado.

**Cuándo invocarlo:**
- Existe `FT-XX/user-stories/*` con stories reales pero no hay `FT-XX/definition.md`.
- El `definition.md` quedó obsoleto tras varias stories cerradas.
- Se migra código legacy al framework y hay que formalizar la feature.

**Cuándo NO invocarlo:**
- Para features nuevas → usar `/fremi-feature` normal.
- Si la feature tiene pocas o ninguna story con docs → correr primero `/fremi-reverse-story` para las stories sin docs. El reverse-feature es más rico cuando hay docs de stories que consolidar.

---

## Alcance — docs que produce

| Doc | Obligatoriedad | Fuente principal |
|---|---|---|
| `FT-XX/definition.md` | Siempre | Consolidación de stories FW-01 + FW-03 + FW-05; iniciativa → preguntar |
| `FT-XX/decisions.md` | Condicional | Sólo si existen ADRs locales de la feature |

---

## Arco narrativo

### Fase 0 — Cargar configuración

El skill lee los archivos de configuración necesarios:
- `methodology.core.yaml` — para resolver tokens e identificadores.
- `config.reverse.core.yaml` — defaults de reverse (modo, confidence).

Si alguno falta → abortar antes de empezar.

### Fase 1 — Identificar la feature

El skill verifica que el folder `docs/works/features/{FT-XX}_<slug>/` existe. Si no existe → abortar con sugerencia de usar `/fremi-feature` para crear una feature nueva.

También revisa el estado del `definition.md` existente (si hay): ¿está vacío? ¿tiene contenido real? ¿está completamente desactualizado? Esto ajusta la estrategia de reconstrucción (crear desde cero vs actualizar).

### Fase 2 — Escanear artifacts sobrevivientes

Con el folder de la feature como raíz, el skill recolecta:

- **Stories existentes** (`FT-XX/user-stories/HU-YY_*/`): para cada story enumera el título del `{workflow.definition}`, las capacidades in-scope del `{workflow.scope}`, los contratos del `{workflow.sdd}`, los términos técnicos usados y los ADRs delta referenciados.
- **Código relacionado** (si aplica, para features legacy sin stories con docs): módulos y paths relacionados con la feature.
- **ADRs locales**: busca en `FT-XX/decisions.md` (si existe) y en `HU-YY/decisions.md` de cada story-delta.

El escaneo produce un reporte interno que alimenta la inferencia.

### Fase 3 — Evaluar si `decisions.md` aplica

El skill evalúa si existe al menos 1 ADR de scope feature:
- Si hay ADRs locales → generar `FT-XX/decisions.md`.
- Si no → omitir.

Adicionalmente, revisa si algún ADR trasciende la feature (alcance global) → sugerir promoverlo a `product/decisions.md` (R20). Esta sugerencia se presenta al usuario antes de continuar.

### Fase 4 — Reconstruir docs + preguntas dirigidas (Regla 27)

El núcleo del skill: construye el `definition.md` consolidando las stories, y el `decisions.md` si aplica.

**Regla dura (R27)**: el skill infiere y **pregunta al usuario**. **Nunca inventa**.

Construcción del `definition.md`:

| Campo | Fuente de inferencia | ¿Preguntar al usuario? |
|---|---|---|
| Título de la feature | Slug del folder + títulos de stories | No (inferible) |
| Descripción | Agregación de descripciones del `{workflow.definition}` de cada story | Sólo si no hay stories suficientes |
| Iniciativa conectada | NO inferible del código | **Sí — siempre (R27)** |
| Aporte a métricas | No inferible del código | **Sí — preguntar KPIs (R27)** |
| Dependencias de capacidades | Capacidades de `product/definition.md` referenciadas | No (inferible) |
| Alcance | Agregación de in-scope de `{workflow.scope}` de stories | No |
| Fuera de alcance | Agregación de out-of-scope | No |
| Criterios de éxito | Agregación de CAs de stories — refinar | Confirmar si representan la meta de negocio |
| Lista de user stories | Enumerar HU-YY con estado | No |
| Decisiones vinculadas | ADRs referenciados en stories | No |
| Glosario local | Términos técnicos en 2+ stories no en glosario de producto | No |

Si la revisión detecta capacidades que aplican a más de una feature (o al producto), el skill pausa y sugiere sync-back a la capa producto (R12).

### Fase 5 — Timestamps + linaje (Regla 17, R30)

Para cada doc producido, el skill aplica el frontmatter de Regla 17 con timestamps inferidos:

- `created` = fecha del primer commit de código relacionado con la feature.
- `version` = `0.1.0` (`definition.md` es un living doc que evoluciona).
- `ancestor.version_at_creation` = versión de `product/plan.md` al momento inferido (si la capa producto existe).

**Si no hay `.git`**: usar fecha actual con `reverse_engineered_confidence: 0.3`.

**Modo `--transparent`** (default): agrega al frontmatter el bloque `reverse_engineered:*`.
**Modo `--stealth`** (override explícito): omite el bloque; requiere justificación por ADR de proyecto (R26).

### Fase 6 — Bumpear padre + reporte (Regla 17, R30)

Si la feature no estaba listada en `product/plan.md` (y la capa producto existe):
- Agregar la feature al plan + MINOR bump de `product/plan.md`.

Luego emite el reporte final al usuario.

---

## Stop events — dónde pausa el skill

| Stop event | Cuándo aparece | Acción |
|---|---|---|
| `initiative_unknown` | No se puede inferir la iniciativa asociada | Pedir init-XXX al usuario |
| `metrics_not_definable` | No hay información de KPIs de negocio | Pedir al usuario los criterios de éxito de negocio |
| `adr_rationale_missing` | ADR detectado sin motivación en commits ni PRs | Pedir motivación al usuario |
| `stories_insufficient_for_inference` | Menos de 2 stories con docs útiles | Advertir baja confianza; sugerir correr `/fremi-reverse-story` primero |
| `transversal_capability_detected` | Capacidad que aplica a múltiples features | Pausar; sugerir sync-back a producto (R12) |
| `adr_scope_promotion_suggested` | ADR local con alcance global | Sugerir promover a product/decisions.md (R20) |
| `git_history_missing` | No se encuentra `.git` | Pedir fechas manuales o asumir hoy con confidence 0.3 |

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R25** — Trabajo pre-existente y estable (no feature en desarrollo activo).
- **R24** — Framework instalado.
- Folder `FT-XX_<slug>/` existe.
- Layer identificable (no ambigüedad de qué feature cubre el código).
- `methodology.core.yaml` presente.

---

## Transparent vs. stealth — el trade-off

**Usar `--transparent`** (default): cuando la trazabilidad histórica importa — saber qué fue planificado vs qué fue inferido del estado actual del proyecto.

**Usar `--stealth`** sólo cuando: el proyecto tiene ADR de proyecto que justifica borrar el historial de deuda técnica.

En proyectos donde la capa feature llegó como resultado de migración legacy, `--transparent` es especialmente valioso: el `definition.md` reconstruido lleva `reverse_engineered_confidence` que advierte a futuros lectores sobre la solidez de la iniciativa conectada y las métricas de éxito.

---

## Advertencias de revisión humana (Regla 28)

El output de reverse-feature es **base**, no verdad final:

- **Iniciativa conectada**: la respuesta del usuario es una interpretación post-hoc — validar con stakeholders originales si están disponibles.
- **Métricas de éxito**: los CAs de las stories capturan comportamiento de código, no objetivos de negocio. La meta de la feature es de negocio — requerir revisión.
- **Feature legacy sin stories con docs**: la reconstrucción es pobre — mayormente código. Considerar `/fremi-reverse-story` primero para tener material de stories del cual consolidar.
- **ADRs locales que deberían promoverse**: si el skill sugirió una promoción y el usuario la postergó, registrar como deuda técnica.

---

## Estado final después del skill

La feature queda con los docs formales:

```
docs/works/features/{FT-XX}_<slug>/
├── definition.md    (v0.1.0 — living, reconstruido de stories + usuario)
└── decisions.md     (v0.1.0 — opcional, si había ADRs locales)
```

`product/plan.md` bumpeado si la feature no estaba registrada.

**Próximo paso natural**: revisar los gaps reportados (iniciativa, métricas) + correr `/fremi-sync-check` para verificar coherencia con el resto del framework. Si hay stories sin docs de flow, considerar `/fremi-reverse-story` para cada una.

---

## Reglas activas durante la ejecución

- **R25** — Precondiciones de reverse.
- **R26** — Frontmatter transparent por default.
- **R27** — Preguntas dirigidas; nunca inventar.
- **R28** — El output es base, no verdad final.
- **R30** — Regla 17 con timestamps inferidos + bump de product/plan.
- **R31** — Reverse sólo para trabajo pre-existente.
- **R17** — Frontmatter versionado + ancestor.
- **R12** — Sync-back: capacidades transversales → proponer subir a producto.
- **R3b** — Bifurcaciones en ADRs → `discovered_during_reverse: true`.
- **R20** — ADRs de scope feature: evaluar si promover a producto.
- **R24** — Framework instalado.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- Reglas de reverse: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md) — R25–R32
- Flujo canónico de reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Flow normal de feature: `/fremi-feature` + sub-skills
- Skill complementario: `/fremi-reverse-story` (para stories huérfanas dentro de la feature)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: narrativa del skill reverse-feature.
