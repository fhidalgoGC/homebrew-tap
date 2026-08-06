---
name: fremi-install-framework
description: Instala el framework completo en `.claude/` — crea/recrea symlinks para todos los skills (orquestadores + sub-skills por capa + globales + reverse-engineering + tools), aplicando la convención de prefijo `fremi-` (Regla 21). Reporta el estado de hooks en `.claude/settings.json` (incluye `check-reverse-alignment.sh` — Regla 32) y valida CLAUDE.md (incluye referencia a `rules/reverse.md` — Reglas 25-32). Idempotente: si un symlink ya existe apuntando al target correcto lo respeta; si el nombre no cumple con la convención `fremi-` o el target es incorrecto, lo recrea. Modos `--dry-run` (sólo mostrar), `--only skills|hooks|rules|project` (parcial). Ejecutar cuando se clona el proyecto, se importa el framework a un proyecto nuevo, o cuando se cambia la estructura de `~/.fremi/framework/framework/skills/` y hay que resincronizar `.claude/`.
---

# /fremi-install-framework — Instalador del framework

> **Bootstrap del framework — exento de Regla 24.** Este skill es el ÚNICO que puede correr con el framework NO instalado. Cualquier otro `/fremi-*` aborta si el framework no está instalado; sin este skill no habría cómo arrancar. Ver Regla 24 en [`~/.fremi/framework/framework/rules/workflow.md`](../../rules/workflow.md).

Instala **todo el framework** en `.claude/` de forma idempotente y **garantiza la convención `fremi-`** (Regla 21):

- Symlinks a **skills** del framework (todos con prefijo `fremi-`).
- Symlinks a **skills de project** (bajo `docs/project/skills/`, **sin** prefijo).
- Registro (o reporte) de **hooks** en `.claude/settings.json`.
- Referencias a **rules** desde `CLAUDE.md`.
- Verificación de **CLAUDE.md** con la sección "## Project rules".

**Convención global `fremi-` (Regla 21)** — este skill es el **único responsable** de garantizar que:

1. Todo skill de `~/.fremi/framework/framework/` se publique en `.claude/skills/` con nombre `fremi-<...>`, aunque el `name:` del `SKILL.md` tuviera drift.
2. Los skills bajo `docs/project/skills/` se publiquen con su nombre original **sin** prefijo `fremi-`.
3. Los symlinks viejos sin prefijo (`story`, `product-adr`, `scaffold`, etc.) se limpien y se recreen como `fremi-<...>`.

**Idempotencia**: si un symlink ya existe apuntando al target correcto **y con el nombre correcto** → skip. Si el nombre viola la convención o apunta a target incorrecto → borra + recrea. Si es un file real (no symlink) → pide confirmación (o borra con `--force`).

---

## Sintaxis

```
/fremi-install-framework [--dry-run] [--only skills|hooks|rules|project] [--force]
```

- **Sin flags**: instala todo (default).
- `--dry-run`: muestra qué haría sin ejecutar.
- `--only <parte>`: instala sólo esa parte.
  - `skills` — sólo symlinks de skills.
  - `hooks` — sólo reporte de hooks.
  - `rules` — sólo referencias en CLAUDE.md.
  - `project` — sólo symlinks de skills bajo `docs/project/skills/`.
- `--force`: sobrescribe archivos reales (no-symlinks) sin preguntar.

---

## Cuándo invocarlo

- **Al clonar el proyecto** — sincronizar `.claude/skills/` con `~/.fremi/framework/framework/skills/`.
- **Al importar el framework** a un proyecto nuevo (después de `/fremi-import-template`).
- **Cuando cambia la estructura** de `~/.fremi/framework/framework/skills/` (nuevos sub-skills, refactor de carpetas).
- **Cuando aparecen symlinks broken** — el skill los detecta y recrea.
- **Después de agregar hooks nuevos** para reportar cómo registrarlos.

---

## Procedimiento

### Paso 0 — Validar entorno

1. Verificar que existe `~/.fremi/framework/framework/skills/` — si no, abortar (no es un proyecto con framework instalado).
2. Verificar que existe `.claude/` — si no, crear con `mkdir -p .claude/skills`.
3. Verificar que existe `CLAUDE.md` en la raíz — si no, avisar (necesario para cargar rules).

### Paso 1 — Enumerar skills del framework

Escanear todas las carpetas del framework:

- `~/.fremi/framework/framework/skills/` — orquestadores + sub-skills por capa + globales + tools.
- `~/.fremi/framework/framework/reverse-engineering/` — reverse-*.
- `~/.fremi/framework/framework/installs/` — este skill.

Estructura esperada:

