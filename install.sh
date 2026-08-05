#!/usr/bin/env bash
# ============================================================================
# fremi-framework — Bootstrap installer for macOS / Linux
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/fhidalgoGC/gc-framework/main/install.sh | bash
#
# What it does:
#   1. Detects missing dependencies (git, curl) and offers to install them.
#   2. Clones (or updates) fhidalgoGC/gc-framework to ~/.fremi/framework
#   3. Detects OS + architecture
#   4. Downloads the correct compiled binary from GitHub Releases
#   5. Places it in ~/.local/bin/fremi
#   6. Verifies PATH and guides the user if needed
#
# Environment overrides:
#   FREMI_ASSUME_YES=1   Skip all confirmations and auto-install deps.
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

# --- Prompt helper — reads from /dev/tty so it works under `curl | bash` ----
confirm() {
  local prompt="$1"
  if [ "${FREMI_ASSUME_YES:-0}" = "1" ]; then
    info "$prompt (auto-yes via FREMI_ASSUME_YES)"
    return 0
  fi
  if [ ! -r /dev/tty ]; then
    warn "No TTY available — cannot prompt. Re-run with FREMI_ASSUME_YES=1 to auto-accept."
    return 1
  fi
  local answer
  printf "${BOLD}?${RESET} %s [y/N] " "$prompt" > /dev/tty
  read -r answer < /dev/tty
  case "$answer" in
    y|Y|yes|YES|si|SI|Si) return 0 ;;
    *) return 1 ;;
  esac
}

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

OS_KIND="$(uname -s)"

# --- Dependency install helpers ---------------------------------------------
install_dep_macos() {
  local pkg="$1"
  if command -v brew >/dev/null 2>&1; then
    info "Installing ${pkg} via Homebrew..."
    brew install "$pkg"
  else
    error "Homebrew not found. Install ${pkg} manually or install Homebrew first:"
    error '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 1
  fi
}

install_dep_linux() {
  local pkg="$1"
  if command -v apt-get >/dev/null 2>&1; then
    info "Installing ${pkg} via apt-get..."
    sudo apt-get update -qq && sudo apt-get install -y "$pkg"
  elif command -v dnf >/dev/null 2>&1; then
    info "Installing ${pkg} via dnf..."
    sudo dnf install -y "$pkg"
  elif command -v pacman >/dev/null 2>&1; then
    info "Installing ${pkg} via pacman..."
    sudo pacman -S --noconfirm "$pkg"
  elif command -v apk >/dev/null 2>&1; then
    info "Installing ${pkg} via apk..."
    sudo apk add "$pkg"
  else
    error "No supported package manager found (apt, dnf, pacman, apk). Install ${pkg} manually."
    exit 1
  fi
}

ensure_dep() {
  local pkg="$1"
  if command -v "$pkg" >/dev/null 2>&1; then
    return 0
  fi
  warn "Required dependency missing: ${pkg}"
  if ! confirm "Install ${pkg} now?"; then
    error "Cannot proceed without ${pkg}. Aborting."
    exit 1
  fi
  case "$OS_KIND" in
    Darwin) install_dep_macos "$pkg" ;;
    Linux)  install_dep_linux "$pkg" ;;
    *) error "Auto-install not supported on ${OS_KIND}. Install ${pkg} manually."; exit 1 ;;
  esac
}

# --- Ensure required deps ---------------------------------------------------
ensure_dep git
ensure_dep curl

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
# fall back to a bash shim that runs the framework in dev mode via bun.
if curl -sSfL "${BINARY_URL}" -o "${BIN_DIR}/fremi" 2>/dev/null; then
  chmod +x "${BIN_DIR}/fremi"
  info "Binary installed at ${BIN_DIR}/fremi"
else
  warn "No pre-compiled binary for v${VERSION} — installing dev shim (requires bun)."
  if ! command -v bun >/dev/null 2>&1; then
    warn "Bun is required for dev-mode install."
    if confirm "Install bun now via https://bun.sh/install?"; then
      info "Installing bun..."
      curl -fsSL https://bun.sh/install | bash
      # Bun installs to ~/.bun/bin — add to PATH for this session
      export BUN_INSTALL="${HOME}/.bun"
      export PATH="${BUN_INSTALL}/bin:${PATH}"
      if ! command -v bun >/dev/null 2>&1; then
        error "Bun install did not complete successfully. Please install manually from https://bun.sh"
        exit 1
      fi
    else
      error "Cannot proceed without bun. Install manually from https://bun.sh or wait for a tagged release."
      exit 1
    fi
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
echo "  ${BOLD}fremi uninstall /path/to/project${RESET}"
echo ""
