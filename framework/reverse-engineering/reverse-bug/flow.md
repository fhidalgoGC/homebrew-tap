---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-bug
  version_at_creation: null
---

# Flujo — Skill REVERSE-BUG (`/fremi-reverse-bug`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de reconstrucción.
> **Invocación / documentación:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — las 6 fases genéricas. Este skill las instancia para bugs ya fixeados.

Este documento describe la **narrativa del flujo** que el skill atraviesa cuando corre. Complementa `SKILL.md` (invocación, sintaxis) y `workflow.yaml` (secuencia machine-readable).

---

## ⚠️ Regla 29 — Primera clase en este skill

> **Regla 8 (test rojo primero) es INCONSTRUIBLE retroactivamente en reverse-bug.**

Esta no es una advertencia al pie. Es la restricción arquitectural que define todo el comportamiento de este skill.

Regla 8 exige: escribir primero un test que FALLA (test rojo), luego escribir el código que lo hace pasar (el fix). Una vez que el fix está mergeado, el código actual **pasa** todos los tests. **No existe forma programática de recrear el estado "código roto + test rojo"** sin revertir el fix, lo cual no es el propósito de este skill.

Lo que el skill SÍ puede hacer:
- Identificar el test que se agregó **junto con el fix** (valida el estado post-fix).
- Recomendar `git log --oneline -p <archivo>` para que el usuario recupere manualmente la versión pre-fix si necesita el test rojo.
- Sugerir agregar un **test de regresión** ahora (verifica que el bug no vuelva).

Lo que el skill NUNCA hace:
- Pretender que R8 se cumplió.
- Omitir la declaración R29 en la sección `reproduction-red-test`.
- Silenciar este gap en el reporte final.

**La declaración R29 aparece en dos lugares: el doc generado y el reporte final. Ambos son obligatorios.**

---

## Qué hace el skill

Reconstruye **1 archivo** (`{bug.filename}`, típicamente `BG-XX_<slug>.md`) a partir de un fix ya mergeado en código. Detecta el scope apropiado (story o feature) de los archivos tocados por el fix.

El doc reconstruido incluye: síntoma, impacto/severidad, reproducción (con declaración R29), root-cause, fix aplicado, vinculaciones y closure.

**Termina con el doc firmado, el padre bumpeado según el impacto del fix, y un reporte con el gap R29 declarado.** No modifica el código.

---

## Scope del bug

| Scope | Criterio | Ubicación del doc | Padre bumpeado |
|---|---|---|---|
| `story` | El fix toca archivos de una sola story | `FT-XX/user-stories/HU-YY/bugs/BG-XX_<slug>.md` | Story / feature según impacto |
| `feature` | El fix cruza múltiples stories de una feature | `FT-XX/bugs/BG-XX_<slug>.md` | Feature según impacto |

Scope ambiguo (fix cruza features o no encaja) → pausa y pregunta al usuario antes de asignar numeración.

---

## Arco narrativo

### 1. Descubrimiento — los artifacts del fix

El skill arranca identificando los commits del fix. El usuario puede proveer SHA directos, o el skill busca en `git log` por keywords (`fix:`, `bug:`, `hotfix:`).

Escanea en este orden:
1. `git show <commits> --stat` → archivos tocados, líneas cambiadas.
2. `git diff <commit_pre>..<commit_fix>` → qué se cambió específicamente.
3. Mensaje(s) del commit → pistas de síntoma y root-cause.
4. Test files nuevos o modificados en el fix → el test que valida el fix.
5. PR description / issue tracker (si accesible) → contexto adicional.

Si no hay commits identificables → el skill aborta. Sin historial git, no hay base de reconstrucción.

### 2. Inferencia — del diff al doc

Con el diff del fix, el skill mapea cada fragmento a una sección del doc:

| Fragmento del fix | Sección del doc |
|---|---|
| Mensaje del commit + diff | `fix-applied`: descripción del cambio + archivos + links a commits |
| Inferencia del diff (qué estaba mal antes) | `root-cause`: qué producía el bug (TBD si no inferible) |
| Test files agregados/modificados | `reproduction-red-test`: test de validación del fix (con declaración R29) |
| Archivos tocados → scope de impacto | `linkages`: stories afectadas + ADRs vigentes |
| Fecha del commit del fix | `closure`: fecha de cierre |

**Regla de oro de la inferencia de bugs**: el diff muestra QUÉ cambió, no POR QUÉ estaba mal. Root-cause puede ser la causa real (si el commit tiene suficiente contexto) o puede requerir confirmación del dev. El skill declara cuándo es inferencia vs. confirmado.

#### La sección `reproduction-red-test` — cómo debe quedar

Esta sección siempre comienza con la declaración R29:

