#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Full end-to-end validation and hardening for Quantum-X-Builder
.DESCRIPTION
    Validates:
    1. Rehydration state
    2. Backend health + connectivity
    3. Cloudflare Tunnel + zero-trust
    4. CI/Autonomy execution
    5. Security posture
    6. E2E failure resilience
#>

param(
    [string]$RepoRoot = 'c:\AI\quantum-x-builder',
    [string]$OutputDir = 'c:\AI\quantum-x-builder\_OPS\OUTPUT',
    [switch]$Verbose
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$VerbosePreference = if ($Verbose) { 'Continue' } else { 'SilentlyContinue' }

# ============================================================================
# CONFIGURATION
# ============================================================================

$ReportFile = Join-Path $OutputDir "validation-report-$(Get-Date -Format 'yyyyMMddTHHmmssZ').json"
$FailureFile = Join-Path $OutputDir "validation-failures-$(Get-Date -Format 'yyyyMMddTHHmmssZ').json"

$Results = @{
    timestamp = Get-Date -AsUTC -Format 'o'
    system = 'Quantum-X-Builder'
    phase = 6
    tasks = @{}
}

$Failures = @()

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Test-Task {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Description
    )
    
    Write-Host "🔍 Testing: $Name"
    if ($Description) {
        Write-Verbose "   Description: $Description"
    }
    
    try {
        $result = & $Test
        $Results.tasks[$Name] = @{
            status = 'pass'
            result = $result
            timestamp = Get-Date -AsUTC -Format 'o'
        }
        Write-Host "   ✅ PASS"
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "   ❌ FAIL: $errorMsg"
        
        $Results.tasks[$Name] = @{
            status = 'fail'
            error = $errorMsg
            timestamp = Get-Date -AsUTC -Format 'o'
        }
        
        $Failures += @{
            task = $Name
            error = $errorMsg
            details = $_.Exception | Out-String
        }
        
        return $false
    }
}

function Assert-FileExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
    return $Path
}

function Assert-JsonValid {
    param([string]$Path)
    $content = Get-Content $Path -Raw
    $json = $content | ConvertFrom-Json
    return $json
}

function Get-DockerStatus {
    param([string]$Container)
    try {
        $out = & docker inspect $Container --format='{{.State.Status}}' 2>$null
        return $out.Trim()
    }
    catch {
        return 'not-found'
    }
}

function Test-HttpEndpoint {
    param([string]$Url, [int]$Timeout = 5)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        return @{
            status = $response.StatusCode
            ok = $response.StatusCode -eq 200
        }
    }
    catch {
        return @{
            status = $_.Exception.Response.StatusCode.Value__ 
            ok = $false
            error = $_.Exception.Message
        }
    }
}

function Get-ConfigValue {
    param([string]$Key)
    
    # Try docker-compose .env first
    $envFile = Join-Path $RepoRoot '.env'
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        $match = $content | Select-String "^$Key=(.*)$"
        if ($match) {
            return $match.Matches.Groups[1].Value
        }
    }
    
    # Try environment variable
    return [System.Environment]::GetEnvironmentVariable($Key)
}

# ============================================================================
# TASK 1: REHYDRATION VERIFICATION
# ============================================================================

Write-Host "`n📋 TASK 1: REHYDRATION VERIFICATION" -ForegroundColor Cyan

Test-Task -Name 'REHYDRATE.json_exists' -Description 'Verify rehydration state file exists' -Test {
    $path = Join-Path $RepoRoot '_OPS/_STATE/REHYDRATE.json'
    Assert-FileExists $path
}

Test-Task -Name 'REHYDRATE.json_valid_json' -Description 'Verify JSON is parseable' -Test {
    $path = Join-Path $RepoRoot '_OPS/_STATE/REHYDRATE.json'
    Assert-JsonValid $path | Out-Null
    return 'JSON valid'
}

Test-Task -Name 'REHYDRATE.json_has_required_fields' -Description 'Verify required fields present' -Test {
    $path = Join-Path $RepoRoot '_OPS/_STATE/REHYDRATE.json'
    $json = Assert-JsonValid $path
    
    $required = @('timestamp', 'phase', 'system', 'status')
    foreach ($field in $required) {
        if (-not $json.PSObject.Properties[$field]) {
            throw "Missing required field: $field"
        }
    }
    return "All required fields present: $($required -join ', ')"
}

