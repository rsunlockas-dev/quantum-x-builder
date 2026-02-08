# Local Autonomy Sync – Pull latest main if changed

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

git fetch origin

$LOCAL = git rev-parse HEAD
$REMOTE = git rev-parse origin/main

if ($LOCAL -ne $REMOTE) {
    Write-Host "⬇️  Pulling autonomous updates..."
    git pull origin main
} else {
    Write-Host "✔ Repo already up to date."
}
