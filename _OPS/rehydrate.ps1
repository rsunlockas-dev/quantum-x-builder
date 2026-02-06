# QXB — REHYDRATE (SOLE ENTRY)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function FAIL($m){ throw "FATAL: $m" }
function LOG($m){ Write-Host "[REHYDRATE] $m" }

if (-not (Test-Path ".git")) { FAIL "Not in repo root" }
if (-not (Test-Path "_OPS/POLICY/AUTONOMY_OFF")) {
  FAIL "AUTONOMY VIOLATION — LOCK MISSING"
}

LOG "Fetching tags"
git fetch --all --tags

LOG "Shadow mode active"
LOG "Autonomy locked"
LOG "System ready for validation only"
