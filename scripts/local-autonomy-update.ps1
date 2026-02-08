Write-Host "🚀 Applying autonomous cloud updates locally..."

.\scripts\local-autonomy-sync.ps1
.\scripts\docker-refresh.ps1

Write-Host "🎯 Local system now mirrors cloud autonomy."
