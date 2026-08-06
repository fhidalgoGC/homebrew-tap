# Template — RULE (para uso de `/fremi-tools rule <name>`)

Este template arma el archivo inicial de una regla específica de proyecto (bajo `docs/project/rules/<name>.md`). Se rellena reemplazando placeholders.

```markdown
# Regla — <título corto que diga qué impone o prohíbe>

**Aplica a:** <archivos / módulos / etapas del flujo donde se aplica>
**Tipo:** obligatoria / recomendada
**Fecha de alta:** YYYY-MM-DD

## Qué impone (o prohíbe)

<En una o dos líneas, qué dice esta regla.>

## Justificación

<Por qué existe — qué problema evita, qué incidente la motivó, qué decisión la sostiene. Si la regla viene de un ADR, referenciarlo: "Aplica ADR-XXX".>

## Procedimiento

<Cómo se aplica concretamente. Paso a paso si hace falta.>

## Anti-patrones (lo que NO hacer que viola la regla)

- <Anti-patrón 1>
- <Anti-patrón 2>

## Excepciones

<Si hay casos donde la regla no aplica, listarlos. Si no hay → "Ninguna.">

## Cómo verificar cumplimiento

<Comando, test, audit que confirma que la regla se cumple. Si no hay verificación automatizable → describir cómo se revisa manualmente.>
```
