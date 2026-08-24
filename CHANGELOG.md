# Changelog

> Nota: las releases 0.1.1 → 0.4.16 no quedaron registradas acá (el changelog se
> dejó de actualizar después de la 0.1.0). A partir de 0.4.17 se retoma, orden
> newest-first.

## [0.4.19] — 2026-08-24

Un proyecto ahora carga su propio fremi: skills, rules y hooks viven en el
proyecto, y el home de la máquina queda con lo mínimo.

### Changed
- **Un proyecto ahora es autocontenido.** `fremi install` escribe
  `.claude/skills/` (un symlink por skill), `.claude/rules/` y los hooks del
  framework dentro de `.claude/settings.json` del proyecto. Antes los 50
  skills vivían en el plugin de nivel usuario, así que aparecían en TODOS los
  proyectos de la máquina hubieran instalado fremi o no.
- En el nivel usuario quedan sólo dos cosas: el **MCP** (`~/.claude/mcp/fremi.json`),
  que responde sobre fremi mismo — versión, estado — y no sobre un proyecto en
  particular; y el **hook bootstrap de SessionStart** (`fremi verify`), que
  justamente tiene que correr en proyectos que NO instalaron fremi para
  avisar que está inactivo. El plugin, el marketplace y el registro siguen
  donde estaban.
- Los hooks del framework se registran en UN solo lugar (el proyecto). Antes
  estaban en el `hooks.json` del plugin; dejarlos en los dos niveles los
  dispararía dos veces por evento.
- `fremi uninstall` limpia lo nuevo: saca los symlinks que apuntan al
  framework y las entradas de hook que son suyas, y respeta los skills, rules
  y hooks que el proyecto haya agregado a mano.

### Added
- Una acción de sandbox por CADA comando del CLI: `sandbox:agent:install`,
  `sandbox:agent:uninstall`, `sandbox:install`, `sandbox:uninstall`,
  `sandbox:update`, `sandbox:verify`, `sandbox:version`, `sandbox:setting`,
  `sandbox:mcp`, `sandbox:help`, más `run <args>` (y `bun run dev`) como
  passthrough para cualquier comando que se agregue después.

### Changed
- **Las carpetas del sandbox ahora espejan los dos comandos**: `sandbox/agent/`
  (lo que escribe `fremi agent install`, antes el oculto `.home/`) y
  `sandbox/project/` (lo que escribe `fremi install`). El nombre `.home` no
  decía a qué comando correspondía y se prestaba a leer `.claude` como algo
  del proyecto.
- **Todo `bun run` es sandbox.** Se eliminó la familia `fremi:*` de
  package.json junto con `scripts/fremi-run.sh` y `scripts/fremi-install.sh`:
  `fremi:agent:install`, `fremi:agent:uninstall` y `fremi:update` corrían el
  CLI SIN aislar `HOME`, o sea que instalaban de verdad en el `~/.claude` del
  desarrollador con un nombre que parecía de prueba. `bun run dev` tenía el
  mismo agujero. Para instalar en serio, el binario `fremi` y nada más.
- El sandbox corre el CLI parado en `sandbox/project`, así los comandos que
  dependen del cwd (`verify`, `mcp`) responden sobre el proyecto del sandbox y
  no sobre este repo.
- `sandbox:update` usa su propio `FREMI_HOME` (`sandbox/fremi`, un clone
  descartable). `fremi update` es un `git pull` adentro de `FREMI_HOME`, y con
  el default del sandbox eso era un pull sobre ESTE repo, en medio del trabajo.
- El assert de residuo cero pasó de `sandbox:verify` a `sandbox:clean`, para
  que `sandbox:verify` signifique lo mismo que `fremi verify` como todos los
  demás mirrors.

### Fixed
- `fremi verify` colgaba para siempre cuando stdin era un pipe que nadie
  cerraba. `readStdinWithTimeout` resolvía su promesa a los 500 ms pero dejaba
  los listeners de stdin puestos, y eso mantiene vivo el event loop. Como
  `fremi verify` ES el hook de `SessionStart`, sobrevivía sólo gracias al
  timeout de 5s de Claude Code. Ahora desengancha y pausa stdin al terminar.

## [0.4.18] — 2026-08-24

`fremi uninstall` puede no dejar rastro, y el sandbox pasa a probar de verdad
el ciclo completo en un entorno aislado.

### Added
- `fremi uninstall --purge` — borra todo `.fremi/` (settings + catalog), no
  sólo el `config.user.yaml`. Antes el install creaba 12 archivos y el
  uninstall borraba 1, así que quedaban 11 huérfanos que el summary no
  nombraba.
- `fremi uninstall --with-user` (alias `--all`) — encadena la limpieza de
  nivel usuario (skills, hooks.json, registry, marketplace, mcp, marker), así
  que un solo comando deja el sistema sin fremi para NINGÚN proyecto. Implica
  `-y`.
- `bun run sandbox:verify` — assert de residuo cero en los dos niveles; sale
  con código 1 si queda algo. Probado en positivo y en negativo, así que
  `sandbox:cycle` es un gate real de pass/fail.
- El sandbox corre desde TypeScript por default (es para probar comandos
  rápido). `bun run sandbox:cycle:binary` (`FREMI_RUNNER=binary`) compila
  el binario primero, para fidelidad de usuario antes de un release.
