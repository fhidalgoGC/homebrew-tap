# Plugin distribution — per-agent scaffolds

Each subdirectory targets one **AI coding agent** and holds the plugin
manifest that agent expects. Adding a new agent means adding a new
folder here with the layout that agent's runtime understands. The
`framework/` at the repo root is the SOURCE OF TRUTH (skills, rules,
hooks, settings). Each `plugin/<agent>/` folder is the DIST TARGET for
that agent's plugin format.

## Current layout

```
plugin/
└── claude-code/          Claude Code plugin format (skills, hooks, MCP)
```

## Planned agents (v0.3.x → v0.4.x)

| Folder | Agent | Format ref |
|---|---|---|
| `cursor/`   | Cursor            | `.cursor/rules/*.mdc` + MCP config |
| `windsurf/` | Windsurf          | (TBD once we investigate) |
| `aider/`    | Aider             | (TBD) |
| `codex/`    | GitHub Copilot / Codex CLI | (TBD) |
| `opencode/` | OpenCode          | (TBD) |
| `obsidian/` | Obsidian          | (TBD — memory / notes bridge) |

Each new agent gets its own directory following the same pattern:
metadata + hooks + scripts + skills (or whatever primitives that agent
uses). The main `fremi` CLI orchestrates content from `framework/` into
each agent's expected format when a user runs `fremi agent install`.
