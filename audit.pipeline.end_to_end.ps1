$ErrorActionPreference = "Stop"
$FAILURES = @()

function Check($condition, $message) {
    if (-not $condition) {
        $script:FAILURES += $message
    }
}

function Require-Path($path, $desc) {
    Check (Test-Path $path) "MISSING: $desc ($path)"
}

Write-Host "================================================="
Write-Host "END-TO-END PIPELINE READINESS AUDIT — START"
Write-Host "================================================="

# ------------------------------------------------------------------------------
# 1) CONTROL PLANE GOVERNANCE
# ------------------------------------------------------------------------------
Write-Host "[1] Control plane governance"

Require-Path "_OPS/_STATE/SYSTEM_STATUS.yaml" "System status"
Require-Path "_OPS/_STATE/SYSTEM_LOCK.yaml" "System lock"
Require-Path "_OPS/ROUTING_POLICY.yaml" "Routing policy"
Require-Path "_OPS/VERIFICATION/verify.pipeline.gold.ps1" "Gold verifier"

$sysStatus = Get-Content "_OPS/_STATE/SYSTEM_STATUS.yaml" -Raw
Check ($sysStatus -match "bootstrap") "System not in BOOTSTRAP mode"

Write-Host "✔ Governance state coherent"

# ------------------------------------------------------------------------------
# 2) SANDBOX STATE
# ------------------------------------------------------------------------------
Write-Host "[2] Sandbox state"

Require-Path "_OPS/SANDBOX/STATUS.yaml" "Sandbox status"

$sandboxStatus = Get-Content "_OPS/SANDBOX/STATUS.yaml" -Raw
Check ($sandboxStatus -match "locked") "Sandbox is NOT locked"

Write-Host "✔ Sandbox correctly locked"

# ------------------------------------------------------------------------------
# 3) RUNNER STATE (EXPLICIT)
# ------------------------------------------------------------------------------
Write-Host "[3] Runner state"

Require-Path "_OPS/RUNNERS/STATUS.yaml" "Runner status"

$runnerStatus = Get-Content "_OPS/RUNNERS/STATUS.yaml" -Raw
Check ($runnerStatus -match "state:\s*disabled") "Runner is NOT disabled"

Write-Host "✔ Runners explicitly disabled"

# ------------------------------------------------------------------------------
# 4) PIPELINE LINKAGE
# ------------------------------------------------------------------------------
Write-Host "[4] Pipeline linkage"

Require-Path "_OPS/PIPELINE/pipeline.link.yaml" "Pipeline link"

Write-Host "✔ Pipeline linkage present"

# ------------------------------------------------------------------------------
# 5) SANDBOX REPO LINK
# ------------------------------------------------------------------------------
Write-Host "[5] Sandbox repo linkage"

Check (Test-Path "_EXTERNAL/SANDBOX/.git") "Sandbox repo missing or not a git repo"

Write-Host "✔ Sandbox repo linked"

# ------------------------------------------------------------------------------
# REPORT
# ------------------------------------------------------------------------------
Write-Host "-------------------------------------------------"

if ($FAILURES.Count -eq 0) {
    Write-Host "✅ PIPELINE READY — NO BLOCKERS DETECTED"
    Write-Host "✔ ChatGPT → VS Code → GitHub App → Runner → Sandbox is coherent"
} else {
    Write-Host "❌ PIPELINE ISSUES DETECTED:`n"
    $i = 1
    foreach ($f in $FAILURES) {
        Write-Host "[$i] $f"
        $i++
    }
    throw "PIPELINE NOT READY"
}

Write-Host "================================================="
Write-Host "END-TO-END PIPELINE READINESS AUDIT — COMPLETE"
Write-Host "================================================="