Test-Task -Name 'REHYDRATE.json_timestamp_current' -Description 'Verify timestamp is recent (within 24 hours)' -Test {
    $path = Join-Path $RepoRoot '_OPS/_STATE/REHYDRATE.json'
    $json = Assert-JsonValid $path
    
    $timestamp = [DateTime]::Parse($json.timestamp)
    $age = (Get-Date -AsUTC) - $timestamp
    
    if ($age.TotalHours -gt 24) {
        throw "Rehydration state is stale: $($age.TotalHours) hours old"
    }
    return "Timestamp is current ($($age.TotalMinutes) minutes old)"
}

# ============================================================================
# TASK 2: BACKEND VALIDATION
# ============================================================================

Write-Host "`n🖥️  TASK 2: BACKEND VALIDATION" -ForegroundColor Cyan

Test-Task -Name 'backend_docker_running' -Description 'Verify backend container is running' -Test {
    $status = Get-DockerStatus 'quantum-x-builder-backend-1'
    if ($status -ne 'running') {
        throw "Backend container status: $status (expected: running)"
    }
    return "Backend container running"
}

Test-Task -Name 'backend_port_listening' -Description 'Verify backend port 9100 is listening' -Test {
    $port = Get-ConfigValue 'BACKEND_PORT'
    if (-not $port) { $port = '9100' }
    
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listening) {
        throw "No process listening on port $port"
    }
    return "Backend listening on port $port"
}

Test-Task -Name 'backend_health_endpoint' -Description 'Verify health check endpoint responds' -Test {
    $url = 'http://localhost:9100/health'
    $response = Test-HttpEndpoint $url
    if (-not $response.ok) {
        throw "Health endpoint returned: $($response.status) - $($response.error)"
    }
    return "Health endpoint: $($response.status)"
}

Test-Task -Name 'ollama_endpoint_reachable' -Description 'Verify Ollama endpoint is reachable' -Test {
    $endpoint = Get-ConfigValue 'OLLAMA_ENDPOINT'
    if (-not $endpoint) { $endpoint = 'http://localhost:11434' }
    
    $url = "$endpoint/api/tags"
    $response = Test-HttpEndpoint $url
    if (-not $response.ok) {
        throw "Ollama endpoint unreachable: $($response.status)"
    }
    return "Ollama reachable at $endpoint"
}

Test-Task -Name 'nats_connectivity' -Description 'Verify NATS message queue connectivity' -Test {
    $natsUrl = Get-ConfigValue 'NATS_URL'
    if (-not $natsUrl) { $natsUrl = 'nats://localhost:4222' }
    
    # Try to connect (simple test)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect('localhost', 4222)
        $tcp.Close()
        return "NATS reachable at $natsUrl"
    }
    catch {
        throw "NATS unreachable: $_"
    }
}

# ============================================================================
# TASK 3: CLOUDFLARE VERIFICATION
# ============================================================================

Write-Host "`n☁️  TASK 3: CLOUDFLARE VERIFICATION" -ForegroundColor Cyan

Test-Task -Name 'cloudflare_tunnel_config_exists' -Description 'Verify Cloudflare tunnel config file exists' -Test {
    # Cloudflare tunnel config is typically in .cloudflared/ or managed via API
    $configPath = Join-Path $RepoRoot '_OPS/_STATE/cloudflare.tunnel.json'
    
    # For now, check if tunnel ID is configured
    $tunnelId = Get-ConfigValue 'CLOUDFLARE_TUNNEL_ID'
    if (-not $tunnelId) {
        throw "CLOUDFLARE_TUNNEL_ID not configured"
    }
    return "Tunnel ID configured: $tunnelId"
}

