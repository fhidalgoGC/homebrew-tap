# Reglas de mecánica del framework (skills, templates, config, hooks, install)

> **Reglas obligatorias 18, 19, 21, 22, 23, 24.** Gobiernan cómo el framework se organiza internamente: cada step es un skill invocable, templates viven en el skill dueño, skills se organizan jerárquicamente con prefijo `fremi-`, config está partida por capa, hooks son red de seguridad, y ningún skill se ejecuta sin instalación previa. Se lee junto con `rules/workflow.md`.

---

## Regla 18 — Cada step del `flow.sequence` es un skill invocable

Los `config.<capa>.yaml → flow.sequence` declaran la **secuencia canónica de skills** para completar el ciclo de esa capa. **Cada step debe apuntar a un skill real invocable** (`/fremi-story-explore`, `/fremi-product-adr`, `/fremi-enabler-plan`, etc.).

### Regla dura

- Si un "paso" no tiene skill asociado → **NO es step del flow**.
- Los pasos que ejecuta el usuario a mano dentro de un skill (ej: llenar sección `root-cause` del bug, caracterizar reproducción) viven en `procedure_after_creation` o `procedure_manual`, **NO en `flow.sequence`**.

### Justificación

Confundir "step del flow" con "cualquier cosa que el usuario hace" desdibuja la interfaz. `flow.sequence[i].skill` es el **contrato** que un agente puede invocar. Si algo no se puede invocar como skill, no es step.

### Ejemplos

- **`config.extra.yaml`** tiene `flow.sequence: []` porque extra es edición manual — no hay skills involucrados. Sus "pasos" viven en `procedure_manual`.
- **`config.bug.story.yaml`** y **`config.bug.feature.yaml`** tienen `flow.sequence` con **UN step** (`/fremi-story-bug` o `/fremi-feature-bug` respectivamente). El trabajo interno del bug (caracterizar, fix, firmar) vive en `procedure_after_creation`.
- **`config.enabler.yaml`** tiene 5 steps porque cada uno de los 4 docs (definition, design, plan, closure) tiene su sub-skill dedicado (`/fremi-enabler-definition`, `/fremi-enabler-design`, `/fremi-enabler-plan`, `/fremi-enabler-closure`).

### Cómo aplicar

Cuando se diseña o edita un `config.<capa>.yaml`:
- Cada entry de `flow.sequence` debe tener campo `skill:` con un skill que exista en `~/.fremi/framework/skills/`.
- Si aparece un paso sin skill → crear el sub-skill correspondiente O mover el paso a `procedure_manual`/`procedure_after_creation`.

---

## Regla 19 — Templates viven en el skill dueño (ownership)

**Cada template canónico vive en `references/` del skill que CREA/PUEBLA el artefacto**. Si otro skill orquesta o hace referencia al mismo artefacto, mantiene un **symlink** en su propio `references/` apuntando al canónico.

### Regla dura

- **Un archivo, un dueño**. El template real vive en el skill dueño.
- **Otros skills usan symlinks** (no copias) que apunten al canónico.
- Si querés editar el template, editás el **archivo real** — todos los symlinks reflejan el cambio automáticamente.

### Justificación

Copias duplicadas de un template en múltiples skills derivan (drift) con el tiempo. Symlinks preservan single source of truth y hacen visible la relación dueño → referencia.

### Ejemplos

- `FW-00_explore-template.md` vive en `story/skills/explore/references/` — es dueño `/fremi-story-explore`. `story/references/FW-00_explore-template.md` es symlink al canónico.
- Ejemplo (story): `FW-05_sdd-spec-template.md` vive en `story/skills/sdd/references/` — dueño `/fremi-story-sdd`. `story/references/FW-05_sdd-spec-template.md` es symlink. El mismo patrón aplica a templates de feature/product/enabler.
- ADR entry template vive en 3 lugares (`product-adr`, `feature-adr`, `story-adr`) — cada scope tiene su template independiente porque los ejemplos son distintos según scope. NO son symlinks entre sí.

### Cómo aplicar

- Al crear un skill que produce contenido nuevo → crear su template en `references/` del propio skill.
- Al crear un skill que orquesta múltiples otros (ej: `/fremi-story` que ejecuta los 11 sub-skills) → mantener symlinks en su `references/` apuntando a los templates de los sub-skills dueños.
- Al modificar un template → editar el archivo real, no el symlink.

### Excepción — templates específicos por scope

Cuando dos skills que operan sobre el "mismo" concepto tienen contexto distinto (ej: `/fremi-product-adr`, `/fremi-feature-adr`, `/fremi-story-adr` — el mismo template ADR con ejemplos por scope), cada uno tiene su **template independiente** (no symlinks). Los templates comparten estructura pero difieren en detalles.

---

