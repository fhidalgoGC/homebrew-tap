# `~/.fremi/framework/reverse-engineering/reverse-story/rules/` — Reglas del skill REVERSE-STORY

> Reglas operativas del skill `/fremi-reverse-story`. Gobiernan cuándo el skill
> pausa para pedir input, qué precondiciones abortan la ejecución, y qué reglas
> del framework aplican durante la reconstrucción de la cadena de story.

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact story + suma las reglas reverse (R25-R32) + stop events específicos del skill. |
| `stop-events.md` | Regla normativa de este skill: precondiciones que abortan, cuándo pausa (gaps no-inferibles), y limitación de Regla 29 (R8 inconstruible si hubo bugs previos). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact story

El artifact story tiene sus propias reglas en
`~/.fremi/framework/artifacts/story/rules/`. El skill reverse-story **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde código,
   tests y commits. Transparent por default. Preguntas dirigidas para gaps
   no-inferibles (So that, iniciativa, motivación ADR, RNFs, CAs sin test).

2. **Regla 29 explícita**: si durante la reconstrucción se detectan bugs previos ya
   fixeados, el skill declara la limitación (test rojo no reconstruible) y recomienda
   `/fremi-reverse-bug`. En forward es un requisito; en reverse es un gap declarado.

---

## Relación con el pipeline equivalente

El pipeline `/fremi-pipeline-reverse-story` orquesta múltiples invocaciones del skill
`/fremi-reverse-story` (y otros). Sus reglas viven en:
`~/.fremi/framework/pipelines/reverse-story/rules/`

Los stop events del skill son un subconjunto de los del pipeline — el pipeline
además coordina la secuencia entre skills.
