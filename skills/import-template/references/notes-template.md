# Template — `notes.md` (para uso de `/fremi-import-template`)

Doc de investigación #7 de 7. Cierra el paquete de importación. Captura decisiones que el template encarna, gotchas, cosas raras y TODOs pendientes del código importado.

```markdown
# Notes — <nombre del template>

## Decisiones técnicas que el template encarna

<Cada decisión notable del template que un usuario del template debería saber. Formato similar a un ADR corto: qué se decidió, por qué se ve así en el código.>

- **<decisión 1>**: <descripción + evidencia en código>
- **<decisión 2>**: <descripción + evidencia>
- ...

## Convenciones de naming detectadas

<Convenciones que NO están declaradas explícitamente pero se detectan al leer el código. Ej: "todos los tipos exportados usan PascalCase, las variables `snake_case` sólo aparecen en tests".>

- <convención 1>
- <convención 2>

## Gotchas / cosas raras

<Cosas que sorprenden al lector nuevo del template. Puede ser un workaround, una convención contraintuitiva, un imports orden importante, etc.>

- **<gotcha 1>**: <qué, dónde, por qué>
- **<gotcha 2>**: <qué, dónde, por qué>

## Archivos sospechosos / a revisar manualmente

<Archivos que copiamos pero merecen revisión antes de usar en producción. Ej: `.env` con valores placeholder, archivos con secretos, configs específicas a otro entorno.>

- `<path>`: <por qué merece revisión>

## TODOs explícitos en el código del template

<Comentarios `TODO`, `FIXME`, `XXX`, `HACK` que se encontraron durante la lectura. No los resolvemos — sólo los reportamos.>

- `<path>:<línea>` — <texto del TODO>

## Consideraciones para adopción en el proyecto destino

<Qué habría que hacer al usar este template como referencia en el proyecto destino:>
- <ej: "Si vas a usar el patrón X, necesitás instalar la lib Y">
- <ej: "El template asume un entorno con AWS SSO configurado">
- <ej: "Ciertas convenciones (naming Z) conflictan con la nuestra — evaluar antes de adoptar">

## Preguntas abiertas

<Cosas que no pudimos determinar leyendo el código y quedan como duda. Ej: "¿El logger de X hace flush al terminar la request? No queda claro del código.">

- [ ] <pregunta 1>
- [ ] <pregunta 2>
```