## Regla 21 — Skills organizados jerárquicamente por capa + prefijo global `fremi-`

Los skills del framework se organizan **físicamente por capa** (`<capa>/skills/<sub>/`) y se exponen en `.claude/skills/` con **doble prefijo**:

1. **`fremi-`** — prefijo global del framework (obligatorio para todo skill de `~/.fremi/framework/`).
2. **`<capa>-`** — prefijo estructural que refleja jerarquía cuando corresponde.

Resultado: `fremi-<capa>-<sub>` (ej: `fremi-story-explore`, `fremi-product-adr`, `fremi-enabler-plan`).

### Regla dura — Prefijo `fremi-`

- **Todo skill de `~/.fremi/framework/`** (orquestador, sub-skill, reverse, tools) debe:
  - Tener `name: fremi-<...>` en el frontmatter de su `SKILL.md`.
  - Publicarse en `.claude/skills/` como symlink `fremi-<...>`.
  - Invocarse por el usuario como `/fremi-<...>`.
- **Los skills de proyecto** (`docs/project/skills/`, creados con `/fremi-add-skill`) **NO llevan prefijo** — así se distinguen los skills reusables del framework de los específicos del proyecto en el autocomplete de Claude Code.
- **El responsable de aplicar la convención** al instalar el framework es el CLI `fremi install`. Al crear symlinks en `.claude/skills/`, garantiza que cada nombre respete el prefijo, aunque el `name:` interno tuviera drift.

### Regla dura — Jerarquía física por capa

- **Sub-skills de una capa** → viven en `~/.fremi/framework/skills/<capa>/skills/<sub>/`.
- **Orquestadores de capa** → `~/.fremi/framework/skills/<capa>/SKILL.md` con `name: fremi-<capa>` (ej: `fremi-story`, `fremi-product`).
- **Skills globales / transversales** → viven directo en `~/.fremi/framework/skills/<name>/` (ej: `fremi-sync-check`, `fremi-tools`).
- **Reverse-engineering** → viven en `~/.fremi/framework/reverse-engineering/<name>/` con `name: fremi-reverse-<...>` (ej: `fremi-reverse-story`).
- **Installer** — no existe como skill. El CLI `fremi install` (binario en PATH) hace la instalación.

### Justificación

- **Prefijo `fremi-` global**: aísla los skills reusables del framework de los skills específicos del proyecto y garantiza que el usuario reconoce visualmente qué skill viene de la metodología. También simplifica el sweep del installer.
- **Jerarquía física por capa**: un ingeniero que abre `~/.fremi/framework/artifacts/story/` ve inmediatamente todos los skills que operan sobre stories, sin tener que buscar en 20+ carpetas planas.

### Ejemplos

```
~/.fremi/framework/skills/
├── product/                        (name: fremi-product)
│   └── skills/
│       ├── iniciativas/            (name: fremi-product-iniciativas)
│       ├── ideas/                  (name: fremi-product-ideas)
│       ├── planteamiento/          (name: fremi-product-planteamiento)
│       ├── definition/             (name: fremi-product-definition)
│       ├── strategies/             (name: fremi-product-strategies)
│       ├── adr/                    (name: fremi-product-adr)
│       └── plan/                   (name: fremi-product-plan)
├── feature/                        (name: fremi-feature)
│   └── skills/
│       ├── adr/                    (name: fremi-feature-adr)
│       └── bug/                    (name: fremi-feature-bug)
├── story/                          (name: fremi-story)
│   └── skills/
│       └── explore/, definition/, proposal/, ...  (name: fremi-story-<sub>)
├── enabler/                        (name: fremi-enabler)
│   └── skills/
│       └── definition/, design/, plan/, closure/  (name: fremi-enabler-<sub>)
├── tools/                          (name: fremi-tools)
│   └── skills/
│       ├── add-skill/              (name: fremi-add-skill)
│       ├── add-hook/               (name: fremi-add-hook)
│       ├── add-rule/               (name: fremi-add-rule)
│       ├── add-mcp/                (name: fremi-add-mcp)
│       ├── delete-skill/           (name: fremi-delete-skill)
│       ├── delete-hook/            (name: fremi-delete-hook)
│       ├── delete-rule/            (name: fremi-delete-rule)
│       └── delete-mcp/             (name: fremi-delete-mcp)
└── sync-check/                     (name: fremi-sync-check)

~/.fremi/framework/reverse-engineering/
├── reverse-story/                  (name: fremi-reverse-story)
├── reverse-feature/                (name: fremi-reverse-feature)
├── reverse-bug/                    (name: fremi-reverse-bug)
├── reverse-enabler/                (name: fremi-reverse-enabler)
├── reverse-product/                (name: fremi-reverse-product)
└── reverse-extra/                  (name: fremi-reverse-extra)

Bootstrap: el CLI `fremi install` (binario en PATH). No hay skill de
instalación — la instalación se orquesta desde la terminal, no desde
un slash-command.
```