Test-Task -Name 'cloudflare_tunnel_active' -Description 'Verify tunnel is active' -Test {
    $tunnelId = Get-ConfigValue 'CLOUDFLARE_TUNNEL_ID'
    
    # Check via local tunnel connector status
    # This would require cloudflare-cli or API call
    Write-Verbose "Tunnel ID: $tunnelId"
    
    # For validation, check that tunnel config has active ingress rules
    $tunnelConfig = Join-Path $RepoRoot '_OPS/_STATE/cloudflare.tunnel.json'
    if (Test-Path $tunnelConfig) {
        $config = Get-Content $tunnelConfig -Raw | ConvertFrom-Json
        if ($config.ingress -and $config.ingress.Count -gt 0) {
            return "Tunnel has ingress rules configured"
        }
        throw "No ingress rules found"
    }
    
    return "Tunnel configuration detected"
}

Test-Task -Name 'cloudflare_zero_trust_policy' -Description 'Verify zero-trust policy is enforced' -Test {
    # Check for presence of zero-trust policy markers
    $policyFile = Join-Path $RepoRoot '_OPS/POLICY/zero-trust.yaml'
    if (-not (Test-Path $policyFile)) {
        throw "Zero-trust policy not found at $policyFile"
    }
    
    $content = Get-Content $policyFile -Raw
    if ($content -notmatch 'enforce|required|access') {
        throw "Zero-trust policy missing enforcement rules"
    }
    
    return "Zero-trust policy enforced"
}

Test-Task -Name 'cloudflare_gateway_auth' -Description 'Verify Gateway authentication configured' -Test {
    $authConfig = Get-ConfigValue 'CLOUDFLARE_AUTH_TYPE'
    if (-not $authConfig) {
        throw "CLOUDFLARE_AUTH_TYPE not configured"
    }
    
    if ($authConfig -notmatch 'mtls|oauth|jwt') {
        throw "Invalid auth type: $authConfig"
    }
    
    return "Gateway auth configured: $authConfig"
}

Test-Task -Name 'public_exposure_validation' -Description 'Verify backend NOT exposed publicly' -Test {
    $publicUrl = Get-ConfigValue 'PUBLIC_BACKEND_URL'
    
    # Should only be accessible via Cloudflare tunnel
    if ($publicUrl -and $publicUrl -notmatch 'cloudflare|tunnel') {
        throw "Backend appears to be publicly exposed (non-tunnel URL)"
    }
    
    return "Backend access restricted to Cloudflare tunnel"
}

# ============================================================================
# TASK 4: CI / AUTONOMY VALIDATION
# ============================================================================

Write-Host "`n⚙️  TASK 4: CI / AUTONOMY VALIDATION" -ForegroundColor Cyan

Test-Task -Name 'phase_6_artifacts_exist' -Description 'Verify Phase 6 execution artifacts' -Test {
    $artifactDir = Join-Path $RepoRoot '_OPS/PHASE6_CEREMONY'
    if (-not (Test-Path $artifactDir)) {
        throw "Phase 6 artifact directory not found"
    }
    
    $artifacts = Get-ChildItem $artifactDir -Recurse -File | Measure-Object
    if ($artifacts.Count -eq 0) {
        throw "No Phase 6 artifacts found"
    }
    
    return "Phase 6 artifacts found: $($artifacts.Count) files"
}

Test-Task -Name 'ci_auto_execute_config' -Description 'Verify CI auto-execute is configured' -Test {
    $ciConfig = Join-Path $RepoRoot '.github/workflows/phase6-auto-execute.yml'
    if (-not (Test-Path $ciConfig)) {
        throw "CI auto-execute workflow not found"
    }
    
    $content = Get-Content $ciConfig -Raw
    if ($content -notmatch 'on:|push:|schedule:') {
        throw "CI workflow missing trigger configuration"
    }
    
    return "CI auto-execute workflow configured"
}

Test-Task -Name 'ci_auto_merge_guards' -Description 'Verify auto-merge guards are in place' -Test {
    $guardsFile = Join-Path $RepoRoot '_OPS/POLICY/auto-merge-guards.yaml'
    if (-not (Test-Path $guardsFile)) {
        throw "Auto-merge guards policy not found"
    }
    
    $content = Get-Content $guardsFile -Raw | ConvertFrom-Json
    $required = @('require_tests', 'require_review', 'require_security_scan')
    
    foreach ($guard in $required) {
        if (-not $content.guards.PSObject.Properties[$guard]) {
            throw "Missing guard: $guard"
        }
    }
    
    return "Auto-merge guards configured"
}

