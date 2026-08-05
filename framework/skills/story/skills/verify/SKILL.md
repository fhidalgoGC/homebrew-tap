---
name: fremi-story-verify
description: Ejecuta la fase `verify` de un artifact — corre test_runner, type_checker y coverage declarados en `docs/frmwk/settings/config.yaml`, emite verdict (PASS / PASS WITH WARNINGS / FAIL) y clasifica issues residuales (CRITICAL / WARNING / SUGGESTION). Gate obligatorio antes de firmar closure de story/enabler. NO ejecuta tests durante desarrollo (eso es Regla 7 TDD en cada task); esta skill es la corrida FINAL antes del cierre. Genérico — lee todo del config.yaml, no hardcodea comandos.
---

# /fremi-story-verify — Corrida final de verificación (fase verify)

Este skill ejecuta la fase **`verify`** de un artifact (story o enabler). Es el **gate técnico** que debe pasar antes de firmar closure (Regla 11 + `phase_rules.closure` precondición).

**No corre tests en desarrollo** — eso es responsabilidad de cada task (Regla 7 TDD, rojo → verde → refactor). `/fremi-story-verify` es la **corrida final completa** que emite verdict.

---

## Sintaxis

```
/fremi-story-verify <FEATURE_ID> <STORY_ID>
/fremi-story-verify <FEATURE_ID> <STORY_ID>_<enabler_id>   (para enabler dentro de story)
/fremi-story-verify enabler <EN_ID>                        (para enabler global)
```

Si el usuario invoca `/fremi-story-verify` sin args y hay una story en curso (con `FW-09_checkwork.md` cerca de 100%), asumir esa story.

---

## Cuándo invocarlo

- **Obligatorio** antes de `/fremi-story-closure-check` — el closure precondiciona un verify con verdict PASS o PASS WITH WARNINGS (aceptadas).
- Cuando `FW-09_checkwork.md` muestra 100% de tasks cerradas.
- Después de cualquier cambio significativo post-implementación (fix, refactor, warning fixed).
- El usuario dice "ya está listo", "correr tests", "verify de esta story", "check final".

**No usar** para tests individuales durante desarrollo — usar `npm test <archivo>` directamente en ese caso.

---

## Procedimiento

### Paso 0 — Cargar configuración (OBLIGATORIO)

1. Leer `docs/frmwk/settings/config.yaml`.
2. Extraer:
   - `testing.strict_tdd`, `testing.test_runner`, `testing.type_checker`.
   - `testing.unit.enabled + command + framework`.
   - `testing.integration.enabled + command`.
   - `testing.e2e.enabled + command`.
   - `testing.coverage.enabled + command + threshold`.
   - `phase_rules.verify` — reglas obligatorias de la fase.
3. Leer `docs/frmwk/settings/methodology.json`:
   - `identifiers.workflow_doc.items[name=checkwork]` — filename del checkwork.
   - `identifiers.workflow_doc.items[name=closure]` — filename del closure.

Si algún archivo no parsea → abortar.

### Paso 1 — Precondiciones

1. `FW-09_checkwork.md` (o filename resuelto) del artifact debe existir.
2. Verificar que checkwork indica **100% de tasks cerradas** (todas en `## ✅ Listo`, ninguna en `## 🚧 En curso` o `## ⬜ Pendiente`).
3. Si NO está al 100% → abortar y sugerir cerrar tasks pendientes primero. `/fremi-story-verify` es final, no intermedio.

### Paso 2 — Correr las verificaciones declaradas en config.yaml

Ejecutar en orden, capturando exit code y output de cada uno:

#### 2.1 Type check
```bash
{testing.type_checker}
```
- **Exit 0 en scope del cambio** → OK.
- **Errores pre-existentes fuera del scope** → WARNING (documentar cuáles).
- **Errores nuevos en scope** → CRITICAL.

#### 2.2 Test runner (obligatorio)
```bash
{testing.test_runner}
```
- **Todos verdes** → OK.
- **Cualquier test rojo** → CRITICAL. Abortar corrida acá y reportar.

#### 2.3 Unit tests (si `testing.unit.enabled`)
```bash
{testing.unit.command}
```
Reportar counts (passed / failed / skipped).

#### 2.4 Integration tests (si `testing.integration.enabled`)
```bash
{testing.integration.command}
```

#### 2.5 E2E tests (si `testing.e2e.enabled`)
```bash
{testing.e2e.command}
```

