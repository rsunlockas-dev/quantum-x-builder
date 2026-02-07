$ErrorActionPreference = "Stop"
Write-Host "SCHEDULER DRY RUN — NO ACTION"
$config = Get-Content "_OPS/SCHEDULER/CONFIG/scheduler.json" | ConvertFrom-Json
foreach ($task in $config.scheduler.tasks) {
  Write-Host "Task:" $task.name "- Frequency/day:" $task.frequency_per_day
}
Write-Host "DRY RUN COMPLETE"
