# skills/

One folder per skill, each containing `SKILL.md` with frontmatter and
prose. Claude Code loads every `SKILL.md` under the plugin's `skills/`
tree automatically.

Layout:

```
skills/
├── <skill-name>/
│   ├── SKILL.md              Required — frontmatter + protocol
│   └── references/           Optional — templates, examples
└── ...
```

Frontmatter contract:

```yaml
---
name: fremi-<slug>            Skill invocation name (Regla 21 in workflow.md)
description: "…"              Short one-liner shown in the picker
---
```

**Status v0.3.0**: empty. Skills live at `framework/skills/**` and the
CLI symlinks them into `~/.claude/skills/fremi-*` at install time. When
we assemble a marketplace-style plugin we'll copy or symlink them here
so a single `.tar.gz` (or git ref) carries the plugin end to end.
