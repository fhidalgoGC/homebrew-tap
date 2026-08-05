# Template — `planteamiento.md` (living)

> **Para qué:** estructura del archivo `docs/works/product/planteamiento.md`. Es el **framing del problema** + el **approach elegido** entre las ideas de `ideas.md`.
> **Usado por:** `/fremi-product-planteamiento`, Paso 3 (caso "iniciativas+ideas listos, planteamiento vacío").
> **Placeholders:** entre `<...>`.
> **Tipo (Regla 17):** **living** — bumpea versión cuando el framing / approach evoluciona.
> **Rol:** acá se **cierra el espacio de soluciones**. Es la decisión que conecta `iniciativas.md` + `ideas.md` con el siguiente paso (`definition.md`).

---

## Estructura del archivo

```markdown
---
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: living
ancestor:
  id: product
  version_at_creation: "<versión de ideas.md al momento>"
---

# Planteamiento del problema y approach

> Framing del problema, decisión de approach, y justificación contra las ideas descartadas. Este archivo **cierra el discovery** y habilita la formalización del producto (`definition.md`).

## Framing

- **Problema concreto:** <qué problema preciso vamos a resolver — más estrecho que la iniciativa, más amplio que una feature>
- **Usuarios afectados:** <quiénes son los usuarios primarios y secundarios>
- **Contexto / restricciones:** <restricciones técnicas, de negocio, regulatorias, de timing>
- **Por qué ahora:** <qué oportunidad/urgencia lo dispara — la respuesta a "por qué no esperar 6 meses">

## Approach elegido

- **Enfoque:** <referencia a `Idea: <título>` de ideas.md — copiar el título exacto>
- **Resumen del approach:** <3-5 líneas. Cómo aborda el problema, qué decisiones generales involucra (sin entrar en tech specifics — eso es ADR).>
- **Por qué este enfoque:** <justificación contra las ideas descartadas. Mencionar al menos 2 alternativas y por qué se descartaron.>

## Ideas descartadas

- **Idea: <título>**
  - **Por qué no:** <razón concreta — restricción, costo, riesgo, incompatibilidad>
- **Idea: <título>**
  - **Por qué no:** <razón>

## Restricciones del approach

- <restricciones que este enfoque IMPONE — útil para que la capa feature/story las herede>
- <ej: "el approach asume Lambda como modelo de ejecución → cold starts aceptados, 15 min máx de runtime">

## Capacidades necesarias

- <qué capacidades de alto nivel el approach requiere — alimenta In-scope de `definition.md`>

## Riesgos identificados

- <riesgo 1 + mitigación o aceptación consciente>
- <riesgo 2>

## Siguiente paso

- Avanzar a formalización: completar `definition.md` con In-scope/Out-of-scope/Glosario/Restricciones derivados de este planteamiento.
- Si surgen decisiones técnicas con 2+ opciones viables al pasar a `definition.md` o feature → `/fremi-product-adr` o `/fremi-feature-adr` (Regla 3b).

## Changelog

- **v0.1.0** — YYYY-MM-DD — Doc creado. Framing y approach inicial elegido. [origen: usuario]
```

---

## Reglas de uso

1. **Una decisión, no inventario.** Este archivo elige. Si no podés escribir "Approach elegido" con una sola opción y justificación → todavía no estás listo, volvé a `ideas.md`.
2. **Justificación contra alternativas explícita.** No basta decir "elegimos X porque es mejor"; hay que decir contra qué se compara y qué se sacrifica.
3. **Restricciones heredables.** Lo que escribas en "Restricciones del approach" se va a propagar a feature/story — sé preciso.
4. **No es un ADR.** ADR registra decisiones técnicas entre alternativas concretas (librería, protocolo, esquema). `planteamiento.md` registra el **approach general**. Si el approach implica decisiones técnicas bifurcadas → cada una merece su ADR (Regla 3b).
