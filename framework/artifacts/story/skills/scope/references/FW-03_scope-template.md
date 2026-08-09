# Template — `{workflow.scope}` de una story

> **Para qué:** acotar la story con listas explícitas de qué entra y qué queda fuera, más las dependencias externas.
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo).
> **Rol del archivo:** **limita** la story. Sin scope explícito, los escenarios BDD se expanden sin control (Regla 6.1).
> **Antes de:** `{workflow.bdd}`. La spec del scope ACOTA los escenarios.
> **Sin TBDs.** Si no podés decidir si algo está in o out, decidilo ahora — no lo arrastres a BDD.

---

```markdown
---
version: 1.0.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: snapshot
ancestor:
  id: {feature_id}
  version_at_creation: "<versión actual de FT-XX/definition.md>"
  version_at_closure: null
---

# Scope de la story

## In-scope

> Lista concreta y observable de qué entra. Cada bullet debe poder traducirse en al menos un escenario BDD.

- <ítem in-scope 1>
- <ítem in-scope 2>
- <ítem in-scope 3>

## Out-of-scope

> Lo que la story explícitamente **NO** incluye. Útil para evitar que el lector asuma. Mencionar también qué story / feature CONTIENE esas piezas (si aplica).

- <ítem out-of-scope 1> — <vive en HU-XX o FT-YY si aplica>
- <ítem out-of-scope 2>

## Dependencias

> Otras stories, features, o requisitos externos que esta story consume o asume listos.

- **De otras stories:** <HU-XX de FT-YY> — <qué provee>
- **De features:** <FT-XX> — <qué provee>
- **Externas:** <ej: "Servicio GraphQL del backend principal listo y accesible">

## Supuestos

> Lo que esta story asume como verdadero al arrancar. Si un supuesto no se cumple, la story no se puede ejecutar.

- <supuesto 1>
- <supuesto 2>
```

---

## Reglas de uso

1. **Listas, no prosa.** El scope se decide bullet por bullet. Si un bullet es ambiguo ("manejar usuarios"), partilo.
2. **Out-of-scope explícito.** No basta omitir cosas; nombralas. La omisión silenciosa es la principal fuente de scope creep.
3. **Toda dependencia debe existir.** Si dependés de `HU-XX` y no existe todavía → o la creás primero, o esta story arranca bloqueada (declarar el bloqueo en `{workflow.plan}`).
4. **Sync-back de restricciones (Regla 12).** Si al escribir scope aparece una restricción que aplica a varias stories → mover a `feature/definition.md` o `product/definition.md`.
5. **Supuestos vs dependencias:** una dependencia es algo que existe en el sistema (otra story, otro servicio). Un supuesto es una condición del entorno (ej: "el cliente puede leer JSON").
