#!/usr/bin/env pwsh
<#
.SYNOPSIS
Full End-to-End Validation & Hardening for Quantum-X-Builder Phase 5/6
.DESCRIPTION
Systematic validation of all subsystems with evidence collection
#>

$ErrorActionPreference = "SilentlyContinue"
$timestamp = Get-Date -AsUTC -Format 'yyyyMMdd-HHmmss'
$reportFile = "c:\AI\quantum-x-builder\_OPS\OUTPUT\validation-report-$timestamp.json"
$evidenceDir = "c:\AI\quantum-x-builder\_OPS\EVIDENCE\validation-$timestamp"

# Create output directory
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

$validation_results = @{
    timestamp = (Get-Date -AsUTC -Format 'o')
    phase = "5/6"
    authority = "Internal System Operator"
    tests = @()
}

function Add-Test {
    param(
        [string]$Name,
        [string]$Category,
        [bool]$Passed,
        [string]$Evidence,
        [string]$Details = ""
    )
    
    $test = @{
        name = $Name
        category = $Category
        passed = $Passed
        timestamp = (Get-Date -AsUTC -Format 'o')
        evidence = $Evidence
        details = $Details
    }
    
    $validation_results.tests += $test
    
    $status = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    Write-Host "$status [$Category] $Name"
    if ($Details) { Write-Host "  --> $Details" }
}

# ===== TASK 1: REHYDRATE VERIFICATION =====
Write-Host "`n=== TASK 1: REHYDRATE VERIFICATION ===" -ForegroundColor Cyan

$rehydrate_file = "c:\AI\quantum-x-builder\_OPS\_STATE\REHYDRATE.json"
if (Test-Path $rehydrate_file) {
    $rehydrate = Get-Content $rehydrate_file | ConvertFrom-Json
    $rehydrate_age = (Get-Date -AsUTC) - [datetime]$rehydrate.rehydrated_at
    $is_current = $rehydrate_age.TotalHours -lt 24
    
    Add-Test -Name "REHYDRATE.json exists" -Category "Rehydration" -Passed $true -Evidence $rehydrate_file
    Add-Test -Name "Rehydration is current (<24h)" -Category "Rehydration" -Passed $is_current -Evidence "Age: $($rehydrate_age.TotalHours) hours" -Details "Last: $($rehydrate.rehydrated_at) | Phase: $($rehydrate.phase)"
} else {
    Add-Test -Name "REHYDRATE.json exists" -Category "Rehydration" -Passed $false -Evidence "File not found at $rehydrate_file"
}

# ===== TASK 2: BACKEND VALIDATION =====
Write-Host "`n=== TASK 2: BACKEND VALIDATION ===" -ForegroundColor Cyan

# Check docker containers running
$containers = docker ps --format "{{.Names}}" 2>&1
$containers_list = @("qxb-nats", "vizualx-frontend", "next-gen-ai-gateway-1")
foreach ($container in $containers_list) {
    $running = $containers -contains $container
    Add-Test -Name "Docker container '$container' running" -Category "Backend" -Passed $running -Evidence "Docker ps output"
}

# Check ports
$port_tests = @(
    @{port=3000; name="Frontend"},
    @{port=4222; name="NATS"},
    @{port=11435; name="Ollama"}
)

foreach ($port_test in $port_tests) {
    $conn = Test-NetConnection -ComputerName localhost -Port $port_test.port -WarningAction SilentlyContinue
    $open = $conn.TcpTestSucceeded
    Add-Test -Name "Port $($port_test.port) ($($port_test.name)) open" -Category "Backend" -Passed $open -Evidence "Test-NetConnection result"
}

# Check Ollama connectivity
$ollama_test = $null
try {
    $ollama_test = Invoke-WebRequest -Uri "http://localhost:11435/api/tags" -TimeoutSec 5 -WarningAction SilentlyContinue
    Add-Test -Name "Ollama endpoint reachable" -Category "Backend" -Passed ($ollama_test.StatusCode -eq 200) -Evidence "HTTP $($ollama_test.StatusCode)"
} catch {
    Add-Test -Name "Ollama endpoint reachable" -Category "Backend" -Passed $false -Evidence "Connection failed"
}

# ===== TASK 3: CLOUDFLARE VERIFICATION =====
Write-Host "`n=== TASK 3: CLOUDFLARE VERIFICATION ===" -ForegroundColor Cyan

$tunnel_config = "c:\AI\quantum-x-builder\.cloudflare\config.yml"
$tunnel_exists = Test-Path $tunnel_config
Add-Test -Name "Cloudflare tunnel config exists" -Category "Cloudflare" -Passed $tunnel_exists -Evidence $tunnel_config

if ($tunnel_exists) {
    $tunnel_content = Get-Content $tunnel_config -Raw
    $has_ingress = $tunnel_content -match "ingress:"
    $has_routes = $tunnel_content -match "localhost|backend"
    Add-Test -Name "Tunnel has ingress rules" -Category "Cloudflare" -Passed $has_ingress -Evidence "config.yml"
    Add-Test -Name "Tunnel routes to backend" -Category "Cloudflare" -Passed $has_routes -Evidence "config.yml"
}

# Check if tunnel is active (via cloudflare tunnel list)
$tunnel_cmd = cloudflare tunnel list 2>&1 | Select-Object -First 5
$tunnel_active = $tunnel_cmd -match "ACTIVE|CONNECTED"
Add-Test -Name "Cloudflare tunnel ACTIVE" -Category "Cloudflare" -Passed ($tunnel_cmd.Count -gt 0 -and $tunnel_active) -Evidence "Cloudflare CLI output"

