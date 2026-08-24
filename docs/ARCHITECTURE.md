# Architecture

## Overview

`fremi-framework` is a CLI + framework distribution system. Two orthogonal layers:

1. **CLI (`fremi` binary)** — small TypeScript program compiled to a per-platform native binary with Bun. Handles two commands today: `version` and `install [path]`.
2. **Framework (content)** — the actual skills, hooks, rules, flows, pipelines, configs. Lives under `framework/` in this repo. NOT compiled into the binary — it's the tree that gets clone'd by `install.sh` to `~/.fremi/framework/`.

Both are versioned together (`VERSION` file at repo root). One tagged git release = one version of both.

## Install flow

```
User runs: curl -sL .../install.sh | bash
   ↓
install.sh:
   1. Clones (or updates) fhidalgoGC/homebrew-tap → ~/.fremi/framework/
   2. Reads VERSION
   3. Downloads bin/fremi-<platform>-<arch> from GitHub Releases → ~/.local/bin/fremi
   4. Verifies PATH
```

## Runtime flow: `fremi install [path]`

```
User runs: cd my-project && fremi install
   ↓
fremi (binary):
   1. Resolves target path (arg or CWD)
   2. Locates the framework content via getFrameworkContentRoot()
      → default: ~/.fremi/framework/framework/
   3. For each subsystem, calls a core module:
      · install-skills.ts   → symlinks .claude/skills/fremi-*
      · install-hooks.ts    → merges hook entries into .claude/settings.json
      · install-claude-md.ts → creates/updates CLAUDE.md with fremi block
      · init-docs-works.ts  → creates docs/works/{product,features,extra,enablers}/
      · init-config.ts      → creates .fremi/config.yaml with project defaults
   4. Reports summary
```

## Framework content layout (inside `framework/`)

```
framework/
├── skills/                     ← organized by layer (Regla 21)
│   ├── product/
│   │   ├── SKILL.md            → /fremi-product
│   │   └── skills/<sub>/       → /fremi-product-<sub>
│   ├── feature/
│   ├── story/
│   ├── enabler/
│   ├── tools/
│   └── <global>/               → /fremi-<name>
├── reverse-engineering/        → /fremi-reverse-<name>
├── installs/install-framework/ ← legacy — the CLI replaces most of it
├── hooks/                      ← *.sh, registered by install-hooks.ts
├── rules/
│   ├── workflow.md             ← Reglas 1-24 (flow forward)
│   └── reverse.md              ← Reglas 25-32 (reverse-engineering)
├── flows/                      ← descriptive: flow.<layer>.md
├── pipelines/                  ← 7 pipelines (forward + reverse)
├── settings/                   ← default configs
└── plugins/                    ← agent-specific bindings (empty for now — only claude)
```

## Skill discovery

`agents/claude/plugin-install.ts` walks `framework/artifacts/`, `framework/skills/` and `framework/reverse-engineering/` looking for `SKILL.md` files (descending into nested `skills/` dirs). It parses the `name:` frontmatter field and symlinks `<pluginRoot>/skills/<name>` → `<skill_dir>`.

Skills must have `name: fremi-<...>` per Regla 21. Skills without the prefix are skipped with an error.

Since v0.3.0 skills live at USER level inside the Claude Code plugin, not as per-project `.claude/skills/` symlinks. The old project-level `install-skills.ts` was removed in v0.4.17.

## Hook registration

`core/discover-hooks.ts` walks the whole framework tree for `hooks/` dirs — `framework/hooks/` (cross-domain) plus the per-domain ones under `artifacts/<layer>/`, `pipelines/<p>/` and `reverse-engineering/<skill>/`. Each hook declares its own wiring in its header comment:

```bash
# Tipo: PostToolUse                                    → the event
# Matcher (sugerido): { "tool_name": "Edit|Write", ... } → the matcher
```

`plugin-install.ts` groups them by event + matcher and writes `<pluginRoot>/hooks/hooks.json`, together with the SessionStart bootstrap entry (`fremi verify`). Consequences:

- Adding a hook anywhere in the framework needs no CLI change — drop the `.sh` in a `hooks/` dir with a `# Tipo:` header and re-run `fremi agent install`.
- Files prefixed with `_` are skipped: they are `source`-only bash libraries (`_methodology.sh`), not hooks.
- A hook with no valid `# Tipo:` header, or without the executable bit, is reported as skipped instead of failing at runtime.

