# `~/.fremi/framework/reverse-engineering/reverse-extra/rules/` — Reglas del skill REVERSE-EXTRA

> Reglas operativas del skill `/fremi-reverse-extra`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de un doc extra.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact extra + suma las reglas reverse (R25-R32). |
| `stop-events.md` | Regla normativa de este skill: precondiciones que abortan, cuándo pausa (cohesión, justificación de extra, validación vs story/enabler). |
| `README.md` | Este archivo. |

---

## Extra: único artifact sin skill de forward

A diferencia de story, feature, enabler y bug — `extra` no tiene skills de forward
(`config.extra.yaml → flow.sequence: []`). La única forma programática de crear un doc
extra es vía `/fremi-reverse-extra`. Esto hace que este skill sea ligeramente especial:

- No tiene "equivalente forward" al que referirse.
- La validación de que el trabajo es genuinamente extra (Regla 14) es más crítica aquí
  porque no existe un guardrail del flow para prevenirlo.

---

## Sin pipeline equivalente y sin carpeta `references/`

No existe un pipeline `/fremi-pipeline-reverse-extra` — el doc extra es un único archivo.
El skill tampoco tiene carpeta `references/` (el template del doc extra no requiere
un template complejo — es una estructura libre dentro de las 6 secciones de Regla 14).
