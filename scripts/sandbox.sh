#!/usr/bin/env bash
# Sandbox lifecycle helpers — runs against the compiled binary (darwin-arm64)
# so each cycle exercises the same code path a real user would.
#
# Usage:  bash scripts/sandbox.sh <action>
# Actions:
#   reset      → rm -rf sandbox && mkdir sandbox
#   install    → build darwin-arm64 + install into ./sandbox
#   uninstall  → run uninstall against ./sandbox using the binary
#   tree       → list files/symlinks under ./sandbox
#   cycle      → reset + install + tree in one shot

set -e

ACTION="${1:?Usage: sandbox.sh <reset|install|uninstall|tree|cycle>}"
BINARY="./bin/fremi-darwin-arm64"

case "$ACTION" in
  reset)
    rm -rf sandbox
    mkdir sandbox
    echo "Fresh sandbox at ./sandbox — run \`bun run sandbox:install\` to install fremi there"
    ;;

  install)
    bash scripts/build.sh darwin-arm64
    "$BINARY" install ./sandbox
    ;;

  uninstall)
    "$BINARY" uninstall ./sandbox
    ;;

  tree)
    find sandbox -type f -o -type l 2>/dev/null | sort | head -50
    ;;

  cycle)
    bash scripts/sandbox.sh reset
    bash scripts/sandbox.sh install
    bash scripts/sandbox.sh tree
    ;;

  *)
    echo "Unknown action: $ACTION"
    echo "Usage: sandbox.sh <reset|install|uninstall|tree|cycle>"
    exit 1
    ;;
esac
