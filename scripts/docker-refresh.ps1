# Vizual-X Docker Refresh – Restart local services with audit trail

$timestamp = Get-Date -Format "yyyyMMddTHHmmssZ"
$auditLog = "./_OPS/AUDIT_IMMUTABLE/docker-refresh-$timestamp.log"

Write-Host "🐳 [Vizual-X] Restarting Docker services..."
Write-Host "📋 System: vizual-x.com"
Write-Host "📝 Audit: $auditLog"

# Log to audit trail
@{
  timestamp = $timestamp
  action = "docker-refresh"
  system = "vizual-x"
  domain = "vizual-x.com"
  status = "started"
} | ConvertTo-Json | Add-Content $auditLog

try {
  docker compose down
  docker compose up -d --build
  
  @{
    timestamp = Get-Date -Format "yyyyMMddTHHmmssZ"
    action = "docker-refresh"
    status = "completed"
  } | ConvertTo-Json | Add-Content $auditLog
  
  Write-Host "✅ [Vizual-X] Docker refreshed and logged."
} catch {
  @{
    timestamp = Get-Date -Format "yyyyMMddTHHmmssZ"
    action = "docker-refresh"
    status = "failed"
    error = $_.Exception.Message
  } | ConvertTo-Json | Add-Content $auditLog
  
  Write-Host "❌ Error: $_"
}
