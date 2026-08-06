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

`install-skills.ts` walks `framework/skills/`, `framework/reverse-engineering/`, and `framework/installs/` looking for `SKILL.md` files. It parses the `name:` frontmatter field and creates a symlink at `.claude/skills/<name>` → `<skill_dir>`.

Skills must have `name: fremi-<...>` per Regla 21. Skills without the prefix are skipped with an error.

## Hook registration

`install-hooks.ts` reads all `*.sh` under `framework/hooks/` and adds them to `.claude/settings.json` under `hooks.PostToolUse[]` with a generic `Edit|Write` matcher. Existing entries are preserved (matched by absolute path).

**Future** (v0.2+): each hook will declare its own event and matcher in its header comment (e.g. `# Event: PostToolUse`, `# Matcher: docs/works/**/*.md`) and `install-hooks.ts` will honor them.

## CLAUDE.md integration

`install-claude-md.ts` writes a block delimited by `<!-- fremi-framework:start -->` / `<!-- fremi-framework:end -->` markers. The block references the framework via absolute paths (`~/.fremi/framework/...`) so any AI agent reading `CLAUDE.md` at the project root has full context of what's available.

Content outside the markers is preserved — users can safely edit their `CLAUDE.md` around the block.

## Multi-platform strategy

- **Build**: Bun `--compile` produces native binaries for macOS (arm64/x64), Linux (x64/arm64), Windows (x64).
- **Distribute**: GitHub Actions workflow (`.github/workflows/release.yml`) builds all 5 on every tag push and uploads to GitHub Releases.
- **Install**: `install.sh` (curl) for macOS/Linux, `install.ps1` (iwr) for Windows. Both detect platform+arch and pull the correct binary.

## Roadmap

- **v0.1**: MVP with `version` + `install` for Claude Code.
- **v0.2**: Multi-agent support (Cursor, Windsurf). Adds `plugins/` bindings per agent.
- **v0.3**: Reimplement CLI in Go for smaller binaries + native cross-compilation (like Engram). Framework content is agent-agnostic and doesn't need to change.
- **v0.4**: `fremi update`, `fremi doctor`, `fremi status` diagnostic commands.
