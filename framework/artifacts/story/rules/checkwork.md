# Regla de mantenimiento vivo del doc `checkwork` (dominio STORY)

> **Regla obligatoria 13.** El doc `checkwork` captura el estado en vivo de la story (qué está listo, qué en curso, qué falta). Es el único doc del workflow story que se actualiza durante la implementación.
>
> **Alcance:** esta regla es DOMAIN-específica de `story/`. Feature y product tienen sus propios docs living con reglas propias.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`plan`, `checkwork`, etc.) para referirse a los docs del workflow. El filename real se resuelve vía `~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md`.

---

## Regla 13 — El doc `checkwork` se mantiene al día durante la implementación

El doc `checkwork` es el que captura el **estado en vivo** de la story (qué está listo, qué en curso, qué falta). Es el único doc del workflow story que se actualiza durante la implementación — los demás (`definition`, `scope`, `bdd`, `sdd`, `design`, `tdd`, `plan`) se escriben una vez y se referencian.

### Cuándo actualizarlo

**Obligatorio** (la story queda incoherente si no se hace):

1. **Al cerrar una task** (cambia de `[ ]` o `[/]` a `[x]` en el doc `plan`):
   - Moverla a la sección `## ✅ Listo` con fecha de cierre.
   - Actualizar el % progreso.
   - Marcar los archivos / tests que esa task agregó en sus secciones.

2. **Al arrancar una task** (cambia de `[ ]` a `[/]`):
   - Moverla a `## 🚧 En curso` con fecha de inicio.
   - Listar los criterios de detección de completitud pendientes.

3. **Al descubrir un bloqueo o un TBD nuevo**:
   - Agregarlo a `## ❓ Decisiones pendientes / bloqueos`.
   - Si bloquea una task en curso, marcar la task como bloqueada.

**Opcional / automatizable:**

- Cambio de criterio de aceptación cubierto (cuando un test nuevo lo verifica) → marcar `✅` en la tabla de cobertura.
- Archivos nuevos creados → agregar a `## Archivos implementados`.

### Quién lo actualiza

- **Por default:** el agente (Claude / humano) que cierra la task lo actualiza en el mismo paso que marca `[x]` en el doc `plan`.
- **Opcional:** un hook en `~/.fremi/framework/artifacts/story/hooks/sync-checkwork.sh` puede observar cambios en el doc `plan` y sincronizar checkwork automáticamente. Está disponible como stub; el usuario decide si lo activa en `.claude/settings.json`. **El hook no exime del paso manual** — si el hook falla, la regla sigue aplicando.

### Cuándo NO se actualiza

- Refactor interno que no avanza ninguna task ni cubre ningún CA.
- Cambios de docs (`bdd`/`sdd`/`design`) — esos viven en sus archivos. `checkwork` sólo refleja progreso de implementación, no cambios de spec.
- Edición de comentarios / formatting de código sin tocar lógica.

### Anti-patrones a evitar

- ❌ Marcar una task como `[x]` en el doc `plan` sin moverla en el doc `checkwork` — checkwork queda obsoleto.
- ❌ "Lo actualizo al final" — el día del closure se descubre que no se sabe qué falta porque nadie llevó el seguimiento.
- ❌ Confiar 100% en el hook sin validar — si el hook tiene un bug, la divergencia es silenciosa.
- ❌ Marcar `✅` en una task sin que su comando de detección retorne exit 0 (eso es la Regla 7b — ver `tdd.md` en este mismo dominio).

### El doc `plan` NO se reemplaza por `checkwork`

Los docs `plan` y `checkwork` son distintos:
- **`plan`** = el plan tal como se diseñó. Estable, referenciable. Se edita sólo si el plan **cambia** (nueva task descubierta, una task se subdivide, etc.).
- **`checkwork`** = el estado actual. Cambia constantemente durante la implementación.

Nunca borrar el doc `plan` ni reemplazarlo por el doc `checkwork`.
