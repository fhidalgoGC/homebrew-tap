# hooks/

Claude Code hooks manifest. When we ship this as an assembled plugin, a
`hooks.json` here declares which events fire which scripts (see
`../scripts/`).

Schema example (from Engram):

```json
{
  "description": "…",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/session-start.sh",
            "timeout": 10
          }
        ]
      }
    ],
    "UserPromptSubmit": [...],
    "SubagentStop": [...],
    "Stop": [...]
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` is expanded by Claude Code to the plugin's
install path.

**Status v0.3.0**: empty. `fremi agent install` writes the one SessionStart
hook directly into `~/.claude/settings.json` with an absolute path to
`fremi verify` — no plugin-format hooks.json needed yet.
