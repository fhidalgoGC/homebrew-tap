---
name: fremi-reverse-story
description: Reconstruye la cadena completa de una story (FW-00..FW-10) a partir de código, tests, commits y docs sueltos existentes. Modo default `--transparent` (Regla 26 — marca reverse_engineered:*); `--stealth` disponible como override explícito (indistinguible del flow forward). Aplica Regla 17, 25-32. Usar cuando existe trabajo real (endpoint, feature) sin haber seguido el flow del framework — permite alinearlo al framework.
---

# /fremi-reverse-story — Ingeniería inversa de una user story

Reconstruye la **cadena completa de una story** (FW-00..FW-10) a partir de artifacts sobrevivientes. El resultado se ve como si el flujo se hubiera seguido desde el principio.

**Precondición conceptual**: existe trabajo real (código en `src/`, tests, PR mergeado) pero NO existen los docs FW-XX del flow.

---

## Sintaxis

```
/fremi-reverse-story <FT-XX> <HU-YY> [--stealth|--transparent] [--dry-run] [--from-git-history]
```

- `<FT-XX>`: feature padre (debe existir con `definition.md`).
- `<HU-YY>`: ID a asignar a la story reconstruida (debe ser el próximo libre).
- `--transparent` (default, Regla 26): agrega `reverse_engineered: true`, `reverse_engineered_at`, `reverse_engineered_source`, `reverse_engineered_confidence` en frontmatter.
- `--stealth`: override explícito — los docs se ven idénticos al flow normal (sin bloque `reverse_engineered:*`). Requiere justificación por ADR a nivel proyecto.
- `--dry-run`: sólo reporta.
- `--from-git-history`: usa `git log --follow` para inferir fechas y task-XXX de commits.

---

## Cuándo invocarlo

- Existe código funcional en producción pero no hay `docs/works/features/FT-XX/user-stories/HU-YY/*`.
- Un agente escribió código sin crear la story — hay que regularizar.
- Se está migrando código legacy al framework.

**NO invocar** para trabajo nuevo — usar el flow normal (`/fremi-story`, `/fremi-story-definition`, ..., `/fremi-story-closure`).

---

## Procedimiento

### Paso 0 — Cargar configuración

1. Leer `~/.fremi/framework/settings/methodology.json`.
2. Leer `~/.fremi/framework/skills/story/config.user.yaml` — orden de la cadena, docs, conditional_rules.
3. Leer `config.yaml` master — versioning, phase_rules.

### Paso 1 — Identificar el trabajo huérfano

Preguntar al usuario (si no está claro):
- ¿Qué **código** implementa este trabajo? (path: `src/functions/xxx/`, archivos concretos)
- ¿Qué **tests** cubren este trabajo? (paths de test files)
- ¿Hay **commits** de git específicos? (rango de commits o PR)
- ¿Hay **docs sueltos** relacionados? (READMEs, notas)

Confirmar que **NO existe** ya la story `FT-XX/user-stories/HU-YY_*/` — si existe, abortar.

### Paso 2 — Escanear artifacts

Ejecutar recolección:

```
📂 Código:
   - Leer archivos declarados por el usuario.
   - Extraer: exports, tipos, funciones públicas, endpoints declarados.

🧪 Tests:
   - Leer archivos de test.
   - Extraer: describe/it blocks (potenciales SC-XXX), assertions.
   - Contar tests unit/integration/e2e por tipo.

📜 Git:
   - git log --follow <archivos> --oneline
   - Extraer: fecha del primer commit (created), último (last_updated),
     mensajes de commit (candidatos a task-XXX).

📖 Docs:
   - README.md de módulo, JSDoc, comentarios inline.
```

### Paso 3 — Evaluar condicionales (Regla 16)

**FW-00_explore** — ¿existía código relacionado antes? ¿había alternativas?
- Si el commit history sugiere iteración/investigación → generar FW-00.
- Si no → omitir.

**FW-02_proposal** — ¿aplica `proposal_when`?
- Si introduce contrato externo nuevo, cambia comportamiento visible, o afecta 3+ archivos → generar FW-02.
- Si no → omitir.

### Paso 4 — Inferir contenido de cada doc

Para cada doc de la cadena, inferir:

