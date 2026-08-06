#!/usr/bin/env bash
# Wrapper for `bun run fremi:install` — supports optional --init flag.
# --init  → wipes ./sandbox before installing (fresh state).
# Without → installs on top of whatever ./sandbox currently has (idempotent
#          re-run showing which artifacts were "unchanged" vs "recreated").

set -e

if [[ " $* " == *" --init "* ]]; then
  echo "==> --init detected: wiping ./sandbox before install"
  rm -rf sandbox
fi

mkdir -p sandbox
exec bun run src/index.ts install ./sandbox
