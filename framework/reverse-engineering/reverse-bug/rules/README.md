# `~/.fremi/framework/reverse-engineering/reverse-bug/rules/` — Reglas del skill REVERSE-BUG

> Reglas operativas del skill `/fremi-reverse-bug`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de un doc de bug.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact scope (story o feature) + suma las reglas reverse (R25-R32). Documenta el scope variable y la regla R29 siempre activa. |
| `stop-events.md` | Regla normativa de este skill: precondiciones que abortan, cuándo pausa (síntoma, severidad, root-cause no inferibles, scope ambiguo), y declaración obligatoria de Regla 29. |
| `README.md` | Este archivo. |

---

## Regla 29 — Siempre declarada, no es un stop event

**Regla 29 (test rojo inconstruible) NO es un stop event** — es una limitación
estructural del reverse de bugs que el skill declara siempre en el doc resultado.
No pausa para preguntar: simplemente documenta en la sección `reproduction-red-test`:
"Regla 8 es inconstruible retroactivamente."

El stop event relacionado sí existe: si el comportamiento que el fix corrige
**no está especificado en ninguna story**, entonces no es bug → es gap de spec.
Ese sí pausa al usuario.

---

## Scope variable (story vs feature)

A diferencia de skills como reverse-story o reverse-product que tienen scope fijo,
`reverse-bug` opera en 2 scopes según el argumento:

- **Story-scoped**: bug atribuible a una story concreta.
- **Feature-scoped**: bug transversal a varias stories de la feature.

El `applies.yaml` documenta ambas opciones de `artifact_applies` que pueden heredarse.

---

## Sin pipeline equivalente

No existe un pipeline `/fremi-pipeline-reverse-bug` — el doc de bug es un único archivo
y se invoca el skill directamente. El skill es el procedimiento completo.
