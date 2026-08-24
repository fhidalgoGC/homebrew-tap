# `~/.fremi/framework/rules/` — Reglas duras cross-domain

> **Esta carpeta es configuración para los agentes (IA).** Los archivos `.md` acá son reglas que la IA **debe aplicar obligatoriamente** al trabajar en el proyecto. No son documentación opcional ni guías sugeridas.
>
> Este README es para humanos: explica qué reglas viven acá vs en los artifacts, dónde se cargan, y cómo extender.

---

## Estructura de reglas — 2 niveles

Las reglas del framework se distribuyen en **dos niveles** por dominio:

### 1. Cross-domain (esta carpeta — `~/.fremi/framework/rules/`)

Reglas que aplican a **más de un artifact** (story, feature, product, enabler, extra). El texto vive acá porque su ámbito trasciende una capa específica.

### 2. Domain-específicas (dentro de cada artifact)

Reglas que aplican **sólo a un artifact**. Viven en `~/.fremi/framework/artifacts/<capa>/rules/`. El orquestador de esa capa carga únicamente su carpeta local — así se aísla el contexto y no se cargan reglas irrelevantes al dominio en uso.

---

## Contenido de esta carpeta (cross-domain)

| Archivo | Reglas | Cubre |
|---|---|---|
| `workflow.md` | (índice) | Jerarquía 3-capas, convención de nomenclatura, principio rector, índice completo + links a reglas domain-específicas. |
| `hierarchy.md` | R1 | R1: no salta etapas (transversal). R4 se movió a `artifacts/product/rules/discovery.md`. |
| `sync-back.md` | R10, R12 | Docs como fuente de verdad; sync-back bidireccional entre capas. (No es closure de ningún artifact.) |
| `versioning.md` | R17 | Living versioning; frontmatter; bump; changelog; rastreo ancestral. |
| `framework-mechanics.md` | R18, R19, R21, R22, R23, R24 | Meta-framework: skills, templates, prefijo, config por capa, hooks, guard de instalación. |
| `README.md` | — | Este archivo. |

Reglas movidas fuera de este directorio (categorizadas bajo su capa/dominio primaria — todavía referenciadas por otras capas vía `applies.yaml`):

- **R3, R3b, R20** (ADRs) → `artifacts/story/rules/adr.md`.
- **R8, R9** (bug fix + refactor) → `artifacts/story/rules/bug-fix-and-refactor.md`.
- **R14** (extra) → `artifacts/extra/rules/extra-doc.md`.
- **R4** (discovery) → `artifacts/product/rules/discovery.md`.
- **R15-bugs** (bugs como artefacto opcional) → `artifacts/story/rules/bugs.md`.
- **R15-enabler** (enablers como artefacto opcional) → `artifacts/enabler/rules/enabler-lifecycle.md`.
- **R25–R32** (reverse-engineering) → `reverse-engineering/rules/reverse.md`.

## Reglas domain-específicas por artifact

Ver el índice completo en `workflow.md`. Resumen:

- **`artifacts/story/rules/`** — R2, R3, R3b, R5, R6 (6.1–6.4), R7, R7b, R8, R9, R11, R13, R16, R20.
- **`artifacts/product/rules/`** — R4 (`discovery.md`). El `applies.yaml` indexa R4 + reglas cross-domain (R1, R10, R12, R17) + adr/bug movidos a story (R3, R3b, R20) por step.
- **`artifacts/feature/rules/`** — No tiene reglas .md domain-específicas propias. Feature usa mayormente rules cross-domain (R1, R10, R12, R15, R17) + adr/bug movidos a story (R3, R3b, R20, R8, R9). La única regla condicional domain-específica (`feature_decisions_when`) es configuración de usuario y vive en `config.user.yaml → conditional_rules`, no como archivo .md.
- **`artifacts/enabler/rules/`** — `enabler-lifecycle.md` (R15-enabler). `applies.yaml` indexa R15-enabler + reglas cross-domain (R1, R17, R10, R12) + adr movido a story (R3, R3b, R20) por step.
- **`artifacts/extra/rules/`** — `extra-doc.md` (R14). `applies.yaml` indexa R14 + reglas cross-domain (R10, R17, R24) + adr movido a story (R3, R3b, R20) por step.

---

## ¿Quién lee estos archivos?

- **CLAUDE.md** (raíz del proyecto) referencia explícitamente `~/.fremi/framework/rules/workflow.md` como "**Reglas duras**" que deben leerse antes de cualquier acción no trivial. Es el punto de entrada global.
- **`applies.yaml`** de cada artifact declara qué reglas cargar por step — el orquestador consulta ese archivo, no toda la carpeta rules.
- **Skills** referencian secciones específicas por regla (`ver Regla 6 en ...`).
- **Humanos** consultan estos archivos cuando quieren entender por qué la IA pide crear un doc previo o pausar antes de implementar.

---

## Cuándo crear una regla nueva

1. **Determinar el dominio de la regla**:
   - ¿Aplica a más de un artifact? → cross-domain → esta carpeta.
   - ¿Aplica sólo a story (o sólo a feature, etc.)? → domain-específica → `artifacts/<capa>/rules/`.
2. **Elegir/crear el archivo temático** correspondiente en el dominio elegido.
3. Numerar secuencialmente: la última hoy es **Regla 32**. La próxima sería **Regla 33**.
4. No reciclar números — si una regla se reemplaza, marcarla `Reemplazada por Regla X` y crear una nueva con número siguiente.
5. Estructura obligatoria de cada regla:
   - **Título corto** (qué prohíbe o impone).
   - **Justificación** (por qué existe — el problema que evita).
   - **Procedimiento** (cómo se aplica concretamente).
   - **Anti-patrones** (qué NO hacer que viola la regla).
6. Actualizar el índice en `workflow.md` y (si es domain-específica) el `applies.yaml` del artifact para engancharla a los steps donde aplica.
7. Reflejar la regla nueva en `CLAUDE.md` si necesita ser mandatoria a nivel global.

---

## Anti-patrones de esta carpeta

- ❌ Poner acá una regla que sólo aplica a un artifact específico — va a su carpeta `artifacts/<capa>/rules/`.
- ❌ Duplicar texto de una regla entre esta carpeta y una carpeta artifact — una regla vive UNA sola vez en el nivel correspondiente.
- ❌ Documentación general del flujo (eso va a `~/.fremi/framework/flows/`).
- ❌ Configuración parametrizable (eso va a `~/.fremi/framework/settings/` o al `config.*.yaml` del artifact).
- ❌ Decisiones técnicas del producto (eso va a `docs/works/product/decisions.md`).
