#!/usr/bin/env bash
# Remove bun's temporary .*.bun-build sidecar files at repo root.
# --compile occasionally leaves these behind (~63MB each), so we sweep
# before and after every build to keep the workspace tidy.

find . -maxdepth 1 -name ".*.bun-build" -type f -delete 2>/dev/null || true