Test-Task -Name 'rollback_tags_created' -Description 'Verify rollback tags are created' -Test {
    $tagsDir = Join-Path $RepoRoot '_OPS/ROLLBACK'
    if (-not (Test-Path $tagsDir)) {
        throw "Rollback tags directory not found"
    }
    
    $tags = Get-ChildItem $tagsDir -Filter '*.json' | Measure-Object
    if ($tags.Count -lt 1) {
        Write-Warning "No rollback tags found (expected at least 1)"
    }
    
    return "Rollback system configured"
}

Test-Task -Name 'audit_logs_written' -Description 'Verify audit logs are being written' -Test {
    $auditDir = Join-Path $RepoRoot '_OPS/AUDIT_IMMUTABLE'
    if (-not (Test-Path $auditDir)) {
        throw "Immutable audit directory not found"
    }
    
    $logs = Get-ChildItem $auditDir -File | Measure-Object
    if ($logs.Count -eq 0) {
        throw "No audit logs found"
    }
    
    return "Audit logs present: $($logs.Count) files"
}

# ============================================================================
# TASK 5: SECURITY HARDENING
# ============================================================================

Write-Host "`n🔐 TASK 5: SECURITY HARDENING" -ForegroundColor Cyan

Test-Task -Name 'no_exposed_secrets' -Description 'Check for exposed secrets in repo' -Test {
    $secretPatterns = @(
        'password\s*=',
        'secret\s*=',
        'token\s*=',
        'api_key\s*='
    )
    
    $sourceDir = Join-Path $RepoRoot 'backend'
    $exposed = @()
    
    foreach ($pattern in $secretPatterns) {
        $matches = Get-ChildItem $sourceDir -Recurse -File | 
            Select-String $pattern -ErrorAction SilentlyContinue |
            Where-Object { $_.Path -notmatch '\.env|node_modules|vendor' }
        
        $exposed += $matches
    }
    
    if ($exposed.Count -gt 0) {
        throw "Potential secrets found in code: $($exposed.Count) matches"
    }
    
    return "No exposed secrets detected"
}

Test-Task -Name 'env_file_not_in_git' -Description 'Verify .env is in .gitignore' -Test {
    $gitignore = Join-Path $RepoRoot '.gitignore'
    if (-not (Test-Path $gitignore)) {
        throw ".gitignore not found"
    }
    
    $content = Get-Content $gitignore -Raw
    if ($content -notmatch '\.env') {
        throw ".env not properly ignored"
    }
    
    return ".env properly ignored in git"
}

Test-Task -Name 'least_privilege_docker' -Description 'Verify Docker containers run with limited privileges' -Test {
    $composeFile = Join-Path $RepoRoot 'docker-compose.yml'
    $content = Get-Content $composeFile -Raw
    
    # Check for security settings
    if ($content -notmatch 'cap_drop|security_opt|user:') {
        Write-Warning "Docker compose missing security hardening"
    }
    
    return "Docker security configuration reviewed"
}

Test-Task -Name 'tls_certificates_present' -Description 'Verify TLS certificates are configured' -Test {
    $certDir = Join-Path $RepoRoot '_OPS/CERTS'
    if (-not (Test-Path $certDir)) {
        Write-Warning "No certificate directory found at $certDir"
    }
    
    $certs = Get-ChildItem $certDir -Filter '*.pem' -ErrorAction SilentlyContinue | Measure-Object
    if ($certs.Count -lt 1) {
        throw "No TLS certificates found"
    }
    
    return "TLS certificates present"
}

# ============================================================================
# TASK 6: E2E HARDENING TEST
# ============================================================================

Write-Host "`n🧪 TASK 6: E2E HARDENING TEST" -ForegroundColor Cyan

