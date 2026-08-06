# scripts/

Shell scripts referenced from `../hooks/hooks.json`. Kept next to the
hooks manifest so relative paths resolve cleanly at plugin install time.

**Naming convention** (mirrors Engram): one script per event, `kebab-case.sh`.

  session-start.sh
  post-compaction.sh
  user-prompt-submit.sh
  subagent-stop.sh
  session-stop.sh
  _helpers.sh                (shared functions)

**Status v0.3.0**: empty. The single bootstrap check runs via `fremi verify`
(the CLI binary), invoked directly from `~/.claude/settings.json`. When
we grow into a full plugin distribution these scripts appear here.
