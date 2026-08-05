# Template — `BG-XX_<slug>.md` de un bug

> **Para qué:** registrar un defecto detectado en código de producción asociado a una story específica.
> **Usado por:** `/fremi-story-bug`, Paso 4 (crear archivo).
> **Placeholders:** `{bug_id}`, `{slug}`, `{feature_id}`, `{story_id}` se reemplazan con los valores derivados.
> **Rol del archivo:** capturar síntoma, repro, causa raíz, fix y cierre — todo en un solo archivo. NO necesita BDD/SDD/Design/TDD separados como una story porque el comportamiento esperado ya está especificado **en la story que originó el bug**.
> **Regla 8 aplica:** el test de reproducción es obligatorio y va ANTES del fix.

---

```markdown
# Bug: <título corto descriptivo> (`{feature_id}_{story_id}_{bug_id}`)

**Reportado:** <YYYY-MM-DD>
**Reportado por:** <usuario / sistema / monitoreo>
**Severidad:** <Crítica | Alta | Media | Baja>
**Estado:** Abierto

## Síntoma observado

<Qué hace mal el sistema en lenguaje observable. Foco en el "qué", no en el "porqué".>

Ejemplo:
> El endpoint `POST /reports/render` devuelve `500 Internal Server Error` cuando el body multipart NO incluye el campo `html`. Se espera `400 Bad Request` con detalle del campo faltante (ver `FW-05_sdd-spec.md` de HU-02).

## Impacto y severidad

- **Frecuencia:** <esporádico | reproducible siempre | sólo en X% de casos>
- **Usuarios afectados:** <cuántos / qué cohorte>
- **Funcionalidad bloqueada:** <qué deja de funcionar>
- **Workaround temporal:** <hay alguno? si no, decirlo>
- **Justificación de severidad:** <2-3 líneas>

## Reproducción

> Pasos concretos para reproducir el bug. Si no podés repro, el bug todavía no está caracterizado — el "fix" sería un parche al azar.

```
1. <paso 1 — ej: invocar curl con payload X>
2. <paso 2 — ej: observar output>
3. <paso 3>
```

**Entorno donde se reprodujo:** <dev / staging / prod / commit-sha / Node version / etc.>

## Test rojo (Regla 8)

> El test que reproduce el bug DEBE existir y DEBE fallar antes del fix.

- **Test añadido en:** `<path/al/test.spec.ts::nombre del test>`
- **Comportamiento esperado:** <qué debería pasar — debe alinearse con la spec de la story que originó el bug>
- **Comportamiento actual:** <qué pasa, idéntico al síntoma>
- **Cómo correrlo:** `<comando>`
- **Estado del test al crearlo:** [ ] rojo (falla) → [ ] verde después del fix

> Si la story que originó el bug NO tenía el caso cubierto en `FW-07_tdd-plan.md`, **también** sumar el TC-XXX correspondiente en ese plan. Regla 8 + Regla 10 (los docs son fuente de verdad).

## Causa raíz

<Análisis del por qué. Una línea no alcanza — explicar el mecanismo.>

Ejemplo:
> El middleware `validateMultipartBody` aplica el schema Zod sobre `req.body` antes de parsear las parts del multipart. Para multipart, `req.body` viene `undefined` hasta que el parser corre, así que el schema rechaza con `path[]` sin entender que es un parsing issue, no un validation issue. El handler termina lanzando una excepción genérica que se convierte en 500.

## Fix aplicado

- **Archivos modificados:** <lista de paths>
- **Cambio puntual:** <qué se modificó>
- **¿Cambia la spec de la story?**
  - [ ] No (el bug era una desviación accidental del spec)
  - [ ] Sí — actualizar `FW-05_sdd-spec.md` de `{story_id}` + ADR (Regla 10)

## Vinculaciones

- **Story que originó el bug:** `{feature_id}_{story_id}` (esta story queda parcialmente reabierta hasta que el fix se mergee — actualizar `FW-09_checkwork.md`).
- **ADRs aplicables:** <ninguno / ADR-XXX>
- **Otros bugs relacionados:** <BG-XX, si hay patrón>
- **Release / hotfix:** <versión / tag / fecha de deploy>

## Cierre

- **Fecha de fix:** <YYYY-MM-DD>
- **Fecha de deploy:** <YYYY-MM-DD>
- **Verificación post-deploy:** <comando / link / output>
- **DoD:**
  - [ ] Test de reproducción pasa (verde).
  - [ ] Toda la suite de la story afectada sigue verde.
  - [ ] Sin regresiones en stories vinculadas.
  - [ ] `FW-09_checkwork.md` de `{story_id}` reflejó el ciclo (bug abierto → fix → cierre).
  - [ ] Si hubo cambio de spec → actualización + ADR registrados.
- **Sign-off:** <nombre> · <fecha>

## Aprendizajes

> Optional pero recomendado. Lo que descubrimos del bug que podría evitar el próximo similar.

- <hallazgo + acción>
- <hallazgo + acción>
```

---

## Reglas de uso

1. **Un bug = un archivo.** Síntomas distintos = bugs distintos, aunque la causa raíz sea la misma (se vinculan entre sí en § Vinculaciones).
2. **Sin repro, no se trabaja.** Si no podés reproducir, el bug todavía está en estado "reporte" — no se crea el `BG-XX` hasta caracterizarlo.
3. **Test rojo PRIMERO** (Regla 8). El fix sin test es prohibido — sin test no hay forma de saber si la regresión vuelve.
4. **Severidad explícita.** "Crítica" implica que se trabaja antes que cualquier feature en curso.
5. **Vinculación obligatoria a una story.** Si no hay story que cubra ese comportamiento → crear/extender la story primero (Regla 8). El bug "vive" dentro de la story.
6. **Cambio de spec → ADR** (Regla 10). Si el comportamiento esperado descrito en `FW-05_sdd-spec.md` de la story estaba mal y el fix lo cambia, eso es una decisión de producto/diseño que merece registro.
7. **Sin cierre, el bug sigue abierto.** Igual que la Regla 11 con las stories — el DoD del bug es checklist con evidencia.
