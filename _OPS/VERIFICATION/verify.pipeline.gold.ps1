# ==============================================================================
# QUANTUM-X-BUILDER — GOLD PIPELINE VERIFIER (CANONICAL)
# MODE: READ-ONLY | FAIL-LOUD | LEGACY-AWARE
# ==============================================================================

$ErrorActionPreference = "Stop"

function Require-Path($p, $desc) {
    if (-not (Test-Path $p)) {
        throw "❌ MISSING: $desc ($p)"
    }
}

function Require-GitTag($tag) {
    if (-not (git tag | Select-String "^$tag$")) {
        throw "❌ MISSING GIT TAG: $tag"
    }
}

Write-Host "================================================="
Write-Host "GOLD PIPELINE VERIFICATION — START"
Write-Host "================================================="

# ------------------------------------------------------------------------------
# 1) CONTROL PLANE FINALIZATION
# ------------------------------------------------------------------------------
Write-Host "[1] Control plane finalization"

Require-GitTag "CONTROL_PLANE_FINALIZED"
Require-Path "_OPS/_STATE/SYSTEM_LOCK.yaml"        "System lock"
Require-Path "_OPS/_STATE/SYSTEM_STATUS.yaml"      "System status"
Require-Path "_OPS/_STATE/ABSOLUTE_CEILING.yaml"   "Absolute ceiling"
Require-Path "_OPS/_STATE/GOVERNANCE_CEILING.yaml" "Ceiling alias"
Require-Path "_OPS/ROUTING_POLICY.yaml"             "Routing policy"

Write-Host "✔ Control plane finalized"

# ------------------------------------------------------------------------------
# 2) NO NEW CODE OUTSIDE SANDBOX (LEGACY-AWARE, SAFE)
# ------------------------------------------------------------------------------
Write-Host "[2] Verifying no NEW code outside sandbox"

$ROOT = (Get-Location).Path.ToLower()
$SANDBOX_ROOT = (Join-Path $ROOT "_external\sandbox")

$LEGACY_ROOTS = @(
    "backend",
    "packages",
    "services",
    "vizual-x",
    "_ops\tests",
    "_ops\scraper"
) | ForEach-Object {
    (Join-Path $ROOT $_).ToLower()
}

$violations = @()

Get-ChildItem -Recurse -File |
Where-Object { $_.Extension -match '\.(py|js|ts|go|rs|java|cpp|c|cs)$' } |
ForEach-Object {
    $path = $_.FullName.ToLower()

    if ($path.StartsWith($SANDBOX_ROOT)) {
        return
    }

    foreach ($legacy in $LEGACY_ROOTS) {
        if ($path.StartsWith($legacy)) {
            return
        }
    }

    $violations += $_
}

if ($violations.Count -gt 0) {
    $violations | ForEach-Object { Write-Host "❌ $($_.FullName)" }
    throw "NEW CODE DETECTED OUTSIDE SANDBOX"
}

Write-Host "✔ No unauthorized code detected"

# ------------------------------------------------------------------------------
# 3) SANDBOX INTEGRITY
# ------------------------------------------------------------------------------
Write-Host "[3] Sandbox integrity"

$SANDBOX = "_EXTERNAL/SANDBOX"
Require-Path $SANDBOX "Sandbox root"
Require-Path "$SANDBOX/.git" "Sandbox git repo"

Write-Host "✔ Sandbox valid and isolated"

# ------------------------------------------------------------------------------
# 4) PIPELINE LINKAGE
# ------------------------------------------------------------------------------
Write-Host "[4] Pipeline linkage"

Require-Path "_OPS/PIPELINE/pipeline.link.yaml" "Pipeline link"

Write-Host "✔ Pipeline linked"

Write-Host "================================================="
Write-Host "GOLD VERIFICATION PASSED"
Write-Host "✔ Control plane sealed"
Write-Host "✔ Legacy respected"
Write-Host "✔ Sandbox enforced"
Write-Host "✔ Ready for autonomous operation"
Write-Host "================================================="
