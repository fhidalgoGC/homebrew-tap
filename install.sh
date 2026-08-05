#!/usr/bin/env bash
# ============================================================================
# fremi-framework — Bootstrap installer for macOS / Linux
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/fhidalgoGC/gc-framework/main/install.sh | bash
#
# What it does:
#   1. Clones (or updates) fhidalgoGC/gc-framework to ~/.fremi/framework
#   2. Detects OS + architecture
#   3. Downloads the correct compiled binary from GitHub Releases
#   4. Places it in ~/.local/bin/fremi
#   5. Verifies PATH and guides the user if needed
#
# Requirements:
#   - bash 4+ (macOS ships bash 3 — script is bash-3 compatible)
#   - git
#   - curl
# ============================================================================

set -euo pipefail

REPO="fhidalgoGC/gc-framework"
FREMI_HOME="${HOME}/.fremi"
FRAMEWORK_DIR="${FREMI_HOME}/framework"
BIN_DIR="${HOME}/.local/bin"

# --- Colors -----------------------------------------------------------------
if [ -t 1 ]; then
  BOLD="\033[1m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"
else
  BOLD=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

info()  { printf "${BOLD}${GREEN}==>${RESET} %s\n" "$*"; }
warn()  { printf "${BOLD}${YELLOW}==>${RESET} %s\n" "$*"; }
error() { printf "${BOLD}${RED}==>${RESET} %s\n" "$*" >&2; }

# --- Detect OS + arch -------------------------------------------------------
detect_platform() {
  local os arch
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$os" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    *) error "Unsupported OS: $os"; exit 1 ;;
  esac

  case "$arch" in
    arm64|aarch64) arch="arm64" ;;
    x86_64|amd64)  arch="x64" ;;
    *) error "Unsupported architecture: $arch"; exit 1 ;;
  esac

  echo "${os}-${arch}"
}

# --- Check dependencies -----------------------------------------------------
require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Missing required command: $1"
    exit 1
  fi
}

require git
require curl

# --- Clone or update framework repo -----------------------------------------
info "Installing fremi-framework to ${FREMI_HOME}"

if [ -d "${FRAMEWORK_DIR}/.git" ]; then
  info "Updating existing installation..."
  git -C "${FRAMEWORK_DIR}" fetch --tags --quiet
  git -C "${FRAMEWORK_DIR}" pull --ff-only --quiet
else
  info "Cloning ${REPO}..."
  mkdir -p "${FREMI_HOME}"
  git clone --quiet "https://github.com/${REPO}.git" "${FRAMEWORK_DIR}"
fi

# --- Read version -----------------------------------------------------------
VERSION="$(cat "${FRAMEWORK_DIR}/VERSION" 2>/dev/null | tr -d '[:space:]')"
[ -z "${VERSION}" ] && VERSION="0.1.0"

# --- Download binary from GitHub Releases -----------------------------------
PLATFORM="$(detect_platform)"
BINARY_NAME="fremi-${PLATFORM}"
BINARY_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${BINARY_NAME}"

info "Detected platform: ${PLATFORM}"
info "Fetching binary: ${BINARY_URL}"

mkdir -p "${BIN_DIR}"

# Try to download the pre-compiled binary. If not available (early releases),
# fall back to a bash shim that runs the framework in dev mode via bun (if bun
# is present). This lets development proceed before the first tagged release.
if curl -sSfL "${BINARY_URL}" -o "${BIN_DIR}/fremi" 2>/dev/null; then
  chmod +x "${BIN_DIR}/fremi"
  info "Binary installed at ${BIN_DIR}/fremi"
else
  warn "No pre-compiled binary for v${VERSION} — installing dev shim (requires bun)."
  if ! command -v bun >/dev/null 2>&1; then
    error "Bun is required for dev-mode install. Install bun (https://bun.sh) or wait for a tagged release."
    exit 1
  fi
  cat > "${BIN_DIR}/fremi" <<EOF
#!/usr/bin/env bash
# Dev shim — runs fremi via bun from local framework clone
exec bun run "${FRAMEWORK_DIR}/src/index.ts" "\$@"
EOF
  chmod +x "${BIN_DIR}/fremi"
  info "Dev shim installed at ${BIN_DIR}/fremi"
fi

# --- Verify PATH ------------------------------------------------------------
if ! echo ":${PATH}:" | grep -q ":${BIN_DIR}:"; then
  warn "${BIN_DIR} is not in your PATH."
  warn "Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
  printf "  ${BOLD}export PATH=\"${BIN_DIR}:\$PATH\"${RESET}\n"
  warn "Then restart your shell or run: source ~/.zshrc"
fi

# --- Done -------------------------------------------------------------------
info "✓ fremi-framework v${VERSION} installed successfully."
echo ""
echo "Try:"
echo "  ${BOLD}fremi version${RESET}"
echo "  ${BOLD}fremi install /path/to/project${RESET}"
echo ""
