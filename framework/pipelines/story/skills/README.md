# skills/

Sub-skills orchestrated by this pipeline. The authoritative list lives
in `config.core.yaml → invokes`. This folder may contain:
  - Symlinks to each invoked skill (for quick navigation from the
    pipeline folder), OR
  - Pipeline-specific micro-skills (rare — most skills live under
    `~/.fremi/framework/skills/<layer>/skills/`).

Prefer symlinks over duplication so a single canonical SKILL.md exists.