En `.claude/skills/` los symlinks conservan el prefijo: `fremi-story-explore`, `fremi-product-iniciativas`, `fremi-feature-bug`, `fremi-add-mcp`, etc.

### Cómo aplicar

- **Skill nuevo de capa**: ubicarlo en `~/.fremi/framework/skills/<capa>/skills/<sub>/` y usar `name: fremi-<capa>-<sub>`.
- **Skill nuevo transversal**: ubicarlo en `~/.fremi/framework/skills/<name>/` con `name: fremi-<name>`.
- **Skill nuevo de proyecto** (via `/fremi-add-skill`): vive en `docs/project/skills/<name>/`, **sin prefijo** `fremi-`.
- **Verificación en instalación**: el CLI `fremi install` es idempotente y corrige los symlinks para que respeten la convención `fremi-`.

### Anti-patrones

- ❌ Crear un skill de framework con `name: story` (sin prefijo `fremi-`) — colisiona conceptualmente con skills de proyecto.
- ❌ Prefijar un skill de proyecto con `fremi-` — se pierde la señal de que es específico del proyecto.
- ❌ Referenciar un skill como `/story` en lugar de `/fremi-story` en docs/configs — el installer garantiza que sólo `fremi-*` está publicado.

---

## Regla 22 — Config operativa per-capa

La configuración operativa está **dividida por capa** en archivos independientes bajo `~/.fremi/framework/settings/`. El `config.yaml` master contiene **sólo globals** + referencias a los archivos per-capa.

### Regla dura

- **`config.yaml`** (master) contiene: `project`, `stack`, `testing`, `versioning`, `phase_rules` (transversales), `preferences`, y un mapa `layers` con paths a los archivos per-capa.
- **`config.<capa>.yaml`** contiene: `docs` (o `sections` para single-file), `conditional_rules` locales, `flow.sequence` + `flow.parallel_allowed`, y campo `active`.
- **Un archivo por capa/scope**:
  - `config.product.yaml`, `config.feature.yaml`, `config.story.yaml`, `config.enabler.yaml`, `config.extra.yaml`.
  - **`config.bug.story.yaml`** y **`config.bug.feature.yaml`** (2 archivos por los 2 scopes del bug).

### Justificación

- Un solo config monolítico crece rápido (v3 ya iba por 600 líneas) y hace difícil ver qué es específico de una capa vs global.
- Separar por capa facilita: (a) desactivar una capa entera con `active: false`, (b) evolucionar cada capa independientemente, (c) revisar cambios de una capa sin ruido de otras.

### Cómo aplicar

- Cambiar el flow o docs de una capa → editar SÓLO su `config.<capa>.yaml`.
- Cambiar reglas transversales (testing, versioning, phase_rules) → editar `config.yaml` master.
- Agregar una capa nueva → crear su `config.<capa>.yaml` + agregar entry en `layers` del master + crear su orquestador skill.

---

## Regla 23 — Hooks como red de seguridad de Regla 17

Los hooks en `~/.fremi/framework/hooks/` **validan automáticamente** que las reglas del framework se cumplen. Actúan como red de seguridad — detectan violaciones en tiempo real. **Por default AVISAN, no bloquean** (exit 0).

### Regla dura

- **Los skills productores son responsables** de aplicar Regla 17 correctamente al crear/editar artefactos.
- **Los hooks son red de seguridad** — verifican que los skills hicieron bien su trabajo.
- **NO son sustitutos** de la lógica en los skills. Un hook que reporta problema significa que un skill falló.

### Hooks que validan Regla 17

- `check-frontmatter.sh` — verifica que hay frontmatter con campos obligatorios.
- `check-version-bump.sh` — verifica que docs living bumpean al editarse.
- `check-changelog-entry.sh` — verifica que hay entry en `## Changelog` para la versión actual.
- `check-parent-bump-on-closure.sh` — verifica que al firmar closure, el padre bumpeó.
- `check-ancestor-coherence.sh` — verifica que `ancestor.version_at_creation` apunta a versión que existe en el padre.

### Hooks que validan otras reglas

- `check-flow-preconditions.sh` — Regla 1 (docs previos existen antes de crear FW-XX).
- `check-strict-tdd.sh` — Regla 7 (test asociado si `strict_tdd: true`).
- `check-workflow-stage.sh` — reporta estado del flujo al recibir prompt.
- `sync-checkwork.sh` — recuerda actualizar checkwork al editar plan.
- `audit-on-stop.sh` — auditoría ligera al terminar sesión.

### Cómo aplicar

