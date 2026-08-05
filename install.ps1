# ============================================================================
# fremi-framework — Bootstrap installer for Windows
#
# Usage:
#   iwr -useb https://raw.githubusercontent.com/fhidalgoGC/homebrew-tap/main/install.ps1 | iex
#
# What it does:
#   1. Detects missing dependencies (git) and offers to install them (winget).
#   2. Clones (or updates) fhidalgoGC/homebrew-tap to $env:USERPROFILE\.fremi\framework
#   3. Downloads the fremi-windows-x64.exe binary from GitHub Releases
#   4. Places it in $env:LOCALAPPDATA\Programs\fremi\fremi.exe
#   5. Adds the install dir to the User PATH environment variable
#
# Environment overrides:
#   $env:FREMI_ASSUME_YES = "1"   Skip confirmations and auto-install deps.
# ============================================================================

$ErrorActionPreference = "Stop"

$Repo         = "fhidalgoGC/homebrew-tap"
$FremiHome    = Join-Path $env:USERPROFILE ".fremi"
$FrameworkDir = Join-Path $FremiHome "framework"
$BinDir       = Join-Path $env:LOCALAPPDATA "Programs\fremi"
$BinaryPath   = Join-Path $BinDir "fremi.exe"

function Write-Info    { param($m) Write-Host "==> $m" -ForegroundColor Green }
function Write-Warning2 { param($m) Write-Host "==> $m" -ForegroundColor Yellow }
function Write-Fail    { param($m) Write-Host "==> $m" -ForegroundColor Red; exit 1 }

function Confirm-Prompt {
    param([string]$Question)
    if ($env:FREMI_ASSUME_YES -eq "1") {
        Write-Info "$Question (auto-yes via FREMI_ASSUME_YES)"
        return $true
    }
    $answer = Read-Host "? $Question [y/N]"
    return $answer -match '^(y|yes|si)$'
}

function Install-DepWindows {
    param([string]$Pkg, [string]$WingetId)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Info "Installing $Pkg via winget..."
        winget install --id $WingetId --exact --silent --accept-package-agreements --accept-source-agreements
    } else {
        Write-Fail "winget not available. Install $Pkg manually from its official website."
    }
}

function Ensure-Dep {
    param([string]$Cmd, [string]$WingetId)
    if (Get-Command $Cmd -ErrorAction SilentlyContinue) { return }
    Write-Warning2 "Required dependency missing: $Cmd"
    if (-not (Confirm-Prompt "Install $Cmd now?")) {
        Write-Fail "Cannot proceed without $Cmd. Aborting."
    }
    Install-DepWindows -Pkg $Cmd -WingetId $WingetId
    # winget updates PATH for the machine but the current session doesn't see it — refresh.
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Get-Command $Cmd -ErrorAction SilentlyContinue)) {
        Write-Fail "$Cmd installed but not in PATH yet. Restart PowerShell and re-run the installer."
    }
}

# --- Ensure required deps ---------------------------------------------------
Ensure-Dep -Cmd git -WingetId "Git.Git"

# --- Clone or update framework repo -----------------------------------------
Write-Info "Installing fremi-framework to $FremiHome"

if (Test-Path (Join-Path $FrameworkDir ".git")) {
    Write-Info "Updating existing installation..."
    Push-Location $FrameworkDir
    git fetch --tags --quiet
    git pull --ff-only --quiet
    Pop-Location
} else {
    Write-Info "Cloning $Repo..."
    if (-not (Test-Path $FremiHome)) { New-Item -ItemType Directory -Path $FremiHome | Out-Null }
    git clone --quiet "https://github.com/$Repo.git" $FrameworkDir
}

# --- Read version -----------------------------------------------------------
$VersionFile = Join-Path $FrameworkDir "VERSION"
$Version = if (Test-Path $VersionFile) { (Get-Content $VersionFile -Raw).Trim() } else { "0.1.0" }

# --- Download binary --------------------------------------------------------
$BinaryUrl = "https://github.com/$Repo/releases/download/v$Version/fremi-windows-x64.exe"

Write-Info "Fetching binary: $BinaryUrl"

if (-not (Test-Path $BinDir)) { New-Item -ItemType Directory -Path $BinDir | Out-Null }

try {
    Invoke-WebRequest -Uri $BinaryUrl -OutFile $BinaryPath -UseBasicParsing -ErrorAction Stop
    Write-Info "Binary installed at $BinaryPath"
} catch {
    Write-Warning2 "No pre-compiled binary for v$Version — installing dev shim (requires bun)."
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        if (Confirm-Prompt "Install bun now via https://bun.sh?") {
            Write-Info "Installing bun..."
            powershell -c "irm bun.sh/install.ps1 | iex"
            $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
            if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
                Write-Fail "Bun install did not complete. Install manually from https://bun.sh"
            }
        } else {
            Write-Fail "Cannot proceed without bun. Install manually from https://bun.sh or wait for a tagged release."
        }
    }
    $ShimPath = Join-Path $BinDir "fremi.cmd"
    @"
@echo off
bun run "$FrameworkDir\src\index.ts" %*
"@ | Set-Content -Path $ShimPath -Encoding ASCII
    Write-Info "Dev shim installed at $ShimPath"
    $BinaryPath = $ShimPath
}

# --- Add to User PATH -------------------------------------------------------
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$BinDir*") {
    Write-Info "Adding $BinDir to User PATH"
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$BinDir", "User")
    Write-Warning2 "Restart your terminal for PATH changes to take effect."
} else {
    Write-Info "PATH already includes $BinDir"
}

# --- Done -------------------------------------------------------------------
Write-Info "✓ fremi-framework v$Version installed successfully."
Write-Host ""
Write-Host "Try:"
Write-Host "  fremi version"
Write-Host "  fremi install C:\path\to\project"
Write-Host "  fremi uninstall C:\path\to\project"
Write-Host ""
