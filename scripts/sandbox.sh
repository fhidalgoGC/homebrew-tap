#!/usr/bin/env bash
# Sandbox lifecycle — simulates installing fremi in ANOTHER project, fully
# isolated from your real environment.
#
#   sandbox/
#   ├── .home/      ← fake $HOME: Claude plugin, skills, hooks.json, mcp, marker
#   └── project/    ← the "other project": CLAUDE.md, .fremi/, docs/works/
#
# Why the fake HOME: fremi installs at TWO levels. Without isolation, testing
# here would rewrite your real ~/.claude (skills + hooks for every project you
# open). With it, `sandbox uninstall` can prove it left zero trace — which is
# the whole point of the sandbox.
#
# Every action drives the REAL CLI, same code path as `fremi install` in your
# own project. Nothing here fakes the result with rm -rf.
#
# FREMI_HOME points at this repo, so the sandbox exercises your LOCAL framework
# content (edit a rule, re-install, see it) instead of the published clone.
#
# Usage:  bash scripts/sandbox.sh <action>
#   reset      → wipe and recreate sandbox/{.home,project}
#   install    → install both levels into the sandbox
#   uninstall  → uninstall both levels (--purge --all), leaving zero trace
#   tree       → show what exists at each level
#   verify     → assert the sandbox is clean (exit 1 if anything remains)
#   cycle      → reset + install + tree + uninstall + verify
#   setting    → open the settings TUI against the sandbox project
#
# Env:
#   FREMI_RUNNER=source   → run from TS source (fast iteration)
#   FREMI_RUNNER=binary   → compile darwin-arm64 first (default; user fidelity)

set -e

ACTION="${1:?Usage: sandbox.sh <reset|install|uninstall|tree|verify|cycle|setting>}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SANDBOX="$REPO/sandbox"
FAKE_HOME="$SANDBOX/.home"
PROJECT="$SANDBOX/project"
RUNNER="${FREMI_RUNNER:-binary}"

# Run the CLI with the sandbox environment applied.
fremi_run() {
  if [[ "$RUNNER" == "source" ]]; then
    HOME="$FAKE_HOME" FREMI_HOME="$REPO" bun run "$REPO/src/index.ts" "$@"
  else
    HOME="$FAKE_HOME" FREMI_HOME="$REPO" "$REPO/bin/fremi-darwin-arm64" "$@"
  fi
}

ensure_dirs() { mkdir -p "$FAKE_HOME" "$PROJECT"; }

ensure_binary() {
  [[ "$RUNNER" == "source" ]] && return 0
  bash "$REPO/scripts/build.sh" darwin-arm64
}

case "$ACTION" in
  reset)
    rm -rf "$SANDBOX"
    ensure_dirs
    echo "Fresh sandbox:"
    echo "  fake HOME: sandbox/.home"
    echo "  project:   sandbox/project"
    echo "Run \`bun run sandbox:install\` to install fremi there."
    ;;

  install)
    ensure_dirs
    ensure_binary
    echo "==> runner: $RUNNER   framework: $REPO/framework   HOME: sandbox/.home"
    echo ""
    fremi_run install "$PROJECT" --agent claude -y --with-mcp
    ;;

  uninstall)
    ensure_binary
    # --purge  → the whole .fremi/ tree, not just the master switch
    # --all    → chain the user-level uninstall (skills, hooks, mcp, marketplace)
    fremi_run uninstall "$PROJECT" --purge --all
    ;;

  tree)
    echo "########## PROJECT LEVEL (sandbox/project) ##########"
    if [[ -d "$PROJECT" ]]; then
      (cd "$PROJECT" && find . -not -path "*/.git/*" | sort | sed 's|^\./||;s|^|  |' | grep -v '^  $')
    else
      echo "  (does not exist)"
    fi
    echo ""
    echo "########## USER LEVEL (sandbox/.home) ##########"
    if [[ -d "$FAKE_HOME/.claude" ]]; then
      (cd "$FAKE_HOME" && find .claude -maxdepth 5 \
        -not -path "*/marketplaces/fremi/*" -not -path "*/skills/*" | sort | sed 's|^|  |')
      local_skills="$FAKE_HOME/.claude/plugins/cache/fremi/fremi"
      if [[ -d "$local_skills" ]]; then
        for v in "$local_skills"/*; do
          [[ -d "$v/skills" ]] && echo "  → $(basename "$v")/skills/: $(ls "$v/skills" | wc -l | tr -d ' ') symlinks into the framework"
        done
      fi
    else
      echo "  (nothing installed)"
    fi
    ;;

  verify)
    fail=0
    check_absent() {
      if [[ -e "$1" ]]; then echo "  ✗ LEFTOVER: ${1#$SANDBOX/}"; fail=1; else echo "  ✓ gone: ${1#$SANDBOX/}"; fi
    }
    check_present() {
      if [[ -e "$1" ]]; then echo "  ✓ preserved: ${1#$SANDBOX/}"; else echo "  ✗ MISSING: ${1#$SANDBOX/}"; fail=1; fi
    }
    check_json_clean() {
      local file="$1"
      [[ -f "$file" ]] || { echo "  ✓ gone: ${file#$SANDBOX/}"; return; }
      if grep -q "fremi" "$file" 2>/dev/null; then
        echo "  ✗ LEFTOVER: ${file#$SANDBOX/} still mentions fremi"; fail=1
      else
        echo "  ✓ clean: ${file#$SANDBOX/}"
      fi
    }

    echo "=== project level ==="
    check_absent "$PROJECT/CLAUDE.md"
    check_absent "$PROJECT/.fremi"
    check_present "$PROJECT/docs/works"     # user content: must survive

    echo "=== user level ==="
    check_absent "$FAKE_HOME/.claude/plugins/cache/fremi"
    check_absent "$FAKE_HOME/.claude/plugins/marketplaces/fremi"
    check_absent "$FAKE_HOME/.claude/.fremi-installed"
    check_absent "$FAKE_HOME/.claude/mcp/fremi.json"
    check_json_clean "$FAKE_HOME/.claude/plugins/installed_plugins.json"
    check_json_clean "$FAKE_HOME/.claude/settings.json"

    echo ""
    if [[ $fail -eq 0 ]]; then
      echo "✓ sandbox clean — uninstall left zero trace at both levels."
    else
      echo "✗ sandbox NOT clean — see LEFTOVER lines above."
      exit 1
    fi
    ;;

  cycle)
    bash "$REPO/scripts/sandbox.sh" reset
    echo ""
    bash "$REPO/scripts/sandbox.sh" install
    echo ""
    bash "$REPO/scripts/sandbox.sh" tree
    echo ""
    bash "$REPO/scripts/sandbox.sh" uninstall
    echo ""
    bash "$REPO/scripts/sandbox.sh" verify
    ;;

  setting)
    ensure_dirs
    fremi_run setting "$PROJECT"
    ;;

  *)
    echo "Unknown action: $ACTION"
    echo "Usage: sandbox.sh <reset|install|uninstall|tree|verify|cycle|setting>"
    exit 1
    ;;
esac
