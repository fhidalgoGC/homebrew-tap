#!/usr/bin/env bash
# Release helpers — build all 5 targets and publish to GitHub via gh CLI.
#
# Usage:  bash scripts/release.sh <action>
# Actions:
#   publish  → build all + gh release create v$(cat VERSION) with the binaries
#   sha256   → print SHA256 of every binary under bin/

set -e

ACTION="${1:?Usage: release.sh <publish|sha256>}"

case "$ACTION" in
  publish)
    VERSION="$(cat VERSION | tr -d '[:space:]')"
    bash scripts/build-all.sh
    gh release create "v${VERSION}" bin/fremi-* \
      --repo fhidalgoGC/homebrew-tap \
      --title "v${VERSION}" \
      --generate-notes
    ;;

  sha256)
    shasum -a 256 bin/fremi-*
    ;;

  *)
    echo "Unknown action: $ACTION"
    echo "Usage: release.sh <publish|sha256>"
    exit 1
    ;;
esac