#### `FW-01_definition.md` (siempre)
- **Formato**: As a / I want / So that.
- **Fuente**: título del PR / commit inicial + input del usuario para "So that" (**preguntar** si no se puede inferir).
- **CAs (CA-XXX)**: enumerar desde tests. Si un test verifica algo → hay un CA implícito.
- **Advertencia**: CAs que no tienen test → invisibles al reverse. El skill lista posibles CAs faltantes al reportar.

#### `FW-03_scope.md` (siempre)
- **In-scope**: lo que el código implementa (endpoints, funciones exportadas).
- **Out-of-scope**: inferir de:
  - Tests marcados `it.skip()` o `xit()` → gaps intencionales.
  - Comentarios "TODO", "not implemented".
  - Casos límite que los tests NO cubren.
- **Dependencias**: `import` de otros módulos internos del proyecto.

#### `FW-04_bdd-userstories.md` (siempre)
- Cada bloque `describe/it` de test → un `Scenario:` en Gherkin.
- Traducir:
  - `describe('POST /reports/csv', ...)` → contexto (Given)
  - `it('returns 200 with csv when body is valid', ...)` → When + Then
- Numerar `SC-XXX` en el orden en que aparecen los tests.
- **Advertencia**: SC reconstruidos reflejan la implementación, no necesariamente la especificación de negocio.

#### `FW-05_sdd-spec.md` (siempre)
- **Endpoints**: rutas HTTP declaradas en el handler.
- **Schemas**: types TS o schemas Zod exportados.
- **Errores expuestos**: enumerar throws / return con status codes.
- **NFRs medibles**: si hay tests de perf/timeout, extraer targets.

#### `FW-06_design.md` (siempre)
- **Tecnologías**: extraer de `package.json` las libs usadas por el módulo.
- **Componentes**: archivos y su rol (handler, service, repository, etc.).
- **Wrappers**: detectar adapter/proxy patterns (archivos que envuelven libs externas).
- **Patrones**: observar y nombrar (repository si hay `xxxRepository`, adapter, etc.).
- **Estructura de archivos**: `find src/functions/xxx/`.
- **Key Invariants**: dejar TBD (**preguntar al usuario**).
- **Edge Cases Pin-Down**: derivar de tests borde.
- **Open Questions**: (vacío por default — el código ya existe).
- **Acceptance Test Mapping**: mapear cada requirement de FW-05 a TC-XXX (Fase 4/5).

#### `FW-07_tdd-plan.md` (siempre)
- Enumerar todos los tests existentes como `TC-XXX`.
- Cada TC-XXX declara: nombre del test, archivo, tipo (unit/integration/e2e), estado `[x]` (ya pasa).
- **Regla 7 NO aplica retroactivamente** — no hay "test rojo primero" que reconstruir.

#### `FW-08_plan.md` (siempre)
- Reconstruir `task-XXX` de:
  - **Commits git** (uno por task inferida, o agrupar por scope).
  - **Archivos creados** (uno por archivo principal → una task).
- Cada task: objetivo, mapeo a FW-05/FW-06/FW-07, criterio verificable (**test archivo::función que pasa**), estado `[x]`.

#### `FW-09_checkwork.md` (siempre, living)
- **% progreso**: 100% (todas las tasks cerradas — el código ya está).
- **✅ Listo**: todas las tasks del plan.
- **Archivos implementados**: enumerar del scan.
- **Cobertura por CA**: cada CA-XXX con `✅` si tiene test.
- **Changelog**: reconstruir entries retroactivas si `--from-git-history`.

#### `FW-10_closure.md` (siempre)
- **Matriz de trazabilidad**: CA → SC → SDD → Design → TC → archivo (reconstruida).
- **DoD**: marcar todos `[x]` verificados.
- **Evidencia**: link a commits + tests que pasan.
- **Fecha de cierre**: fecha actual (o del último commit relacionado si `--from-git-history`).
- **Firmar**.

### Paso 5 — Aplicar Regla 17

Para cada doc reconstruido:

- `created`:
  - Con `--from-git-history`: fecha del primer commit del trabajo.
  - Sin flag: fecha actual.
- `last_updated`:
  - Con `--from-git-history`: fecha del último commit.
  - Sin flag: fecha actual.
