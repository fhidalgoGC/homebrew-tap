#!/usr/bin/env bash
# Sandbox — every fremi command, run against a throwaway environment.
#
#   sandbox/
#   ├── agent/     ← fake $HOME. What `fremi agent install` writes: plugin,
#   │                skills, hooks.json, mcp, marker.   Real life: ~/.claude
#   └── project/   ← fake project. What `fremi install` writes: CLAUDE.md,
#                    .fremi/, docs/works/.              Real life: your repo
#
# Two commands, two levels, two folders — the folder names mirror the CLI:
#
#   fremi agent install   →  sandbox/agent/.claude/
#   fremi install         →  sandbox/project/
#
# EVERY `bun run` script in this repo lands in here. Nothing you launch with
# `bun run` can touch your real ~/.claude or ~/.fremi. To install for real,
# call the `fremi` binary directly in your terminal — that is the only way.
#
# Every action drives the REAL CLI, same code path a user gets. Nothing here
# fakes a result with rm -rf. The one deliberate difference: FREMI_HOME points
# at this repo, so the sandbox exercises your LOCAL framework/ content (edit a
# rule, re-install, see it) instead of the published clone.
#
# `update` is the single exception: `fremi update` is `git pull` inside
# FREMI_HOME, and pulling THIS repo mid-work would rewrite the tree you are
# editing. So that action alone points FREMI_HOME at sandbox/fremi, a throwaway
# clone of the published framework — which is also the honest way to test it.
#
# Usage:  bash scripts/sandbox.sh <action> [args...]
#
#   CLI mirrors — one per fremi command, extra args pass straight through:
#     agent-install     → fremi agent install        (writes to sandbox/agent)
#     agent-uninstall   → fremi agent uninstall
#     install           → fremi install              (writes to sandbox/project)
#     uninstall         → fremi uninstall --purge --all
#     update            → fremi update   (see FREMI_HOME note below)
#     verify            → fremi verify
#     version           → fremi version
#     setting           → fremi setting              (TUI on the sandbox project)
#     mcp               → fremi mcp                  (stdio server; ctrl-c to stop)
#     help              → fremi help
#     run <args...>     → any fremi command, incl. ones not listed above
#
#   Sandbox lifecycle:
#     reset      → wipe and recreate sandbox/{agent,project}
#     tree       → show what exists at each level
#     clean      → assert zero residue at both levels (exit 1 if anything remains)
#     cycle      → reset + install + tree + uninstall + clean
#
# Env:
#   FREMI_RUNNER=source   → run from TS source (default; fast iteration)
#   FREMI_RUNNER=binary   → compile darwin-arm64 first (user fidelity;
#                           use before a release)

set -e

ACTION="${1:?Usage: sandbox.sh <action>   (see the header for the full list)}"
shift || true

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SANDBOX="$REPO/sandbox"
AGENT="$SANDBOX/agent"      # fake $HOME  → the `fremi agent install` level
PROJECT="$SANDBOX/project"  # fake repo   → the `fremi install` level
FREMI_CLONE="$SANDBOX/fremi" # throwaway framework clone, used by `update` only
RUNNER="${FREMI_RUNNER:-source}"

# Run the CLI with the sandbox environment applied:
#   HOME  → keeps the agent level inside sandbox/agent, not your ~/.claude
#   cwd   → sandbox/project, so cwd-sensitive commands (`verify`, `mcp`)
#           answer about the sandbox project instead of this repo
#   paths → absolute, so the cd cannot affect what gets run
fremi_run() {
  local fremi_home="${FREMI_HOME_OVERRIDE:-$REPO}"
  if [[ "$RUNNER" == "source" ]]; then
    (cd "$PROJECT" && HOME="$AGENT" FREMI_HOME="$fremi_home" bun run "$REPO/src/index.ts" "$@")
  else
    (cd "$PROJECT" && HOME="$AGENT" FREMI_HOME="$fremi_home" "$REPO/bin/fremi-darwin-arm64" "$@")
  fi
}

ensure_dirs() { mkdir -p "$AGENT" "$PROJECT"; }

ensure_binary() {
  [[ "$RUNNER" == "source" ]] && return 0
  bash "$REPO/scripts/build.sh" darwin-arm64
}

banner() {
  echo "==> runner: $RUNNER   framework: $REPO/framework   HOME: sandbox/agent"
  echo ""
}

self() { bash "$REPO/scripts/sandbox.sh" "$@"; }

