param()

$ts = (Get-Date -Format "yyyyMMdd-HHmmss")
$events = Get-Content "_OPS/MEMORY/EVENTS/events.json" | ConvertFrom-Json

$snap = @{
  snapshot_id  = "snap-$ts"
  created_at   = (Get-Date).ToString("o")
  event_count  = $events.Count
  events       = $events
}

$path = "_OPS/MEMORY/SNAPSHOTS/snap-$ts.json"
$snap | ConvertTo-Json -Depth 10 | Out-File $path -Encoding UTF8

# Update index
$indexPath = "_OPS/MEMORY/SNAPSHOTS/snapshot_index.json"
$idx = Get-Content $indexPath | ConvertFrom-Json
$idx + @{
  snapshot_id  = "snap-$ts"
  created_at   = (Get-Date).ToString("o")
  event_count  = $events.Count
  path         = $path
} | ConvertTo-Json -Depth 10 | Out-File $indexPath -Encoding UTF8

Write-Host "✔ Snapshot created: $path"
