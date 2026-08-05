# ============================================================================
# fremi-framework — Bootstrap installer for Windows
#
# Usage:
#   iwr -useb https://raw.githubusercontent.com/fhidalgoGC/gc-framework/main/install.ps1 | iex
#
# What it does:
#   1. Clones (or updates) fhidalgoGC/gc-framework to $env:USERPROFILE\.fremi\framework
#   2. Downloads the fremi-windows-x64.exe binary from GitHub Releases
#   3. Places it in $env:LOCALAPPDATA\Programs\fremi\fremi.exe
#   4. Adds the install dir to the User PATH environment variable
#
# Requirements:
#   - PowerShell 5+ (ships with Windows 10+)
#   - git (Git for Windows)
# ============================================================================

$ErrorActionPreference = "Stop"

$Repo         = "fhidalgoGC/gc-framework"
$FremiHome    = Join-Path $env:USERPROFILE ".fremi"
$FrameworkDir = Join-Path $FremiHome "framework"
$BinDir       = Join-Path $env:LOCALAPPDATA "Programs\fremi"
$BinaryPath   = Join-Path $BinDir "fremi.exe"

function Write-Info    { param($m) Write-Host "==> $m" -ForegroundColor Green }
function Write-Warning2 { param($m) Write-Host "==> $m" -ForegroundColor Yellow }
function Write-Fail    { param($m) Write-Host "==> $m" -ForegroundColor Red; exit 1 }

# --- Check dependencies -----------------------------------------------------
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Fail "git is required. Install Git for Windows from https://git-scm.com/download/win"
}

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
        Write-Fail "Bun is required for dev-mode install. Install bun (https://bun.sh) or wait for a tagged release."
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
Write-Host ""
