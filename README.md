# fremi-framework

**Product Discovery + SDD + BDD + TDD framework** for AI coding agents.

`fremi` is a small CLI that installs the framework into any project so an AI agent (Claude Code today; Cursor / Windsurf / other agents later) can follow a disciplined workflow: **PRODUCT → FEATURE → USER STORY**, with reverse-engineering support for pre-existing code.

- **Repo**: [`fhidalgoGC/homebrew-tap`](https://github.com/fhidalgoGC/homebrew-tap)
- **License**: MIT
- **Supported agents**: Claude Code (v0.1.x). Cursor / Windsurf planned.

---

## Install

### macOS — Homebrew (recommended)

```bash
brew install fhidalgoGC/tap/fremi
```

### macOS / Linux — curl

```bash
curl -sL https://raw.githubusercontent.com/fhidalgoGC/homebrew-tap/main/install.sh | bash
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/fhidalgoGC/homebrew-tap/main/install.ps1 | iex
```

**Dependencies**: the `curl`/`iwr` installers auto-detect missing `git` and offer to install it (via `brew` on macOS, `apt`/`dnf`/`pacman`/`apk` on Linux, or `winget` on Windows). To skip prompts in CI or automation, set `FREMI_ASSUME_YES=1` (bash) or `$env:FREMI_ASSUME_YES = "1"` (PowerShell).

### Verify

```bash
fremi version
# fremi-framework v0.1.1
```

With `brew install` the binary is on your PATH immediately. With `curl | bash` you may need to open a new shell (or `source ~/.zshrc`) if `~/.local/bin` was not previously in PATH.

---

## Use

Inside any project directory:

```bash
cd my-project/
fremi install
```

Or pointing to a specific project:

```bash
fremi install ~/code/my-project
```

That single command:

1. Creates symlinks in `.claude/skills/fremi-*` pointing to the installed framework.
2. Registers hooks in `.claude/settings.json` (merges non-destructively).
3. Creates/validates `CLAUDE.md` at the project root.
4. Initializes `docs/works/` (empty `product/`, `features/`, `extra/`, `enablers/`).
5. Creates `.fremi/config.yaml` with project defaults.

The install is **idempotent** — you can run it as many times as needed.

---

## Architecture

```
~/.fremi/framework/         ← framework source (this repo, cloned by installer)
  ├── framework/            ← the actual framework content
  │   ├── skills/           ← 60+ skills exposed as /fremi-*
  │   ├── hooks/            ← 12 hooks (Regla 17, 32, etc.)
  │   ├── rules/            ← rules/workflow.md, rules/reverse.md
  │   ├── flows/            ← flow.<layer>.md
  │   ├── pipelines/        ← 7 pipelines (auto-execution)
  │   ├── reverse-engineering/ ← 6 reverse skills
  │   └── settings/         ← default config.yaml
  └── bin/fremi             ← CLI binary

~/.local/bin/fremi          ← symlink to the CLI binary (on macOS/Linux)
```

Each project consumes the framework via lightweight enganches (symlinks, hooks, CLAUDE.md pointer).

---

## Commands

| Command | What it does |
|---|---|
| `fremi version` | Prints the installed framework version. |
| `fremi install [path]` | Installs framework enganches into project. `[path]` defaults to `$PWD`. |
| `fremi uninstall [path]` | Removes framework enganches (skills, hooks, CLAUDE.md block). Preserves `docs/works/` and `.fremi/config.yaml` (user data). |

More commands (`fremi update`, `fremi status`, `fremi doctor`) coming as needed.

---

## Uninstall

From a project (remove enganches only, keep `docs/works/` and `.fremi/config.yaml`):

```bash
fremi uninstall
```

Remove fremi from the system:

```bash
# Homebrew install:
brew uninstall fremi
brew untap fhidalgoGC/tap
rm -rf ~/.fremi

# curl install (macOS / Linux):
rm -rf ~/.fremi ~/.local/bin/fremi

# Windows:
# delete %USERPROFILE%\.fremi\ and %LOCALAPPDATA%\Programs\fremi\fremi.exe
```

---

## Development

```bash
git clone git@github.com:fhidalgoGC/homebrew-tap.git
cd homebrew-tap
bun install
bun run dev version                    # test CLI without building
bun run build:darwin-arm64             # compile for local machine
```

---

## Roadmap

- **v0.1** — Claude Code only, macOS/Linux/Windows (via Bun compile).
- **v0.2** — Multi-agent (Cursor, Windsurf).
- **v0.3** — Reimplemented in Go for smaller binary + native cross-compilation (like Engram).

---

## Credits

Framework methodology and design: `fhidalgoGC`.
Skills structure and reverse-engineering vía inspired by SDD (Spec-Driven Development) + OpenSpec.
