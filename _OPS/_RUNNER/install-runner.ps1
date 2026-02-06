# QXB — INSTALL GITHUB ACTIONS RUNNER
# DESIGN-ONLY • CALLED BY REHYDRATE ONLY
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function FAIL($m){ throw "FATAL: $m" }
function LOG($m){ Write-Host "[RUNNER] $m" }

LOG "DESIGN: Request GitHub registration token"
LOG "DESIGN: Download actions-runner"
LOG "DESIGN: Configure runner for InfinityXOneSystems/quantum-x-builder"
LOG "DESIGN COMPLETE — NO EXECUTION PERFORMED"