case "$ACTION" in
  # ---------- CLI mirrors ----------

  agent-install)
    ensure_dirs; ensure_binary; banner
    fremi_run agent install --agent claude -y --with-mcp "$@"
    ;;

  agent-uninstall)
    ensure_dirs; ensure_binary
    fremi_run agent uninstall --agent claude -y "$@"
    ;;

  install)
    ensure_dirs; ensure_binary; banner
    # `fremi install` chains the agent level itself when the marker is absent,
    # so this single action exercises both levels — exactly like a real user.
    fremi_run install "$PROJECT" --agent claude -y --with-mcp "$@"
    ;;

  uninstall)
    ensure_dirs; ensure_binary
    # --purge  → the whole .fremi/ tree, not just the master switch
    # --all    → chain the user-level uninstall (skills, hooks, mcp, marketplace)
    fremi_run uninstall "$PROJECT" --purge --all "$@"
    ;;

  update)
    ensure_dirs; ensure_binary
    # NEVER against $REPO: `fremi update` git-pulls FREMI_HOME.
    if [[ ! -f "$FREMI_CLONE/VERSION" ]]; then
      echo "==> first run: cloning the published framework into sandbox/fremi"
      rm -rf "$FREMI_CLONE"
      FREMI_HOME_OVERRIDE="$FREMI_CLONE" fremi_run install "$PROJECT" --agent claude -y >/dev/null
      echo ""
    fi
    FREMI_HOME_OVERRIDE="$FREMI_CLONE" fremi_run update "$@"
    ;;

  verify)
    ensure_dirs; ensure_binary
    fremi_run verify "$@"
    ;;

  version)
    ensure_dirs; ensure_binary
    fremi_run version "$@"
    ;;

  setting|settings)
    ensure_dirs; ensure_binary
    fremi_run setting "$PROJECT" "$@"
    ;;

  mcp)
    ensure_dirs; ensure_binary
    fremi_run mcp "$@"
    ;;

  help)
    ensure_binary
    fremi_run help "$@"
    ;;

  run)
    # Generic passthrough, so a command with no mirror of its own (or one
    # added later) still cannot escape the sandbox.
    ensure_dirs; ensure_binary
    fremi_run "$@"
    ;;

  # ---------- sandbox lifecycle ----------

  reset)
    rm -rf "$SANDBOX"
    ensure_dirs
    echo "Fresh sandbox:"
    echo "  agent   (fake HOME): sandbox/agent"
    echo "  project:             sandbox/project"
    echo "Run \`bun run sandbox:install\` to install fremi there."
    ;;

  tree)
    echo "########## PROJECT LEVEL (sandbox/project) — \`fremi install\` ##########"
    if [[ -d "$PROJECT" ]]; then
      (cd "$PROJECT" && find . -not -path "*/.git/*" | sort | sed 's|^\./||;s|^|  |' | grep -v '^  $')
    else
      echo "  (does not exist)"
    fi
    echo ""
    echo "########## AGENT LEVEL (sandbox/agent) — \`fremi agent install\` ##########"
    if [[ -d "$AGENT/.claude" ]]; then
      (cd "$AGENT" && find .claude -maxdepth 5 \
        -not -path "*/marketplaces/fremi/*" -not -path "*/skills/*" | sort | sed 's|^|  |')
      skills_root="$AGENT/.claude/plugins/cache/fremi/fremi"
      if [[ -d "$skills_root" ]]; then
        for v in "$skills_root"/*; do
          [[ -d "$v/skills" ]] && echo "  → $(basename "$v")/skills/: $(ls "$v/skills" | wc -l | tr -d ' ') symlinks into the framework"
        done
      fi
    else
      echo "  (nothing installed)"
    fi
    ;;

  clean)
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

    echo "=== agent level ==="
    check_absent "$AGENT/.claude/plugins/cache/fremi"
    check_absent "$AGENT/.claude/plugins/marketplaces/fremi"
    check_absent "$AGENT/.claude/.fremi-installed"
    check_absent "$AGENT/.claude/mcp/fremi.json"
    check_json_clean "$AGENT/.claude/plugins/installed_plugins.json"
    check_json_clean "$AGENT/.claude/settings.json"

    echo ""
    if [[ $fail -eq 0 ]]; then
      echo "✓ sandbox clean — uninstall left zero trace at both levels."
    else
      echo "✗ sandbox NOT clean — see LEFTOVER lines above."
      exit 1
    fi
    ;;

  cycle)
    self reset;     echo ""
    self install;   echo ""
    self tree;      echo ""
    self uninstall; echo ""
    self clean
    ;;

  *)
    echo "Unknown action: $ACTION"
    echo ""
    echo "CLI mirrors:  agent-install agent-uninstall install uninstall"
    echo "              update verify version setting mcp help"
    echo "Passthrough:  run <any fremi args>"
    echo "Lifecycle:    reset tree clean cycle"
    exit 1
    ;;
esac