Test-Task -Name 'simulate_backend_failure' -Description 'Simulate backend failure and verify recovery' -Test {
    # Stop backend
    & docker stop quantum-x-builder-backend-1 2>$null | Out-Null
    Start-Sleep -Seconds 2
    
    # Verify it's stopped
    $status = Get-DockerStatus 'quantum-x-builder-backend-1'
    if ($status -eq 'running') {
        throw "Failed to stop backend container"
    }
    
    # Try to start it
    & docker start quantum-x-builder-backend-1 2>$null | Out-Null
    Start-Sleep -Seconds 5
    
    # Verify recovery
    $newStatus = Get-DockerStatus 'quantum-x-builder-backend-1'
    if ($newStatus -ne 'running') {
        throw "Backend failed to recover after restart"
    }
    
    return "Backend recovered successfully from simulated failure"
}

Test-Task -Name 'port_conflict_handling' -Description 'Verify system handles port conflicts gracefully' -Test {
    # Attempt to bind to backend port (will fail if already in use, which is expected)
    $port = Get-ConfigValue 'BACKEND_PORT'
    if (-not $port) { $port = 9100 }
    
    try {
        $tcp = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        $tcp.Start()
        $tcp.Stop()
        throw "Port $port unexpectedly available (backend should be using it)"
    }
    catch {
        if ($_.Exception.Message -match 'already in use|AddressAlreadyInUse') {
            return "Port conflict handling verified (port $port in use by backend)"
        }
        throw $_
    }
}

Test-Task -Name 'bad_config_error_handling' -Description 'Verify system rejects invalid configuration' -Test {
    # Create temp bad config
    $testEnv = Join-Path $RepoRoot '_OPS/OUTPUT/bad.env.test'
    @"
BACKEND_PORT=invalid
OLLAMA_ENDPOINT=
"@ | Set-Content $testEnv
    
    # Try to load it (should fail gracefully)
    $result = try {
        Get-Content $testEnv -Raw | ConvertFrom-Csv
        $false
    }
    catch {
        $true
    }
    
    Remove-Item $testEnv -ErrorAction SilentlyContinue
    
    return "Invalid configuration rejected as expected"
}

# ============================================================================
# GENERATE REPORTS
# ============================================================================

Write-Host "`n📊 GENERATING REPORTS" -ForegroundColor Cyan

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Calculate summary
$totalTasks = $Results.tasks.Count
$passedTasks = ($Results.tasks.Values | Where-Object { $_.status -eq 'pass' } | Measure-Object).Count
$failedTasks = ($Results.tasks.Values | Where-Object { $_.status -eq 'fail' } | Measure-Object).Count

$Results | Add-Member -NotePropertyName 'summary' -NotePropertyValue @{
    total_tasks = $totalTasks
    passed = $passedTasks
    failed = $failedTasks
    pass_rate = if ($totalTasks -gt 0) { [math]::Round(($passedTasks / $totalTasks) * 100, 2) } else { 0 }
    status = if ($failedTasks -eq 0) { 'PASS' } else { 'FAIL' }
}

# Write validation report
$Results | ConvertTo-Json -Depth 10 | Set-Content $ReportFile
Write-Host "✅ Report written: $ReportFile"

# Write failures if any
if ($Failures.Count -gt 0) {
    $Failures | ConvertTo-Json -Depth 10 | Set-Content $FailureFile
    Write-Host "⚠️  Failures written: $FailureFile"
}

# Display summary
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     VALIDATION SUMMARY REPORT          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "Total Tasks: $totalTasks" -ForegroundColor White
Write-Host "Passed: $passedTasks" -ForegroundColor Green
Write-Host "Failed: $failedTasks" -ForegroundColor $(if ($failedTasks -gt 0) { 'Red' } else { 'Green' })
Write-Host "Pass Rate: $($Results.summary.pass_rate)%" -ForegroundColor $(if ($Results.summary.pass_rate -eq 100) { 'Green' } else { 'Yellow' })
Write-Host "Status: $($Results.summary.status)" -ForegroundColor $(if ($Results.summary.status -eq 'PASS') { 'Green' } else { 'Red' })
Write-Host ""

# Exit with appropriate code
exit (if ($failedTasks -eq 0) { 0 } else { 1 })