#### 2.6 Coverage (si `testing.coverage.enabled`)
```bash
{testing.coverage.command}
```
- Extraer % total y comparar con `testing.coverage.threshold`.
- **>= threshold** → OK.
- **< threshold** → WARNING (a menos que sea trivial < 5% bajo el umbral, entonces SUGGESTION).

### Paso 3 — Clasificar issues

Recolectar todos los hallazgos y clasificar según `phase_rules.verify`:

- **CRITICAL** (bloquea closure):
  - Test rojo.
  - Type error en scope.
  - Bug detectado durante la corrida.
- **WARNING** (aceptable con justificación):
  - Coverage debajo de threshold.
  - Type error pre-existente fuera de scope.
  - Test skip/xfail.
- **SUGGESTION** (no bloquea):
  - Coverage marginalmente bajo.
  - Deprecation warnings.
  - Tests lentos.

### Paso 4 — Emitir Verdict

- **PASS**: 0 CRITICAL, 0 WARNING.
- **PASS WITH WARNINGS**: 0 CRITICAL, N WARNING (N pequeño, cada uno con justificación aceptable).
- **FAIL**: ≥ 1 CRITICAL.

### Paso 5 — Escribir reporte

El reporte va a la sección **"Última corrida de `verify`"** dentro de `FW-09_checkwork.md` del artifact. **NO** se crea un `FW-XX_verify-report.md` dedicado (v3: `config.story.yaml → verify_phase.dedicated_doc = false`).

**Regla 17 — Bump del checkwork (living)**: escribir el reporte de verify dispara **PATCH** en el `FW-09_checkwork.md` (el reporte no cambia el contrato, sólo registra evidencia). Actualizar `last_updated` en frontmatter y agregar entry al changelog:
```
- **v<nueva>** — YYYY-MM-DD — Reporte de verify: <VERDICT>. [origen: /fremi-story-verify]
```

**Cargar el template canónico** de `docs/frmwk/skills/verify/references/verify-report-block-template.md` y rellenarlo con:
- Timestamp real de la corrida.
- Comandos ejecutados y resultados (exit codes reales, no adornados).
- Verdict calculado (PASS / PASS WITH WARNINGS / FAIL).
- Issues clasificados en CRITICAL / WARNING / SUGGESTION.

Si `FW-09_checkwork.md` no existe (caso raro) → crearlo con el bloque como sección única + placeholder para el resto (`## Estado general`, `## ✅ Listo`, etc.).

### Paso 6 — Reportar al usuario

- **Verdict final** (PASS / PASS WITH WARNINGS / FAIL) grande y claro.
- Resumen de counts (tests, errores, coverage).
- Lista de issues por severidad.
- Próximo paso:
  - Si PASS → `/fremi-story-closure-check` para auditar trazabilidad y firmar closure.
  - Si PASS WITH WARNINGS → confirmar con usuario si acepta warnings, después `/fremi-story-closure-check`.
  - Si FAIL → volver a implementación, fixear CRITICAL, re-invocar `/fremi-story-verify`.

---

## Validaciones

- `config.yaml` debe declarar al menos `testing.test_runner` y `testing.type_checker`. Si no → abortar y avisar al usuario.
- Precondición checkwork 100% — no ejecutar sin eso.
- **NO se marca la sección "Última corrida de verify" con PASS si algún test falló** — respetar exit codes reales, no adornar el reporte.

---

## Anti-patrones

- ❌ Marcar PASS cuando algún test falló ("es un edge case, no importa"). Si es aceptable, es WARNING con justificación; no PASS.
- ❌ Correr `/fremi-story-verify` cuando el checkwork tiene tasks abiertas — no es una corrida intermedia.
- ❌ Hardcodear comandos (ej: `npm test`) — leer siempre de `config.yaml → testing.*`.
- ❌ Escribir un `FW-XX_verify-report.md` dedicado — el config declara `dedicated_doc: false`, el reporte va dentro de checkwork.
- ❌ Auto-aceptar WARNINGS sin justificación explícita del usuario.
- ❌ Correr `/fremi-story-verify` para tests individuales durante desarrollo — usar `npm test <archivo>` directo.

---

## Referencias

- Template local del bloque de reporte: [`references/verify-report-block-template.md`](references/verify-report-block-template.md)
- `docs/frmwk/settings/config.yaml` → `testing.*`, `phase_rules.verify`, `phase_rules.closure` (precondición).
- `docs/frmwk/rules/workflow.md` → Regla 7 (TDD durante desarrollo), Regla 11 (closure precondiciona verify).
- Skill `/fremi-story-closure-check` — corre después de `/fremi-story-verify` PASS.
