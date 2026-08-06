# CLAUDE.md — fremi-framework

Este es el repo del **framework `fremi`** — un CLI + framework Product Discovery + SDD + BDD + TDD para AI coding agents. Distribución vía `curl | bash` o `iwr | iex` (multi-plataforma).

- **Repo GitHub**: `git@github.com:fhidalgoGC/gc-framework.git`
- **Rama activa**: `develop`
- **Versión**: `0.1.0` (ver `VERSION`)
- **Documento técnico**: `docs/ARCHITECTURE.md`

## Cómo arrancar una sesión en este proyecto

1. **Recuperá contexto persistente** — hay historial completo del bootstrap en Engram:

   ```
   mem_search query="fremi-framework handoff" all_projects=true
   mem_get_observation id=<n>               # leer el contenido completo (~7KB)
   ```

   **Importante**: el handoff se guardó desde otra sesión (basename cwd = `makingfilereport` en ese momento). Por eso hay que usar `all_projects=true` o `project="makingfilereport"`. El topic key es `fremi-framework/handoff-context`.

   Una vez recuperado, saveá un mem_save nuevo con `topic_key: "fremi-framework/handoff-context"` desde esta sesión (project auto-detectado como `fremi-framework`) para que futuras búsquedas locales lo encuentren directo.

2. **Estado esperado del repo al arrancar**:

   ```
   Rama:     develop
   Commit:   6ee6588 (root — feat: initial fremi-framework CLI + install scripts (v0.1.0))
   Remote:   origin → git@github.com:fhidalgoGC/gc-framework.git (sin push todavía)
   Tree:     clean
   ```

3. **Comandos MVP del CLI** (dos únicos por ahora):

   ```
   fremi version              # muestra versión + ubicación instalada
   fremi install [path]       # instala framework en un proyecto (path o CWD)
   ```

## Estructura del repo

```
fremi-framework/
├── VERSION, README.md, LICENSE, CHANGELOG.md, .gitignore
├── install.sh                       # bootstrap Mac/Linux (curl | bash)
├── install.ps1                      # bootstrap Windows (iwr | iex)
├── bin/fremi                        # dev wrapper bash — requiere bun
├── src/                             # TypeScript source del CLI
│   ├── index.ts                     # entry point + router
│   ├── commands/{version,install}.ts
│   └── core/{paths,install-skills,install-hooks,install-claude-md,init-docs-works,init-config}.ts
├── framework/                       # ← el framework en sí (skills, hooks, rules, flows, pipelines, settings)
│   ├── skills/                      # organizados por capa (Regla 21)
│   ├── reverse-engineering/         # 6 skills reverse con 25 template symlinks
│   ├── hooks/                       # 12 hooks .sh
│   ├── rules/workflow.md + reverse.md
│   ├── flows/flow.<capa>.md
│   ├── pipelines/                   # 3 forward + 4 reverse
│   └── settings/                    # config.yaml master + config.<capa>.yaml
├── docs/ARCHITECTURE.md
├── package.json, tsconfig.json      # bun compile config
└── .github/workflows/release.yml    # CI multi-plataforma en tag v*.*.*
```

## Reglas del framework

Las **reglas duras** del framework se mantienen dentro de `framework/rules/`:

- `framework/rules/workflow.md` — Reglas 1-24 (flow forward).
- `framework/rules/reverse.md` — Reglas 25-32 (reverse-engineering).

**Nota importante**: estas reglas aplican a proyectos que **consumen** el framework via `fremi install`. Al desarrollar el framework en sí (este repo), las reglas se leen como referencia — no se ejecuta el flow de stories acá.

## Stack técnico

- **Lenguaje**: TypeScript (strict, ESNext)
- **Runtime/build**: Bun (`bun run dev`, `bun run build:<target>`, `bun run typecheck`)
- **Distribución**: binarios compilados con `bun build --compile` por plataforma (5 targets: darwin-arm64/x64, linux-x64/arm64, windows-x64)
- **Roadmap**: en v0.3 posible reimplementación en Go o Python para binarios más chicos

## Próximos pasos pendientes

1. `git push -u origin develop` (primer push al remoto).
2. Instalar Bun si no está: `curl -fsSL https://bun.sh/install | bash`.
3. Testear dev: `./bin/fremi version` + `./bin/fremi install /tmp/test-project`.
4. `bun run typecheck` + `bun run build:darwin-arm64` (o target local).
5. Tag `v0.1.0` + push → CI compila los 5 binarios y crea GitHub Release.
6. Testear instalación real desde curl.
7. Ejecutar `fremi install` en `makingFileReport` (viejo consumidor) y verificar enganches.
8. Al confirmar: borrar `docs/frmwk/` de `makingFileReport`.

## Convenciones de commits

Estilo conventional-commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

Cuando committee Claude, incluir footer:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```
