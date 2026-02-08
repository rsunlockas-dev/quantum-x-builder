#!/usr/bin/env powershell

# VIZUAL X Extension Quick Start

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VIZUAL X VS Code Extension" -ForegroundColor Green
Write-Host "Quick Setup & Run" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeCheck -or -not $npmCheck) {
    Write-Host "[⚠️  ] Node.js is not installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install Node.js 20 LTS from:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use Chocolatey:" -ForegroundColor Yellow
    Write-Host "  choco install nodejs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use Windows Package Manager:" -ForegroundColor Yellow
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "[✓] Node.js found: $(node --version)" -ForegroundColor Green
Write-Host "[✓] npm found: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Navigate to extension directory
$extensionPath = "c:\AI\quantum-x-builder\vizual-x"
Set-Location $extensionPath
Write-Host "[→] Working directory: $extensionPath" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "[→] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build with Vite
Write-Host "[→] Building extension..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Build complete" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ VIZUAL X Extension Ready!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open this folder in VS Code:" -ForegroundColor White
Write-Host "     code ." -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Press F5 to launch the extension" -ForegroundColor White
Write-Host "     in a new VS Code window" -ForegroundColor White
Write-Host ""
Write-Host "  3. Or run commands:" -ForegroundColor White
Write-Host "     Ctrl+Shift+X  - Open VIZUAL X Studio" -ForegroundColor Yellow
Write-Host ""
