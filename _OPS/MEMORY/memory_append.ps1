param(
  [string] $source,
  [string] $event_type,
  [Parameter(ValueFromPipeline=$true)]
  [Hashtable] $details
)

$ts = (Get-Date).ToString("o")
$event = @{
  timestamp  = $ts
  source     = $source
  event_type = $event_type
  details    = $details
}

$store = "_OPS/MEMORY/EVENTS/events.json"
$data = Get-Content $store | ConvertFrom-Json
$data + $event | ConvertTo-Json -Depth 10 | Out-File $store -Encoding UTF8

Write-Host "✔ Event logged: $event_type @ $ts"
