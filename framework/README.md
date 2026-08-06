# `~/.fremi/framework/framework/` — Configuración multi-agente del proyecto

> **Esta carpeta es la fuente de verdad de la configuración de los agentes (IA) que trabajan en el proyecto.** Las carpetas específicas de cada agente (`.claude/`, `.cursor/`, etc.) NO contienen archivos reales sino **symlinks** apuntando acá. Eso garantiza que todos los agentes vean la misma fuente.
>
> Este README es para humanos: orienta a las 5 subcarpetas y explica qué responsabilidad tiene cada una.

---

## Mapa de subcarpetas

| Subcarpeta | Para qué sirve | README |
|---|---|---|
| `rules/` | **Reglas duras** que la IA debe aplicar obligatoriamente (Reglas 1–12 del flujo). | [`rules/README.md`](rules/README.md) |
| `skills/` | **Skills invocables** por el usuario con `/fremi-<nombre>` (todos con prefijo `fremi-` — Regla 21; ej: `/fremi-feature`, `/fremi-story`, `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr`). Cada skill tiene un `SKILL.md` con frontmatter + procedimiento. | [`skills/README.md`](skills/README.md) |
| `hooks/` | **Hooks automáticos** que el harness dispara en eventos (ej: `UserPromptSubmit`). El usuario no los invoca. | [`hooks/README.md`](hooks/README.md) |
| `settings/` | **Configuración runtime estructurada** (JSON). Hoy: `methodology.json` con la nomenclatura del proyecto. | [`settings/README.md`](settings/README.md) |
| `plugins/` | **Configuración de plugins externos** (MCP servers, integraciones). Hoy vacío. | [`plugins/README.md`](plugins/README.md) |
| `commands/` | **Comandos custom** del harness (atajos simples). Hoy vacío. | [`commands/README.md`](commands/README.md) |

---

## Cómo distinguir dónde va una cosa nueva

| Lo que tenés | Va a |
|---|---|
| "Antes de X, debe existir Y" — una regla obligatoria | `rules/workflow.md` (sumar como Regla N) |
| "El usuario escribe `/foo` y la IA hace ..." | `skills/foo/SKILL.md` |
| "Cuando el usuario manda un mensaje, automáticamente ..." | `hooks/<nombre>.sh` |
| "El prefijo de features debería ser X y formato ..." | `settings/methodology.json` |
| "Conectar con Linear / Slack / Notion" | `plugins/<nombre>.json` |
| "Atajo trivial sin lógica" | `commands/<nombre>.md` |

Si dudás, leé el README específico de cada subcarpeta — cada uno tiene una sección "Cuándo NO crear acá" que ayuda a descartar.

---

## Convención multi-agente

Cada agente (Claude Code, Cursor, etc.) tiene su propia carpeta de configuración en la raíz del proyecto:

```
.claude/rules    → ~/.fremi/framework/framework/rules         (symlink)
.claude/skills   → ~/.fremi/framework/framework/skills        (symlink)
.claude/hooks    → ~/.fremi/framework/framework/hooks         (symlink)
.claude/settings → ~/.fremi/framework/framework/settings      (symlink)
.cursor/...      → ~/.fremi/framework/framework/...           (symlink)
```

**Regla:** nunca editar archivos a través de los symlinks pensando que son específicos del agente. Son compartidos por todos. Si una configuración es específica del agente (ej: settings de UI), va dentro de `.claude/settings.local.json` (no versionado), no acá.

---

## Quién consume qué

| Archivo / Carpeta | Lo lee | Cuándo |
|---|---|---|
| `CLAUDE.md` (raíz) | Claude Code (agente principal) | Al inicio de cada sesión. Es el punto de entrada. |
| `rules/workflow.md` | IA, vía referencia desde `CLAUDE.md` | Antes de cualquier acción no trivial. |
| `skills/<X>/SKILL.md` | IA | Cuando el usuario invoca `/X`. |
| `hooks/<X>.sh` | Harness del agente | Automáticamente en eventos. |
| `settings/methodology.json` | Skills (en su Paso 0) | Cada vez que un skill se ejecuta. |
| `plugins/<X>.json` | Plugin externo | Según el plugin. |

---

## Convención para los READMEs de cada subcarpeta

Cada subcarpeta tiene un `README.md` con esta estructura:

1. **Aviso** de que la carpeta es config para agentes (no docs lineal).
2. **Contenido** — tabla con los archivos reales que hay.
3. **Quién lee estos archivos** — qué skill/hook/agente los consume.
4. **Convenciones** específicas de la carpeta.
5. **Cómo agregar uno nuevo** — checklist.
6. **Anti-patrones** — qué NO meter acá.

Si agregás archivos a una subcarpeta, sumarlos en la tabla de Contenido del README correspondiente.

---

## Anti-patrones de `~/.fremi/framework/framework/`

- ❌ Mezclar config con documentación humana sin separarlas (la docs humana va en `README.md`, la config en archivos estructurados).
- ❌ Crear subcarpetas nuevas sin documentar acá ni en CLAUDE.md.
- ❌ Editar archivos a través de symlinks (`.claude/rules/...`) — siempre editar la fuente en `~/.fremi/framework/framework/`.
- ❌ Duplicar configuración entre `.claude/` y `~/.fremi/framework/framework/` (uno debe ser symlink del otro, nunca copia).