```markdown
## Reproducción / test rojo

⚠️ REGLA 8 INCONSTRUIBLE RETROACTIVAMENTE (Regla 29)
El fix ya está aplicado. No existe test rojo previo en el historial —
el test listado a continuación valida el estado POST-FIX, no reproduce
el estado roto pre-fix.

Para intentar recuperar el estado pre-fix manualmente:
  git log --oneline -p <archivo-del-fix>
Luego revertir localmente el commit del fix para ejecutar el test
en el estado roto. Este esfuerzo es manual; no lo automatiza el skill.

Sugerencia: agregar un test de regresión ahora que garantice que el bug
no vuelve (valida estado post-fix, prevenible en CI/CD).

### Test identificado junto al fix

[tests agregados o modificados con el fix — con path + descripción]
```

Si no se identificó ningún test en el fix → la sección declara `no se identificó test de regresión` y recomienda agregarlo.

### 3. Preguntas dirigidas — gaps no inferibles (Regla 27)

El diff informa del cambio pero no necesariamente del contexto. Gaps típicos que requieren pregunta:

- **Síntoma** — "¿Qué se observaba antes del fix?" Si el commit tiene un mensaje descriptivo, puede ser suficiente. Si no → pregunta obligatoria.
- **Impacto / severidad** — frecuencia del bug, usuarios afectados, si fue bloqueante. No derivable del diff.
- **Root-cause confirmado** — el diff muestra el fix pero la causa raíz puede estar en otra capa. Preguntar al dev si está disponible.
- **CAs sin test** — si el bug afectaba criterios de aceptación de la story que no tenían test → reportar como gap.

**Lo que NO se pregunta**: si Regla 8 aplica. Siempre aplica. Siempre es inconstruible. La declaración R29 no es opcional ni negociable.

### 4. Timestamps y linaje (Regla 30)

El skill infiere fechas del fix via `git log`:

```bash
# Fecha del fix (last_updated y closure)
git log -1 --format="%ai" -- <fix-files>

# Fecha del primer commit del fix (created — si es multi-commit)
git log --format="%ai" -- <fix-files> | tail -1

# Versión del padre al momento del fix
git blame -- <parent-doc> | grep "^version:"
```

**Frontmatter del doc generado:**
```yaml
version: 1.0.0
created: <fecha del primer commit del fix>
last_updated: <fecha del commit del fix>
doc_type: snapshot
ancestor:
  id: <FT-XX/HU-YY o FT-XX>
  version_at_creation: <versión del padre al momento del fix>
  version_at_closure: <versión del padre post-fix>
reverse_engineered: true                        # modo transparent
reverse_engineered_at: 2026-08-11
reverse_engineered_source: git-history+diff
reverse_engineered_confidence: 0.75
```

Si no hay `.git`: pedir fecha del fix al usuario o usar "hoy" con `confidence: 0.3`.

### 5. Escritura + declaración R29 + bump del padre

Con toda la información, el skill escribe el `BG-XX_<slug>.md`:

**Modo `--transparent` (default):** el frontmatter incluye el bloque `reverse_engineered.*` completo.

**Modo `--stealth` (override explícito):** sin bloque `reverse_engineered.*`. Nota: stealth no elimina la declaración R29 de la sección `reproduction-red-test` — esa declaración es del contenido del doc, no del frontmatter.

**Bump del padre según impacto del fix:**

| Tipo de fix | Bump | Notas |
|---|---|---|
| Fix respetó el contrato (bug interno, sin cambio de interfaz) | PATCH | El comportamiento externo no cambió |
| Fix extendió el contrato (nueva respuesta, campo adicional) | MINOR | Contrato más amplio |
| Fix cambió el contrato (respuesta distinta, schema breaking) | MAJOR | Requiere R10 + ADR obligatorio |

---

## Stop events — dónde pausa el skill

Ver `workflow.yaml → stop_events` para el detalle machine-readable. Resumen narrativo:

1. **`r29_gap`** — SIEMPRE activo. Obliga a incluir la declaración R29 en `reproduction-red-test`. No detiene la ejecución pero hace fallar la fase si se omite.
2. **`scope_ambiguous`** — el fix cruza múltiples features o el scope story/feature no es claro. Pausa antes de asignar numeración.
3. **`symptom_not_inferrable`** — el commit y el diff no describen el síntoma observable. Pregunta al usuario.
4. **`root_cause_not_inferrable`** — el diff es ambiguo sobre la causa raíz. Marca TBD y pregunta si el dev está disponible.
5. **`severity_not_determinable`** — no hay datos de monitoring para inferir severidad. Pregunta al usuario.
6. **`git_history_missing`** — no hay `.git` o SHA del fix. Pide fecha manual con confidence: 0.3.
7. **`contract_change_detected`** — el fix cambió el contrato → MAJOR bump + ADR obligatorio.
8. **`regression_test_missing`** — no se identificó ningún test en el fix. Recomienda agregar test de regresión.

