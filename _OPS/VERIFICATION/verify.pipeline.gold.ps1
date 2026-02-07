$ErrorActionPreference = "Stop"

$LEGACY_PATHS = @(
  "\backend\",
  "\packages\",
  "\services\",
  "\vizual-x\",
  "\_OPS\tests\",
  "\_OPS\SCRAPER\"
)

$codeFiles = Get-ChildItem -Recurse -File |
  Where-Object {
    $_.Extension -match '\.(py|js|ts|go|rs|java|cpp|c|cs)$' -and
    $_.FullName -notmatch '\\_EXTERNAL\\' -and
    -not ($LEGACY_PATHS | Where-Object { $_.FullName -match $_ })
  }

if ($codeFiles.Count -gt 0) {
    $codeFiles | ForEach-Object { Write-Host "❌ $($_.FullName)" }
    throw "NEW CODE DETECTED OUTSIDE SANDBOX"
}

Write-Host "✔ No unauthorized code detected"
