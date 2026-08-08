# Template — `FW-00_explore.md` de una story

> **Doc CONDICIONAL.** Obligatorio cuando aplica al menos uno de los criterios declarados en `~/.fremi/framework/settings/config.core.yaml → conditional_rules.explore_when`. Omitir si no aplica (no crear placeholder vacío).
>
> **Propósito**: investigar el terreno ANTES de escribir el `FW-01_definition.md`. Documenta contexto real del codebase, alternativas técnicas encontradas, y hallazgos que van a informar la definition y la (eventual) proposal. **NO propone solución elegida** — sólo mapea el terreno.
>
> **Regla de frontera**: si el explore ya "elige" un camino técnico, ese contenido pertenece al `FW-02_proposal.md`, no acá.

---

# Explore — {feature_id} / {story_id} — <título de la story>

**Fecha**: <YYYY-MM-DD>
**Trigger**: <qué criterio de `explore_when` disparó este doc>

---

## 1. Contexto observado en el codebase

<qué está hoy en el proyecto que se relaciona con esta story. Referenciar archivo:línea concreto>

- `src/functions/<X>/…:LN` — <qué hace hoy>
- `src/libs/<Y>.ts:LN` — <qué provee>
- Convenciones que aplican (referenciar `~/.fremi/framework/rules/*` o `docs/project/rules/*` si aplica).

## 2. Actores externos relevantes

<APIs, servicios, bases de datos, librerías que la story va a tocar o consumir>

| Actor | Rol | Referencia |
|---|---|---|
| <ej: AWS Lambda> | <runtime del endpoint> | <link a AWS docs> |

## 3. Alternativas técnicas identificadas

<listar los enfoques viables. Cada uno con pros/contras. NO elegir todavía — la elección va en `FW-02_proposal.md` (Regla 3b).>

### Opción A — <nombre corto>
- **Cómo**: <descripción breve>
- **Pros**: …
- **Contras**: …

### Opción B — <nombre corto>
- **Cómo**: <descripción breve>
- **Pros**: …
- **Contras**: …

### Opción C — <opcional>
- …

## 4. Hallazgos y sorpresas

<gotchas, edge cases o cosas que no eran obvias del código hasta explorarlo>

- <hallazgo 1>
- <hallazgo 2>

## 5. Preguntas abiertas al usuario/producto

<lo que no se puede resolver sin decisión del PM / usuario final>

- [ ] <pregunta 1>
- [ ] <pregunta 2>

## 6. Impacto en la proposal

<qué de este explore condiciona lo que va a decidirse en el `FW-02_proposal.md`. Ej: "descarta X porque requiere migrar Y", "abre la opción Z que no era obvia">

- <bullet 1>
- <bullet 2>

## 7. Referencias

- Archivos consultados: <lista>
- Docs externos: <lista>
- ADRs vigentes relevantes: <ADR-XXX, ADR-YYY>