Measured cost of the resulting wiring lives in `framework/hooks/README.md`.

## CLAUDE.md integration

`install-claude-md.ts` writes a block delimited by `<!-- fremi-framework:start -->` / `<!-- fremi-framework:end -->` markers. The block references the framework via absolute paths (`~/.fremi/framework/...`) so any AI agent reading `CLAUDE.md` at the project root has full context of what's available.

Content outside the markers is preserved — users can safely edit their `CLAUDE.md` around the block.

## Multi-platform strategy

- **Build**: Bun `--compile` produces native binaries for macOS (arm64/x64), Linux (x64/arm64), Windows (x64) — `scripts/build-all.sh`.
- **Distribute**: release is **manual** today (`.github/workflows/release.yml` is disabled). `scripts/release.sh publish` builds all 5 and runs `gh release create v$(cat VERSION)`. Then `Formula/fremi.rb` gets the new version, 4 urls and 4 sha256 (`scripts/release.sh sha256`).
- **Version bump in lockstep**: `VERSION`, `package.json`, `src/commands/version.ts` (`EMBEDDED_VERSION`) and `src/commands/agent-install.ts` (`FREMI_VERSION`). The last one names the plugin's install dir, so missing it installs under a stale version path.
- **Default branch is `develop`**, and both the Homebrew formula and the framework clone (`ensure-framework.ts`) read from it. There is no `main`-based release step.
- **Install**: `brew install fhidalgoGC/tap/fremi`, or `install.sh` (curl) / `install.ps1` (iwr), which detect platform+arch.

## Testing: the sandbox

`scripts/sandbox.sh` runs the CLI against a throwaway environment whose folders
mirror the two install levels one-to-one:

```
sandbox/
├── agent/     ← fake $HOME.   `fremi agent install` writes here   (real: ~/.claude)
├── project/   ← fake project. `fremi install` writes here         (real: your repo)
└── fremi/     ← throwaway framework clone, used by `update` only
```

What lands where, since v0.4.19: a project is self-contained. `fremi install`
writes `.claude/skills/` (one symlink per skill), `.claude/rules/` and the
framework's hooks into `.claude/settings.json`, next to `CLAUDE.md`, `.fremi/`
and `docs/works/`. Only two things stay user-level: the MCP server, which
answers about fremi itself rather than about any one project, and the
SessionStart bootstrap hook, which has to run in projects that never installed
fremi in order to report that it is inactive there.

**Every `bun run` script in this repo lands in the sandbox.** There is no
`bun run` path to your real `~/.claude` or `~/.fremi`; installing for real means
calling the `fremi` binary directly. `fremi_run()` enforces this by setting
`HOME=sandbox/agent` and running from `sandbox/project`, so even cwd-sensitive
commands (`verify`, `mcp`) answer about the sandbox project.

Actions come in two families. **CLI mirrors** — `agent-install`,
`agent-uninstall`, `install`, `uninstall`, `update`, `verify`, `version`,
`setting`, `mcp`, `help`, plus `run <args>` for anything without a mirror of its
own. **Lifecycle** — `reset`, `tree`, `clean`, `cycle`. `clean` asserts zero
residue at both levels and exits non-zero otherwise, so `cycle`
(reset → install → tree → uninstall → clean) is a real pass/fail gate.

Every action drives the same CLI a user would run — nothing is faked with
`rm -rf`. The one deliberate difference: `FREMI_HOME` points at the repo, so the
sandbox exercises the LOCAL `framework/` content instead of the published clone.
The clone path is covered by installing via brew. `update` is the exception:
`fremi update` is a `git pull` inside `FREMI_HOME`, and pulling this repo
mid-work would rewrite the tree you are editing — so that action alone points
`FREMI_HOME` at `sandbox/fremi`.

The sandbox runs from TypeScript source by default — it exists for fast command
testing, so no compile step stands between an edit and a run.
`FREMI_RUNNER=binary` (or `bun run sandbox:cycle:binary`) compiles the
darwin-arm64 binary first for user fidelity; use it before a release.

## Roadmap

- **v0.1**: MVP with `version` + `install` for Claude Code.
- **v0.2**: Multi-agent support (Cursor, Windsurf). Adds `plugins/` bindings per agent.
- **v0.3**: Reimplement CLI in Go for smaller binaries + native cross-compilation (like Engram). Framework content is agent-agnostic and doesn't need to change.
- **v0.4**: `fremi update`, `fremi doctor`, `fremi status` diagnostic commands.
