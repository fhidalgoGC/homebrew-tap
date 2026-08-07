# references/

Templates and reference artifacts specific to this pipeline. Empty by
default — pipelines typically don't need their own templates because
they invoke sub-skills that already own theirs (Regla 19).

Use this folder if the pipeline needs:
  - Custom report templates (post-execution summaries).
  - Inline prompt snippets that don't fit in PIPELINE.md.
  - Fixtures for stop-event examples.

Anything living here MUST be referenced explicitly from PIPELINE.md.
