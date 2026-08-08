---
name: fremi-reverse-bug
description: Reconstruye un archivo `BG-XX_<slug>.md` (scope story o feature) a partir de un fix ya aplicado en código. Modo default `--transparent` (Regla 26 — frontmatter con reverse_engineered:*); `--stealth` disponible como override explícito. Aplica Regla 17 + Regla 29 (test rojo inconstruible retroactivamente). Usar cuando existe un fix mergeado sin haber seguido el ciclo Regla 8 — permite regularizar bugs históricos.
---

# /fremi-reverse-bug — Ingeniería inversa de un bug

Reconstruye un `BG-XX_<slug>.md` a partir de un fix ya aplicado. Detecta el scope apropiado (story o feature) según los archivos tocados.

**Precondición conceptual**: existe un fix mergeado en código (con commits identificables) pero NO existe el archivo del bug con síntoma, root-cause, fix-applied, etc.

## Sintaxis

```
/fremi-reverse-bug <scope> <slug> [--stealth|--transparent] [--dry-run]

  scope = FT-XX/HU-YY   → bug scope story
        | FT-XX          → bug scope feature
```

- `<slug>`: nombre descriptivo del bug (kebab-case).

## Cuándo invocarlo

- Existe commit(s) de fix (`fix:`, `bug:`) en git log pero no hay `BG-XX_*.md`.
- Se implementó un fix directo sin registrar el bug ni el test rojo previo.
- Se está migrando un backlog de bugs históricos al framework.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.bug`.
- `config.bug.story.yaml` o `config.bug.feature.yaml` según scope.

### Paso 1 — Identificar el fix

Preguntar al usuario:
- ¿Qué **commits** de git son el fix? (rango o SHA)
- ¿Qué **archivos** tocó el fix?
- ¿Hay **tests** que se agregaron con el fix? (probablemente el test que valida el fix)
- ¿Cuál es el **síntoma** que el fix resuelve? (observado en producción/staging)

### Paso 2 — Determinar scope y numeración

- Si `<scope>` = `FT-XX/HU-YY` → path = `FT-XX/user-stories/HU-YY/bugs/`, numeración local a la story.
- Si `<scope>` = `FT-XX` → path = `FT-XX/bugs/`, numeración local a la feature.
- Calcular próximo `BG-XX` en esa carpeta.

### Paso 3 — Escanear artifacts del fix

```
📜 Git:
   git show <commits> --stat
   → archivos tocados, líneas cambiadas.
   → mensaje del commit → pistas de root-cause.

📂 Diff del fix:
   git diff <commit_pre>..<commit_fix>
   → qué se cambió específicamente.

🧪 Tests agregados:
   Detectar test files nuevos o modificados en el fix.
   → probablemente el test que valida el fix.
```

### Paso 4 — Inferir contenido de las secciones del bug

- **`symptom`**: preguntar al usuario ("¿qué se observaba?"). Complementar con lo detectado del código si el commit tiene mensaje descriptivo.
- **`impact-severity`**: preguntar al usuario. Sugerir según scope (bug de feature suele ser Alto/Medio).
- **`reproduction-red-test`**:
  - Reconstruir la reproducción del síntoma.
  - Identificar el test que se agregó — declararlo como "test que valida el fix".
  - **⚠️ Regla 8 NO se puede reconstruir retroactivamente**: no hay "test rojo previo" — el test se agregó junto con el fix. **Documentar esta limitación** en la sección.
- **`root-cause`**: inferir del diff. Del cambio del código, deducir qué estaba mal.
- **`fix-applied`**: descripción del cambio + lista de archivos tocados + link a commits.
- **`linkages`** (para bugs de feature, típicamente obligatoria):
  - Stories afectadas: buscar stories que tocan los mismos archivos.
  - ADRs vigentes: si el bug fue causado por decisión que sigue en ADR.
- **`closure`**: fecha del commit del fix como fecha de cierre.

### Paso 5 — Aplicar Regla 17

- `created`: fecha del PR/commit del bug/fix (con `--from-git-history`) o fecha actual.
- `version_at_creation`: versión de story/feature al momento del fix (usar `git blame` o versión actual como fallback).
- `version_at_closure`: versión final de story/feature (típicamente misma que `at_creation` si el fix no cambió contrato).
- Modo `--stealth` / `--transparent`.

### Paso 6 — Bumpear padre según impacto del fix

Consultar `parent_bump_triggers.bug_closes`:
- Fix respetó contrato → PATCH del padre.
- Fix extendió contrato → MINOR.
- Fix cambió contrato → MAJOR (Regla 10 + ADR requerido).

### Paso 7 — Reportar

```
▶ Bug reconstruido: BG-XX_<slug>.md
▶ Scope: story (FT-XX/HU-YY) | feature (FT-XX)
▶ Fix: commits <hash1>..<hash2> — N archivos

▶ Padre bumpeado:
  - FT-XX/HU-YY o FT-XX: vA.B.C → vA.B.C+1

▶ Advertencias:
  ⚠ Regla 8 no aplicó retroactivamente — no hay test rojo previo al fix.
  ⚠ Root-cause inferido del diff — revisar con el dev original si aún está.
  ⚠ Severidad y síntoma inferidos — validar con soporte/monitoring.
```

## Advertencias especiales para reverse-bug

### ⚠️ Regla 8 (test rojo primero) es INCONSTRUIBLE retroactivamente

Si el fix ya está aplicado y los tests pasan, **no hay forma de recrear el test rojo previo**. El skill:
- Documenta esta limitación en la sección `reproduction-red-test`.
- Sugiere que si el bug es reciente (< 1 mes) y el equipo aún recuerda, **agregar un test regression** que garantice que el bug no vuelve.

### ⚠️ Diff ≠ root-cause

Un fix puede tocar 5 archivos pero la causa raíz está en 1 solo. El diff muestra QUÉ se cambió, no POR QUÉ. Preguntar al dev si es posible.

### ⚠️ Bugs viejos sin memoria

Si nadie recuerda el bug ni el contexto, la reconstrucción es puramente basada en el diff — puede ser incorrecta. Considerar marcar como `--transparent` para trazabilidad.

## Anti-patrones

- ❌ Reverse-engineerar bugs actuales — usar `/fremi-story-bug` o `/fremi-feature-bug` normal + Regla 8.
- ❌ Firmar el closure sin validar la severidad y el impacto con el equipo.
- ❌ Inventar root-cause "porque parece" — mejor marcar TBD y consultar.

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Skills del flow normal: [`/fremi-story-bug`](../../artifacts/story/skills/bug/SKILL.md), [`/fremi-feature-bug`](../../artifacts/feature/skills/bug/SKILL.md).
- Regla 8 (test rojo primero) — inconstruible retroactivamente.
- Regla 17 (versionado).
