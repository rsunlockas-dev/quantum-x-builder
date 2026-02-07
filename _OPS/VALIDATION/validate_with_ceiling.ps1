$ErrorActionPreference = "Stop"

$start = Get-Date

# Load ceiling
$ceiling = Get-Content "_OPS/VALIDATION/validation_ceiling.yaml" -Raw

Write-Host "Running validation WITH CEILING..."

# ---- Time ceiling check (pre)
$elapsed = (Get-Date) - $start
if ($elapsed.TotalSeconds -gt 30) {
    throw "Validation time ceiling exceeded (pre-check)"
}

# ---- Enforce read-only intent (best-effort declaration)
$env:QXB_VALIDATION_MODE = "READ_ONLY"

# ---- Call existing validator
powershell -ExecutionPolicy Bypass -File _OPS/VALIDATION/validate_system.ps1
if ($LASTEXITCODE -ne 0) {
    exit 1
}

# ---- Time ceiling check (post)
$elapsed = (Get-Date) - $start
if ($elapsed.TotalSeconds -gt 30) {
    throw "Validation time ceiling exceeded (post-check)"
}

Write-Host "Validation PASSED within ceiling."