- Registrar los hooks relevantes en `.claude/settings.json` (ver `~/.fremi/framework/hooks/README.md`).
- Los hooks se disparan según su evento (PostToolUse, PreToolUse, UserPromptSubmit, Stop).
- Para hacer un hook **bloqueante**: descomentar la línea `# exit 2` en el hook — sólo cuando el proyecto está listo para rigor estricto.
- Complementar con `/fremi-sync-check` para auditoría bajo demanda (Regla 12 + Regla 17).

### Anti-patrones

- ❌ Confiar 100% en los hooks — son red de seguridad, no motor de actualización.
- ❌ Deshabilitar hooks porque "molestan" — su función es alertar cuando algo se salta.
- ❌ Hacer hooks bloqueantes desde el arranque — arrancan como informativos hasta que el equipo esté cómodo.

---

## Regla 24 — Ningún skill del framework se ejecuta sin instalación previa

Antes de invocar **cualquier** skill del framework (`/fremi-*`), pipeline (`/fremi-pipeline-*`), o hook automatizado, la IA debe verificar que **el framework está instalado en el proyecto**. Si no lo está → **abortar** la invocación y proponer correr `fremi install` (el CLI).

### Justificación

El framework vive en `~/.fremi/framework/` como fuente de verdad, pero los skills se descubren desde `.claude/skills/` (donde el harness los busca). Sin la instalación, `.claude/skills/` no tiene symlinks al framework y las invocaciones fallan silenciosamente o resuelven a versiones stale. Correr un skill "a mano" leyendo el `SKILL.md` desde `~/.fremi/framework/` sin haber instalado deja los hooks desregistrados, los rules sin referenciar en `CLAUDE.md` y la nomenclatura sin garantía de convención `fremi-` (Regla 21) — es peor que no correrlo.

### Definición operativa de "instalado"

El framework está instalado cuando **ambas** condiciones se cumplen:

1. **Symlinks `fremi-*` presentes en `.claude/skills/`.** Al menos los orquestadores (`fremi-product`, `fremi-feature`, `fremi-story`, `fremi-enabler`, `fremi-tools`) deben existir como symlinks apuntando a `~/.fremi/framework/skills/<capa>/`.
2. **`CLAUDE.md` en la raíz** existe y referencia `~/.fremi/framework/rules/workflow.md` y `~/.fremi/framework/flows/workflow.md`.

Check operativo mínimo (barato, sin invocar tooling externo):

```
[ -L .claude/skills/fremi-story ] && [ -f CLAUDE.md ] && \
  grep -q "~/.fremi/framework/rules/workflow.md" CLAUDE.md
```

Si el check falla → framework NO instalado.

### Bootstrap

El bootstrap del framework es el **CLI `fremi install`**, no un skill. No existe un `/fremi-install-framework` slash-command — la instalación se orquesta desde el binario `fremi` en la terminal, que crea los symlinks, actualiza `CLAUDE.md`, y copia los settings al proyecto. Sin el CLI no hay forma de arrancar (chicken-and-egg no aplica: el CLI vive en tu PATH, no depende de que Claude pueda descubrir skills).

### Procedimiento

Al recibir una invocación de skill/pipeline/hook, **antes** de ejecutar el procedimiento del skill:

1. Correr el check operativo.
2. Si pasa → proceder con normalidad.
3. Si falla → **abortar sin efectos laterales** con este mensaje:
   ```
   El framework no está instalado en este proyecto.
   Corré `fremi install` en la terminal antes de invocar cualquier skill del framework.
   ```
4. **No** ejecutar el skill ni instalarlo silenciosamente por el usuario.

### Excepciones (skills exentos del guard)

Ninguna. Todo skill del framework requiere que el CLI `fremi install` haya corrido primero. Los reverse-engineering skills (`/fremi-reverse-*`) no son excepción — requieren framework instalado como cualquier otro.

### Anti-patrones

- ❌ La IA lee `SKILL.md` desde `~/.fremi/framework/skills/…` y ejecuta el procedimiento "manualmente" sin correr install → viola Regla 24.
- ❌ Un hook se dispara y ejecuta lógica del framework sin haber verificado que el framework está instalado.
- ❌ Auto-instalar sin permiso del usuario cuando el check falla — la instalación crea symlinks en `.claude/` que son cambios reales del entorno; requiere aprobación explícita.
- ❌ Instalar "sólo la parte que necesito" ignorando el resto (los hooks, las rules) — la instalación es atómica por diseño.

### Cuándo NO aplica

- Trabajo puramente sobre `docs/works/` **sin invocar un skill** (ej: el usuario edita un doc del workflow a mano en su editor). Regla 24 gobierna invocaciones de skills, no edición manual.
- Lectura de docs (`~/.fremi/framework/**`, `docs/works/**`) — el guard aplica sólo a ejecución de procedimientos.