- `version`: `1.0.0` (snapshots) o `0.1.0` (livings: FW-09).
- `ancestor.version_at_creation`: versión actual de `FT-XX/definition.md`.
- `ancestor.version_at_closure` (FW-10): calcular versión final del padre después del bump.

**Modo `--stealth`**: NO agregar campos `reverse_engineered_*` al frontmatter.
**Modo `--transparent`**: agregar `reverse_engineered: true`, `reverse_engineered_at: YYYY-MM-DD`, `reverse_engineered_source: <descripción de qué se escaneó>`.

### Paso 6 — Bumpear FT-XX padre (Regla 17)

Aplicar `parent_bump_triggers.story_closes` como si fuera un cierre normal:
- Si esta story agregó requirements → MINOR bump de `FT-XX/definition.md`.
- Agregar entry al changelog del padre con `[origen: HU-YY]`.

Rellenar `ancestor.version_at_closure` en el FW-10.

### Paso 7 — Reportar al usuario

```
=== reverse-story — Reporte ===

▶ Story reconstruida: FT-XX/HU-YY_<slug>
▶ Modo: stealth | transparent

▶ Docs creados:
  - FW-00_explore.md         (condicional — se detectó iteración en commits)
  - FW-01_definition.md      (CAs: N derivados de tests)
  - FW-02_proposal.md        (condicional — se detectó contrato nuevo)
  - FW-03_scope.md
  - FW-04_bdd-userstories.md (SC-XXX: N derivados)
  - FW-05_sdd-spec.md
  - FW-06_design.md          (Key Invariants: 2 TBD — revisar)
  - FW-07_tdd-plan.md        (TC-XXX: N existentes)
  - FW-08_plan.md            (task-XXX: N inferidas de commits)
  - FW-09_checkwork.md       (100% — todo cerrado)
  - FW-10_closure.md         (FIRMADO YYYY-MM-DD)

▶ Padre bumpeado:
  FT-XX/definition.md: v1.2.0 → v1.3.0

▶ Gaps que necesitan revisión humana:
  ⚠ FW-01: el "So that" fue inferido — revisar que refleja la intención de negocio real
  ⚠ FW-04: 2 SCs pueden ser "cómo lo implementó el dev" en vez de "qué debía ser"
  ⚠ FW-06: 2 Key Invariants marcadas TBD — requieren decisión humana
  ⚠ Regla 8: no aplica retroactivamente — no hay test rojo previo que reconstruir
  ⚠ Sync-check no puede distinguir esta story de una normal (modo --stealth)

▶ Próximos pasos:
  - Revisar los 3 warnings arriba.
  - Correr /fremi-sync-check para verificar coherencia con el resto del framework.
  - Confirmar que la iniciativa asociada (init-XXX) existe.
```

---

## Advertencias operacionales

### ⚠️ Los tests son la fuente principal de verdad

Si los tests son incompletos → la story reconstruida es incompleta. Los SCs y CAs invisibles al reverse (porque no tienen test) quedan sin registrar. **El usuario DEBE revisar** si hay comportamiento cubierto por código pero no por tests.

### ⚠️ Regla 10 (docs son fuente de verdad) queda en tensión

Reverse-engineering derivа docs desde código, no al revés. Si el código tiene bugs conceptuales, la spec derivada los reproduce como "diseño intencional". El resultado puede legitimar decisiones que en realidad eran errores.

### ⚠️ Modo `--stealth` es funcional pero potencialmente engañoso

Un `/fremi-sync-check` posterior no puede distinguir docs reverse-engineered — es esa la intención del `--stealth`. Considerar `--transparent` cuando la trazabilidad histórica importa.

---

## Anti-patrones

- ❌ Usar reverse-engineering como forma HABITUAL de trabajar — el framework no está siendo respetado.
- ❌ Reverse una story que se está construyendo AHORA — usar el flow normal.
- ❌ Firmar el `FW-10_closure` sin revisar los gaps reportados — pueden haber CAs sin test.
- ❌ Confiar 100% en el BDD reconstruido — reflecta implementación, no necesariamente la especificación.

---

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Skill del flow normal: [`/fremi-story`](../../skills/story/SKILL.md).
- Regla 17 (versionado) — [`../../rules/workflow.md`](../../rules/workflow.md).
- Regla 10 (docs son fuente de verdad) — advertencia importante.
