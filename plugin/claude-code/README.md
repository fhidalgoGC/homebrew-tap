# Claude Code plugin — fremi

Distribution layout for the Claude Code agent. Files here follow the
plugin format Claude Code recognises under `~/.claude/plugins/cache/<plugin>/<plugin>/<version>/`.

## Layout

```
claude-code/
├── .claude-plugin/plugin.json      Plugin metadata (name, version, author, license, ...)
├── .mcp.json                       MCP server declarations (empty until we add one)
├── hooks/hooks.json                Event → command bindings that Claude Code loads
├── scripts/                        Shell scripts referenced by hooks/
└── skills/<name>/SKILL.md          One folder per skill
```

## How content gets here

The **source of truth** for skills, rules, hooks and settings is
`framework/` at the repo root. The `fremi` CLI (`fremi agent install`)
materialises the Claude-Code-shaped view of that content into the user's
`~/.claude/` directory — reading from `framework/` and writing at
install time.

The `plugin/claude-code/` scaffold exists so we can either:
  a) Ship a pre-assembled plugin (the way Engram does it via a
     marketplace repo), or
  b) Reference this layout as the canonical spec for what
     `fremi agent install` should produce.

For v0.3.0 we chose (b) — the CLI writes to `~/.claude/` directly. If we
later add a marketplace-style distribution, this folder is where the
assembled plugin lives.
