# `~/.fremi/framework/pipelines/reverse-story/rules/` — Reglas del pipeline REVERSE-STORY

> Reglas operativas del pipeline `/fremi-pipeline-reverse-story`. Gobiernan cuándo
> el pipeline PAUSA para pedir input, qué precondiciones abortan la ejecución, y qué
> reglas del framework aplican durante la reconstrucción de la cadena de story (11 docs; por default `FW-00..FW-10`).

---

## Qué contiene esta carpeta

| Archivo | Propósito |
|---|---|
| `applies.yaml` | Mapa de pointers: hereda el `applies.yaml` del artifact story + suma las reglas reverse (R25-R32) + stop events específicos del pipeline. |
| `stop-events.md` | Regla normativa de este pipeline: precondiciones que abortan, cuándo pausa (gaps no-inferibles, bifurcaciones técnicas, CAs contradictorios, Regla 29 para bugs). |
| `README.md` | Este archivo. |

---

## Diferencia con las reglas del artifact story

El artifact story tiene sus propias reglas en
`~/.fremi/framework/artifacts/story/rules/`. El pipeline reverse-story **hereda** esas
reglas y las **extiende** con:

1. **Rules reverse específicas (R25-R32)**: gobiernan la reconstrucción desde código, tests y
   commits. Transparent por default. Preguntas dirigidas para gaps no-inferibles (So that,
   motivación ADR, RNFs, CAs sin test).

2. **Regla 29 explícita**: si durante la reconstrucción se detectan bugs previos ya fixeados,
   el pipeline declara la limitación (test rojo no reconstruible retroactivamente) y recomienda
   `/fremi-reverse-bug`. Esta es la única regla del artifact story que tiene comportamiento
   diferente en reverse: en forward es un requisito; en reverse es un gap declarado.

---

## Cómo se cargan estas reglas

El hook `hooks/check-pipeline-preconditions.sh` verifica las precondiciones duras al detectar
una invocación de `/fremi-pipeline-reverse-story` en el prompt. El orquestador (la IA) carga
`applies.yaml` al arrancar el pipeline para resolver qué reglas están activas.

---

## Relación con otras carpetas de reglas

| Carpeta | Rol |
|---|---|
| `~/.fremi/framework/reverse-engineering/rules/reverse.md` | Reglas R25-R32 del régimen reverse. Fuente de verdad del comportamiento de reconstrucción. |
| `~/.fremi/framework/artifacts/story/rules/` | Reglas domain-específicas del artifact story. Este pipeline las **hereda**. |
| `~/.fremi/framework/pipelines/reverse-story/rules/` | Reglas propias de este pipeline (esta carpeta). |
