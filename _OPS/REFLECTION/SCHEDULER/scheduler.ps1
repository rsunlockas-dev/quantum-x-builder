$ErrorActionPreference = "Stop"

Write-Host "=================================================="
Write-Host "QXB SCHEDULER DRY-RUN — NO EXECUTION WILL OCCUR"
Write-Host "=================================================="

# Load scheduler config
$configPath = "_OPS/REFLECTION/SCHEDULER/CONFIG/scheduler.json"
if (-not (Test-Path $configPath)) {
  throw "Scheduler config missing"
}

$config = Get-Content $configPath | ConvertFrom-Json

foreach ($task in $config.scheduler.tasks) {
  Write-Host ""
  Write-Host "DRY RUN: Task:" $task.name
  Write-Host "Description:" $task.description
  Write-Host "Frequency (per day):" $task.frequency_per_day
  Write-Host "Last run:" $task.last_run
  Write-Host "Next run:" $task.next_run
  Write-Host "------------------------------------------"
}

Write-Host ""
Write-Host "DRY RUN COMPLETE — NO ACTION TAKEN"
Write-Host "=================================================="
