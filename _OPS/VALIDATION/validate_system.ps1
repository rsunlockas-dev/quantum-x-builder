$ErrorActionPreference = "Stop"

Write-Host "Running Quantum-X-Builder validation..."

$required = @(
  "_OPS/AGENTS/agents.constitution.yaml",
  "_OPS/AGENTS/proof_of_evaluation.schema.yaml",
  "_OPS/_STATE/SYSTEM_MANIFEST.yaml"
)

foreach ($r in $required) {
    if (-not (Test-Path $r)) {
        throw "Missing required file: $r"
    }
}

# Duplicate directory guard
$dupes = Get-ChildItem -Directory -Recurse |
         Group-Object Name |
         Where-Object { $_.Count -gt 1 }

if ($dupes) {
    $dupes | ForEach-Object { Write-Host "Duplicate:" $_.Name }
    throw "Duplicate components detected"
}

Write-Host "Validation PASSED."