```
~/.fremi/framework/framework/skills/
├── <capa>/SKILL.md                 → invocable como /fremi-<capa>
│   └── skills/<sub>/SKILL.md       → invocable como /fremi-<capa>-<sub>
├── tools/SKILL.md                  → invocable como /fremi-tools
│   └── skills/<action>/SKILL.md    → invocable como /fremi-<action>
└── <global>/SKILL.md               → invocable como /fremi-<global>

~/.fremi/framework/framework/reverse-engineering/
└── <reverse-name>/SKILL.md         → invocable como /fremi-<reverse-name>

~/.fremi/framework/framework/installs/
└── install-framework/SKILL.md      → invocable como /fremi-install-framework
```

**Skills que se enlazan** (leyendo el `name:` del frontmatter YAML — todos deben empezar por `fremi-`):

| Categoría | Skills |
|---|---|
| **Orquestadores** (5) | `fremi-product`, `fremi-feature`, `fremi-story`, `fremi-enabler`, `fremi-tools` |
| **Sub-skills product** (7) | `fremi-product-iniciativas`, `fremi-product-ideas`, `fremi-product-planteamiento`, `fremi-product-definition`, `fremi-product-strategies`, `fremi-product-adr`, `fremi-product-plan` |
| **Sub-skills feature** (2) | `fremi-feature-adr`, `fremi-feature-bug` |
| **Sub-skills story** (16) | `fremi-story-explore`, `fremi-story-definition`, `fremi-story-proposal`, `fremi-story-scope`, `fremi-story-bdd`, `fremi-story-sdd`, `fremi-story-design`, `fremi-story-tdd`, `fremi-story-plan`, `fremi-story-task`, `fremi-story-checkwork`, `fremi-story-verify`, `fremi-story-closure-check`, `fremi-story-closure`, `fremi-story-adr`, `fremi-story-bug` |
| **Sub-skills enabler** (4) | `fremi-enabler-definition`, `fremi-enabler-design`, `fremi-enabler-plan`, `fremi-enabler-closure` |
| **Sub-skills tools** (8) | `fremi-add-skill`, `fremi-add-hook`, `fremi-add-rule`, `fremi-add-mcp`, `fremi-delete-skill`, `fremi-delete-hook`, `fremi-delete-rule`, `fremi-delete-mcp` |
| **Globales** (3) | `fremi-sync-check`, `fremi-import-template`, `fremi-link-template-assets` |
| **Reverse-engineering** (6) | `fremi-reverse-story`, `fremi-reverse-feature`, `fremi-reverse-bug`, `fremi-reverse-enabler`, `fremi-reverse-product`, `fremi-reverse-extra` |
| **Installer** (1) | `fremi-install-framework` |
| **Total framework** | **52 skills** |

### Paso 2 — Instalar skills del framework (aplicando convención `fremi-`)

Para cada skill descubierto:

1. Leer el `name:` del `SKILL.md` frontmatter.
2. **Validar convención `fremi-`**:
   - Si el `name:` NO empieza con `fremi-` → normalizarlo a `fremi-<name>` para el symlink (y reportar "warning: name field drift — usando `fremi-<name>` en el symlink").
   - Si empieza con `fremi-` → usarlo tal cual.
3. Determinar el path del target según la ubicación en el árbol:
   - Orquestador de capa: `~/.fremi/framework/framework/skills/<capa>/`
   - Sub-skill: `~/.fremi/framework/framework/skills/<capa>/skills/<sub>/`
   - Skill global: `~/.fremi/framework/framework/skills/<name>/`
   - Reverse: `~/.fremi/framework/framework/reverse-engineering/<name>/`
   - Install: `~/.fremi/framework/framework/installs/<name>/`
4. Path del symlink: `.claude/skills/fremi-<nombre>` → `../../<target>`.
5. **Limpieza de nombres legacy** (sin prefijo): antes de crear, si existe `.claude/skills/<legacy-name>` (ej: `story`, `product-adr`, `scaffold`) y su target apunta a este skill, **borrarlo** (reportar "cleaned legacy").
6. Aplicar idempotencia:
   - **Si `.claude/skills/fremi-<...>` existe y es symlink al target correcto** → skip (reportar "OK").
   - **Si existe y es symlink al target INCORRECTO** → borrar + recrear (reportar "recreated").
   - **Si existe y NO es symlink** → sin `--force`, preguntar al usuario; con `--force`, borrar y crear.
   - **Si no existe** → crear (reportar "installed").
7. **Verificar que el symlink resuelve** (el target existe físicamente).
   - Si no resuelve → reportar "BROKEN — target missing" y no crear.

### Paso 3 — Instalar skills de project (si aplican)

Enumerar `docs/project/skills/` (si existe). Para cada skill:

