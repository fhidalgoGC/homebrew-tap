#!/usr/bin/env bash
# Run the fremi CLI from source (no compile step). Fast for iteration.
# Any extra args are passed through to fremi.
#
# Examples:
#   bash scripts/fremi-run.sh version
#   bash scripts/fremi-run.sh help
#   bash scripts/fremi-run.sh install ./sandbox
#   bash scripts/fremi-run.sh uninstall ./sandbox
#   bash scripts/fremi-run.sh update

exec bun run src/index.ts "$@"