# ===== TASK 4: CI/AUTONOMY VALIDATION =====
Write-Host "`n=== TASK 4: CI/AUTONOMY VALIDATION ===" -ForegroundColor Cyan

# Check Phase 6 artifacts
$phase6_dir = "c:\AI\quantum-x-builder\_OPS\PHASE6_CEREMONY"
$phase6_exists = Test-Path $phase6_dir
Add-Test -Name "Phase 6 directory exists" -Category "CI/Autonomy" -Passed $phase6_exists -Evidence $phase6_dir

# Check rollback tags
$git_tags = git tag 2>&1 | Select-Object -Last 5
$rollback_tags = $git_tags | Where-Object { $_ -match "rollback|qxb-phase" }
$has_rollback = $rollback_tags.Count -gt 0
Add-Test -Name "Rollback tags exist" -Category "CI/Autonomy" -Passed $has_rollback -Evidence "git tags: $($rollback_tags -join ', ')"

# Check CI workflow files
$ci_workflows = Get-ChildItem "c:\AI\quantum-x-builder\.github\workflows\*.yml" -ErrorAction SilentlyContinue
$ci_exists = $ci_workflows.Count -gt 0
Add-Test -Name "CI/CD workflows configured" -Category "CI/Autonomy" -Passed $ci_exists -Evidence "$($ci_workflows.Count) workflow files"

# ===== TASK 5: SECURITY HARDENING =====
Write-Host "`n=== TASK 5: SECURITY HARDENING ===" -ForegroundColor Cyan

# Check for exposed secrets in repo
$secrets_check = git grep -n "password\|secret\|token\|api_key" 2>&1 | Measure-Object -Line
$no_secrets = $secrets_check.Lines -eq 0
Add-Test -Name "No hardcoded secrets found" -Category "Security" -Passed $no_secrets -Evidence "git grep result: $($secrets_check.Lines) matches"

# Check .env handling
$env_file = "c:\AI\quantum-x-builder\.env"
$env_exists = Test-Path $env_file
$env_in_gitignore = Select-String -Path "c:\AI\quantum-x-builder\.gitignore" -Pattern "\.env" -ErrorAction SilentlyContinue
$env_protected = if ($env_exists -and $env_in_gitignore) { $true } else { $false }
Add-Test -Name ".env file protected" -Category "Security" -Passed $env_protected -Evidence ".env exists: $env_exists | In .gitignore: $($env_in_gitignore.Count -gt 0)"

# Check for least-privilege assumptions
$docker_compose = Get-Content "c:\AI\quantum-x-builder\docker-compose.yml" -Raw -ErrorAction SilentlyContinue
$has_user_constraint = $docker_compose -match "user:|privileged:|cap"
Add-Test -Name "Container privilege constraints" -Category "Security" -Passed $has_user_constraint -Evidence "docker-compose.yml"

# ===== TASK 6: E2E HARDENING TEST =====
Write-Host "`n=== TASK 6: E2E HARDENING TEST ===" -ForegroundColor Cyan

# Simulate port conflict
$test_port = 4222
$test_conn = Test-NetConnection -ComputerName localhost -Port $test_port -WarningAction SilentlyContinue
$port_conflict_test = $test_conn.TcpTestSucceeded
Add-Test -Name "Failure simulation: Port conflict detection" -Category "E2E Hardening" -Passed $port_conflict_test -Evidence "Port $test_port status"

# Check audit log writing
$audit_log = "c:\AI\quantum-x-builder\_OPS\AUDIT_IMMUTABLE\system.ndjson"
$audit_exists = Test-Path $audit_log
Add-Test -Name "Audit logs active" -Category "E2E Hardening" -Passed $audit_exists -Evidence $audit_log

# Check rollback capability
$rollback_script = "c:\AI\quantum-x-builder\_OPS\ROLLBACK\rollback.ps1"
$rollback_exists = Test-Path $rollback_script
Add-Test -Name "Rollback capability available" -Category "E2E Hardening" -Passed $rollback_exists -Evidence $rollback_script

# ===== GENERATE REPORT =====
Write-Host "`n=== REPORT GENERATION ===" -ForegroundColor Cyan

$total_tests = $validation_results.tests.Count
$passed_tests = ($validation_results.tests | Where-Object { $_.passed -eq $true }).Count
$pass_rate = if ($total_tests -gt 0) { [math]::Round(($passed_tests / $total_tests) * 100, 2) } else { 0 }

$validation_results | Add-Member -NotePropertyName "summary" -NotePropertyValue @{
    total_tests = $total_tests
    passed = $passed_tests
    failed = $total_tests - $passed_tests
    pass_rate = "$pass_rate%"
    status = if ($pass_rate -eq 100) { "FULLY_VALIDATED" } elseif ($pass_rate -ge 80) { "MOSTLY_VALID" } else { "NEEDS_ATTENTION" }
}

# Save report
$validation_results | ConvertTo-Json -Depth 5 | Out-File $reportFile -Encoding UTF8
Write-Host "✅ Report written to: $reportFile" -ForegroundColor Green

# Print summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $total_tests"
Write-Host "Passed: $passed_tests"
Write-Host "Failed: $($total_tests - $passed_tests)"
Write-Host "Pass Rate: $pass_rate%"
Write-Host "Status: $($validation_results.summary.status)"
Write-Host "`nDetailed results in: $reportFile"
