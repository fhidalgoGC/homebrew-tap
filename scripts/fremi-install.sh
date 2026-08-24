#!/usr/bin/env bash
# Thin alias kept for muscle memory — the sandbox lifecycle lives in
# scripts/sandbox.sh, which isolates HOME so testing never touches your
# real ~/.claude.
#
#   --init  → wipe the sandbox first (fresh state)
#
# Prefer calling sandbox.sh directly:
#   bun run sandbox:cycle     reset + install + tree + uninstall + verify

set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ " $* " == *" --init "* ]]; then
  bash "$HERE/sandbox.sh" reset
fi
exec bash "$HERE/sandbox.sh" install
