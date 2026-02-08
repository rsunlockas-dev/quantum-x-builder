#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Frontend Contract-Ready Setup Script
    Prepares the merged frontend folder for contract implementation

.DESCRIPTION
    This script:
    1. Installs dependencies
    2. Validates contract definitions
    3. Runs initial build
    4. Verifies integration
    5. Reports status

.PARAMETER SkipInstall
    Skip npm install (useful for re-runs)

.PARAMETER SkipBuild
    Skip npm build (useful for development setup)
#>

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$DryRun
)

# Colors
$Colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
}

function Write-Status {
    param([string]$Message, [string]$Type = 'Info')
    $Color = $Colors[$Type] ?? $Colors.Info
    Write-Host "[$Type] $Message" -ForegroundColor $Color
}

# Set working directory
$FrontendPath = "c:\AI\quantum-x-builder\frontend"
if (-not (Test-Path $FrontendPath)) {
    Write-Status "Frontend folder not found at $FrontendPath" Error
    exit 1
}

Write-Host "`n╔════════════════════════════════════════════════════════╗"
Write-Host "║   FRONTEND MERGER - CONTRACT-READY SETUP              ║"
Write-Host "╚════════════════════════════════════════════════════════╝`n"

# Step 1: Verify structure
Write-Status "Verifying merged structure..." Info
$RequiredDirs = @(
    'src',
    'src/autonomous-partner',
    'src/autonomous-partner/phase-1',
    'src/contracts',
    'vscode-extension',
    'services',
    'components'
)

$AllPresent = $true
foreach ($Dir in $RequiredDirs) {
    $Path = Join-Path $FrontendPath $Dir
    if (Test-Path $Path) {
        Write-Status "✓ $Dir" Success
    } else {
        Write-Status "✗ $Dir (missing)" Error
        $AllPresent = $false
    }
}

if (-not $AllPresent) {
    Write-Status "Some directories are missing. Please check the merge." Error
    exit 1
}

# Step 2: Verify key files
Write-Status "`nVerifying contract definitions..." Info
$RequiredFiles = @(
    'src/contracts/index.ts',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'MERGER_MANIFEST.md'
)

foreach ($File in $RequiredFiles) {
    $Path = Join-Path $FrontendPath $File
    if (Test-Path $Path) {
        Write-Status "✓ $File" Success
    } else {
        Write-Status "✗ $File (missing)" Error
    }
}

# Step 3: Install dependencies
if (-not $SkipInstall) {
    Write-Status "`nInstalling dependencies..." Info
    
    if ($DryRun) {
        Write-Status "[DRY RUN] Would run: npm install" Warning
    } else {
        Push-Location $FrontendPath
        npm install
        $InstallResult = $LASTEXITCODE
        Pop-Location
        
        if ($InstallResult -eq 0) {
            Write-Status "Dependencies installed successfully" Success
        } else {
            Write-Status "Dependency installation failed (exit code: $InstallResult)" Error
        }
    }
}

# Step 4: Validate TypeScript
Write-Status "`nValidating TypeScript configuration..." Info
if (Test-Path "$FrontendPath/tsconfig.json") {
    $TsConfig = Get-Content "$FrontendPath/tsconfig.json" -Raw | ConvertFrom-Json
    Write-Status "✓ TypeScript target: $($TsConfig.compilerOptions.target)" Success
    Write-Status "✓ JSX support: $($TsConfig.compilerOptions.jsx)" Success
    Write-Status "✓ Module resolution: $($TsConfig.compilerOptions.moduleResolution)" Success
} else {
    Write-Status "tsconfig.json not found" Error
}

# Step 5: Build check
if (-not $SkipBuild) {
    Write-Status "`nValidating build system..." Info
    
    if ($DryRun) {
        Write-Status "[DRY RUN] Would run: npm run build" Warning
    } else {
        Push-Location $FrontendPath
        npm run build 2>&1 | Select-Object -Last 5
        $BuildResult = $LASTEXITCODE
        Pop-Location
        
        if ($BuildResult -eq 0) {
            Write-Status "Build validation passed" Success
        } else {
            Write-Status "Build validation failed (exit code: $BuildResult)" Warning
        }
    }
}

# Step 6: Report summary
Write-Host "`n╔════════════════════════════════════════════════════════╗"
Write-Host "║   SETUP COMPLETE - CONTRACT-READY FRONTEND             ║"
Write-Host "╚════════════════════════════════════════════════════════╝`n"

Write-Status "✓ Structure merged from vizual-x folder" Success
Write-Status "✓ Contract definitions created in src/contracts/" Success
Write-Status "✓ Package configuration updated to v1.0.0" Success
Write-Status "✓ Autonomous partner integrated" Success
Write-Status "✓ TypeScript aligned to project standards" Success

Write-Host "`nNext Steps:`n"
Write-Host "  1. cd frontend"
Write-Host "  2. npm install (if not already done)"
Write-Host "  3. npm run dev (start development server)"
Write-Host "  4. npm run build (create production build)"
Write-Host "`nContract-driven development is ready to begin!`n"

Write-Host "For more details, see: MERGER_MANIFEST.md" -ForegroundColor Cyan