**Anti-patrones — el skill NO debe hacer:**
- Silenciar R29 por ningún motivo.
- Inventar síntoma o root-cause sin evidencia.
- Usar este skill para bugs actuales no mergeados.
- Fingir que el test identificado es el test rojo original.

---

## Reporte final (obligatorio)

Al terminar exitosamente, el skill reporta. El campo `r8_gap` es **siempre obligatorio**:

```
▶ Bug reconstruido: BG-XX_<slug>.md
▶ Scope: story (FT-XX/HU-YY) | feature (FT-XX)
▶ Fix: commits <hash1>..<hash2> — N archivos

▶ ⚠️ R8 GAP (Regla 29) — DECLARADO
  Status: INCONSTRUIBLE RETROACTIVAMENTE
  Acción recomendada:
  - Si el bug es reciente (< 1 mes): agregar test de regresión.
  - Para test rojo: `git log --oneline -p <archivo>` + revertir manualmente.
  - El test de regresión garantiza que el bug no vuelve (sin ser el test rojo).

▶ Docs creados:
  - BG-XX_<slug>.md  v1.0.0  ancestor: <FT-XX/HU-YY o FT-XX>@vA.B.C

▶ Confidence global: 0.XX

▶ Gaps declarados (R27):
  ⚠ síntoma: <inferido | confirmado por usuario | TBD>
  ⚠ root-cause: <inferido del diff | TBD — consultar dev>
  ⚠ severidad: <inferida | confirmada>

▶ Padre bumpeado: <path> vA.B.C → vA.B.D (PATCH | MINOR | MAJOR)

▶ Modo: transparent (default) | stealth (override explícito)

▶ Revisión humana recomendada (R28):
  · Root-cause inferido del diff — validar con dev original.
  · Severidad e impacto — validar con soporte/monitoring.
  · Test de regresión — considerar agregar.
```

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- `methodology.core.yaml` + config de bug (story o feature scope) existen y parsean.
- **R25** — Fix mergeado a main o branch de release. No aplica a bugs en curso.
- Commits del fix identificables en git log.

**R29 no es una precondición de abort** — es un invariante siempre verdadero. Reverse-bug implica R29.

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: fix mergeado.
- **R26** — Default transparent.
- **R27** — Preguntas dirigidas para síntoma, root-cause, severidad.
- **R28** — Root-cause inferido del diff puede ser incorrecto.
- **R29** — R8 inconstruible retroactivamente — DECLARAR SIEMPRE.
- **R30** — R17 con timestamps del fix; bump de padre según impacto.
- **R31** — No se usa para bugs en curso.
- **R32** — Ratio reverse/forward como señal de salud.
- **R17** — Frontmatter versionado + ancestor.
- **R8** — Referenciada para declarar su inaplicabilidad (R29).
- **R10** — Si el fix cambió el contrato → MAJOR bump + ADR.
- **R3b** — Si el fix implicó decisión técnica con opciones → ADR retroactivo.
- **R24** — Framework instalado.

---

## Estado final después del skill

El bug queda reconstruido con su doc firmado:

```
docs/works/features/FT-XX/user-stories/HU-YY/bugs/
└── BG-XX_<slug>.md    (v1.0.0, snapshot — con declaración R29 en reproduction-red-test)
```

o (scope feature):

```
docs/works/features/FT-XX/bugs/
└── BG-XX_<slug>.md    (v1.0.0, snapshot — con declaración R29 en reproduction-red-test)
```

El repo queda **indistinguible del que dejaría el flow forward** en términos de completitud de artifacts, **con la excepción documentada de R8**: la sección `reproduction-red-test` declara explícitamente que el test rojo no existe y el fix se reverse-engineereó.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- **Regla 29**: [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md) — sección Regla 29
- Regla 8 (forward): [`~/.fremi/framework/artifacts/story/rules/tdd.md`](../../artifacts/story/rules/tdd.md)
- Reglas reverse (R25-R32): [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md)
- Flujo canónico reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Skill forward story-bug: [`~/.fremi/framework/artifacts/story/skills/bug/SKILL.md`](../../artifacts/story/skills/bug/SKILL.md)
- Skill forward feature-bug: [`~/.fremi/framework/artifacts/feature/skills/bug/SKILL.md`](../../artifacts/feature/skills/bug/SKILL.md)
- Config reverse global: [`~/.fremi/framework/settings/config.reverse.core.yaml`](../../settings/config.reverse.core.yaml)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: flujo narrativo del skill reverse-bug con R29 como concepto de primera clase.
