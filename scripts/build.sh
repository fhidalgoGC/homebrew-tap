#!/usr/bin/env bash
# Compile the fremi CLI to a standalone binary for a single target.
# Usage:  bash scripts/build.sh <target>
# Targets: darwin-arm64 | darwin-x64 | linux-x64 | linux-arm64 | windows-x64
#
# The output goes to bin/fremi-<target>[.exe on Windows]. Temporary
# .bun-build files are swept before and after so nothing accumulates.

set -e

TARGET="${1:?Usage: build.sh <target> — e.g. darwin-arm64}"

# Windows is the only target that keeps the .exe extension in the outfile.
if [ "$TARGET" = "windows-x64" ]; then
  EXT=".exe"
else
  EXT=""
fi

bash scripts/clean-cache.sh
bun build ./src/index.ts \
  --compile \
  --target="bun-${TARGET}" \
  --outfile "bin/fremi-${TARGET}${EXT}"
bash scripts/clean-cache.sh
