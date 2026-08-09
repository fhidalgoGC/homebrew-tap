# Template — `{enabler.definition}` de un enabler

> **Para qué:** describir qué capacidad técnica habilita este enabler, quién la necesita y por qué. Primer artefacto del workflow de enabler.
> **Usado por:** `/fremi-enabler`, Paso 4 (crear archivo).
> **Placeholders:** `{enabler_id}`, `{slug}` se reemplazan con los valores derivados; `<...>` con el contenido real.
> **Rol del archivo:** describe **qué se habilita y para quién**. NO describe comportamiento user-facing (eso son features/stories que dependen del enabler). NO describe el cómo técnico (eso es `{enabler.design}`).

---

```markdown
# Enabler: <título descriptivo> (`{enabler_id}_{slug}`)

**Alcance:** <global | feature `FT-XX` | story `FT-XX_HU-YY`>
**Tipo:** <plataforma | infraestructura | tooling habilitador | migración técnica | fundación de seguridad | otro>
**Estado:** en planificación

## Capacidad habilitada

<Una frase clara: "Este enabler habilita <X> para que <quién> pueda <Y>".>

Ejemplos:
- "Habilita Node 25 + npm 11 en el runtime Lambda para que las features F2 y F4 puedan usar `fetch` nativo y top-level await."
- "Habilita el layer Chromium en AWS Lambda para que HU-02 de FT-01 pueda renderizar PDFs sin levantar un servicio aparte."

## Vinculado a

> Qué features/stories del producto **dependen** o **se benefician** de este enabler. Sin al menos un vínculo, el enabler probablemente no es necesario.

- **`FT-XX`** — <feature que lo necesita, por qué>
- **`FT-YY_HU-ZZ`** — <story que lo necesita, por qué>
- Iniciativa `init-XXX` (opcional, si el enabler está justificado por iniciativa)

## Por qué AHORA

<¿Qué se desbloquea si lo hacemos? ¿Qué costos genera no hacerlo? 2-3 líneas.>

## Criterios de aceptación técnicos

> Cada criterio es **observable y verificable técnicamente**. NO son criterios de comportamiento user-facing (eso queda para las features/stories que consumen el enabler).

- **CA-001** — <ej: "el runtime Lambda corre Node 25.x al hacer `aws lambda get-function-configuration`">
- **CA-002** — <ej: "el script `npm run check:node` pasa y reporta versión ≥ 25">
- **CA-003** — <ej: "los tests de la feature FT-03 corren verde con el nuevo runtime">

## Restricciones

- **Compatibilidad backward:** <qué NO debe romper este enabler>
- **Ventana de cambio:** <hay cutover? rollback plan?>
- **Dependencias externas:** <librerías, servicios, equipos>

## Fuera de alcance (referencia)

> Lo que parece que podría caer acá pero NO. Para que un futuro lector no se confunda.

- <ej: "este enabler NO incluye la actualización de Node en CI — eso es EX-XX">
- <ej: "este enabler NO incluye refactor de los handlers para usar las nuevas APIs — cada feature lo decide">
```

---

## Reglas de uso

1. **Sin comportamiento user-facing.** Si lo que describís se observa desde el cliente del producto, es feature/story, no enabler.
2. **Vinculado a algo real.** Un enabler sin features/stories dependientes es trabajo sin justificación — revisar si no es `extra/` o feature directa.
3. **Criterios técnicos verificables.** No vale "queda Node 25 actualizado" — vale "comando X retorna versión Y".
4. **Alcance declarado.** El alcance (`global` / `feature` / `story`) determina la ubicación física del enabler — debe ser explícito en este doc.
5. **Sin TBDs.** Si no podés escribir la capacidad concreta que habilita → todavía no está madura.
