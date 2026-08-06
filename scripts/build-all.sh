#!/usr/bin/env bash
# Compile the fremi CLI to all 5 supported targets.
# Sweeps the bun cache before starting and after the last build.

set -e

bash scripts/clean-cache.sh

for target in darwin-arm64 darwin-x64 linux-x64 linux-arm64 windows-x64; do
  bash scripts/build.sh "$target"
done

bash scripts/clean-cache.sh

echo ""
echo "✓ All 5 targets built:"
ls -lh bin/fremi-*