1. **Los skills de project NO llevan prefijo `fremi-`** (Regla 21) — se distinguen así del framework en autocomplete.
2. Verificar que no colisiona con un skill del framework:
   - Si el project tiene un skill llamado `story` y el framework tiene `fremi-story` → no colisiona (nombres distintos).
   - Si el project intentara llamarse `fremi-story` → colisión conceptual, abortar y avisar.
3. Crear symlink `.claude/skills/<name>` → `../../docs/project/skills/<name>/`.
4. Aplicar la misma idempotencia del Paso 2 (pero sin normalización de prefijo).

### Paso 4 — Instalar rules

Los rules del framework se cargan vía **referencia desde `CLAUDE.md`**, no via symlink en `.claude/`.

1. Verificar que `CLAUDE.md` referencia `~/.fremi/framework/framework/rules/workflow.md` (típicamente en la introducción).
2. Verificar que existe la sección `## Project rules` en `CLAUDE.md` para rules del project (si `docs/project/rules/` existe).
3. Si `docs/project/rules/*.mdc` existe pero no está referenciada en `## Project rules` → sugerir agregarla (con `--force` la agrega automáticamente).

### Paso 5 — Instalar hooks

Los hooks se registran en `.claude/settings.json` bajo `"hooks"`. El skill:

1. Enumerar hooks de `~/.fremi/framework/framework/hooks/*.sh`.
2. Cargar `references/settings-hooks-template.json` — bloque JSON con los mappings recomendados.
3. **Si `.claude/settings.json` NO existe** → crearlo con el bloque del template.
4. **Si `.claude/settings.json` existe con hooks registrados** → reportar cuáles están (mostrar bloque actual). NO sobrescribir sin `--force`.
5. **Con `--force`**: mergear el bloque de hooks del template con lo existente (dedup por comando).

**Modo --dry-run**: muestra el diff de qué haría sin escribir.

### Paso 6 — Reporte final

Formato:

```
=== fremi-install-framework — Reporte ===

▶ Skills del framework (52 total, todos con prefijo `fremi-`):
  ✓ Instalados nuevos:      N
  ✓ Recreados (target inv): N
  ✓ Ya OK (skip):           N
  ✓ Legacy limpiados (sin prefijo `fremi-`): N   ← lista de nombres viejos borrados
  ⚠ Name field drift (renombrados por convención): N   ← detalle
  ✗ Broken (target missing): N   ← reportar detalle

▶ Skills del project (sin prefijo `fremi-`):
  ✓ Instalados:             N
  (o "sin skills en docs/project/skills/")

▶ Rules:
  ✓ CLAUDE.md referencia rules/workflow.md
  ✓ Sección "## Project rules" en CLAUDE.md
  ⚠ Rules de project sin referencia: <lista>

▶ Hooks:
  ✓ .claude/settings.json existe
  ✓ Hooks registrados: N / 10 (~/.fremi/framework/framework/hooks/)
  ⚠ Sin registrar: <lista>
     Registrarlos manualmente copiando de references/settings-hooks-template.json.

▶ Próximos pasos:
  - Revisar skills BROKEN (si los hay).
  - Registrar hooks pendientes en .claude/settings.json.
  - Correr `/fremi-sync-check` para verificar coherencia post-instalación.
```

---

## Validaciones

- Aborta si `~/.fremi/framework/framework/skills/` no existe (no hay framework para instalar).
- Aborta si un symlink no puede crearse (permisos, filesystem).
- Reporta symlinks broken pero no los recrea si el target no existe.
- Con `--dry-run` NO modifica nada — sólo reporta.
- Nunca borra archivos fuera de `.claude/` sin `--force`.

---

## Anti-patrones

- ❌ Ejecutar el skill "por las dudas" cada vez — es idempotente pero no gratis. Usarlo cuando cambia la estructura.
- ❌ Editar `.claude/skills/` a mano — este skill lo mantiene sincronizado con `~/.fremi/framework/framework/skills/`.
- ❌ Registrar hooks sin verificar sus dependencias (`jq`, `git`) — verificar en el sistema antes.
- ❌ Usar `--force` sin haber revisado el reporte de `--dry-run` primero.

---

## Referencias

- Template del bloque de hooks: [`references/settings-hooks-template.json`](references/settings-hooks-template.json).
- Skills del framework: `~/.fremi/framework/framework/skills/` (jerárquico por capa — Regla 21).
- Hooks del framework: `~/.fremi/framework/framework/hooks/` (Regla 23).
- Rules del framework: `~/.fremi/framework/framework/rules/workflow.md` (cargado vía CLAUDE.md).
- CLAUDE.md (entrada del agente) — [`../../../../CLAUDE.md`](../../../../CLAUDE.md).
