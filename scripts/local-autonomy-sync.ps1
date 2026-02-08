# Vizual-X Local Autonomy Sync – Pull latest main with audit trail

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$timestamp = Get-Date -Format "yyyyMMddTHHmmssZ"
$auditLog = "./_OPS/AUDIT_IMMUTABLE/autonomy-sync-$timestamp.log"

Write-Host "🔄 [Vizual-X] Syncing local autonomy state..."
Write-Host "📋 System: vizual-x.com | Audit: $auditLog"

git fetch origin

$LOCAL = git rev-parse HEAD
$REMOTE = git rev-parse origin/main

@{
  timestamp = $timestamp
  action = "autonomy-sync"
  system = "vizual-x"
  domain = "vizual-x.com"
  local_commit = $LOCAL
  remote_commit = $REMOTE
  status = "checked"
} | ConvertTo-Json | Add-Content $auditLog

if ($LOCAL -ne $REMOTE) {
    Write-Host "⬇️  [Vizual-X] Pulling autonomous updates..."
    git pull origin main
    Write-Host "✅ [Vizual-X] Autonomy sync completed."
} else {
    Write-Host "✔ [Vizual-X] Repo already up to date."
}