- `docs/ARCHITECTURE.md`: sección de sandbox + secciones de skills/hooks
  reescritas (describían `install-skills.ts` e `install-hooks.ts`, borrados en
  v0.4.17, y llamaban "Future (v0.2+)" al header `# Tipo:` que ya está
  implementado).

### Fixed
- El MCP se registraba apuntando a `which fremi` — o sea al binario de brew —
  aunque el install lo estuviera corriendo otro binario. Un dev build, o el
  sandbox, escribían en `~/.claude/mcp/fremi.json` una ruta ajena a lo que se
  estaba probando. Ahora se registra lo que REALMENTE está corriendo: el
  binario compilado, o `bun <repo>/src/index.ts` cuando se corre desde
  fuente. Si el binario vive detrás de un symlink estable en PATH que apunta
  a una ruta version-pinned (brew: `bin/fremi` → `Cellar/fremi/X.Y.Z/bin/fremi`)
  se prefiere el symlink, así la entrada sobrevive a `brew upgrade`.

### Changed
- **El sandbox ahora aísla `HOME`**: `sandbox/.home/` recibe el plugin, los
  skills y el MCP, y `sandbox/project/` es el proyecto. Antes los scripts
  corrían con el HOME real, así que cada prueba reescribía el `~/.claude` del
  desarrollador — y el `uninstall` del sandbox no podía verificar el nivel
  usuario porque no era suyo.
- `sandbox:uninstall` corre `fremi uninstall --purge --all`: los dos niveles,
  vía el CLI real. Ninguna acción del sandbox falsea el resultado con
  `rm -rf`; lo único deliberadamente distinto es `FREMI_HOME`, que apunta al
  repo para que se prueben los cambios locales del framework.
- El summary de `fremi uninstall` ahora lista archivo por archivo lo que dejó
  en `.fremi/` y sugiere `--purge`. Antes decía "Preserved: .fremi/settings/"
  y se leía como "no quedó nada".
- `docs/works/` sigue intocable con o sin flags — es el trabajo real del
  usuario, no andamiaje del framework.

## [0.4.17] — 2026-08-24

Los hooks del framework vuelven a estar vivos: el instalador los descubre y los
registra solo, por dominio.

### Added
- `src/core/discover-hooks.ts` — descubrimiento de hooks recorriendo TODO el
  árbol del framework (`framework/hooks/` + `artifacts/<capa>/hooks/` +
  `pipelines/<p>/hooks/` + `reverse-engineering/<skill>/hooks/`). Cada hook
  declara su evento en el header (`# Tipo:` / `# Tipo recomendado:`) y su
  matcher (`# Matcher (sugerido): { "tool_name": ... }`), así que agregar un
  hook nuevo NO requiere tocar el CLI.
- El `hooks.json` del plugin ahora lleva el bootstrap (`SessionStart` →
  `fremi verify`) **más los 29 hooks del framework**, agrupados por evento y
  matcher. Antes sólo se registraba el bootstrap: toda la capa de hooks estaba
  inerte en una instalación real.
- El instalador reporta como `skipped` (no registra) los hooks sin header
  `# Tipo:` válido y los que no tienen bit de ejecución — antes esas dos cosas
  fallaban recién en runtime.

### Fixed
- `chmod +x` en los 13 hooks de `pipelines/*/hooks/` y
  `reverse-engineering/*/hooks/` que se habían creado sin bit de ejecución.
- Bloque de CLAUDE.md: apuntaba a `.claude/rules/workflow.md` y
  `.claude/rules/reverse.md`, dos paths que ningún paso del install creaba
  (herencia del install project-level, muerto desde v0.3.0). Ahora apunta a los
  paths reales del framework e indica que las reglas de dominio se cargan
  selectivamente vía el `applies.yaml` de cada capa.
- Refs a `framework/hooks/sync-checkwork.sh` en el skill `checkwork` y su
  template — el hook se movió a `artifacts/story/hooks/` en el refactor de
  layout.
- `framework/hooks/README.md`: la sección de registro describía un
  `.claude/settings.json` a mano; ahora documenta el `hooks.json` del plugin y
  el contrato del header.

### Removed
- Código muerto sin importadores desde v0.3.0, que además apuntaba al layout
  viejo: `src/core/install-hooks.ts`, `install-rules.ts`,
  `uninstall-hooks.ts`, `uninstall-rules.ts`.

## [0.1.0] — 2026-08-05

Initial release.

### Added
- CLI `fremi` (compiled with Bun for macOS/Linux/Windows).
- `fremi version` — shows installed version.
- `fremi install [path]` — installs framework enganches into a project.
- `install.sh` (bash bootstrap for macOS/Linux).
- `install.ps1` (PowerShell bootstrap for Windows).
- Framework migrated from `makingFileReport/docs/frmwk/`:
  - 60+ skills across product/feature/story/enabler/tools/reverse layers.
  - 12 hooks (Regla 17, 32, framework compliance).
  - Rules: `workflow.md` (Reglas 1-24) + `reverse.md` (Reglas 25-32).
  - 7 pipelines (forward + reverse).
  - 6 reverse-engineering skills.
  - Configs per-layer + default config.yaml.
