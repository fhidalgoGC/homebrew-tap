# Changelog

> Nota: las releases 0.1.1 → 0.4.16 no quedaron registradas acá (el changelog se
> dejó de actualizar después de la 0.1.0). A partir de 0.4.17 se retoma, orden
> newest-first.

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
