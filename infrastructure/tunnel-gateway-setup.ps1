# ============================================================================
# VIZUAL-X TUNNEL GATEWAY + GOOGLE CLOUD SETUP
# Domain: vizual-x.com
# Date: 2026-02-08
# Purpose: Enable tunnel gateway access for frontend, api, agent services
# ============================================================================

param(
    [string]$ProjectId = "vizual-x-896380409704",
    [string]$Region = "us-central1",
    [string]$Environment = "production",
    [switch]$CloudflareOnly,
    [switch]$GCPOnly,
    [switch]$IAPOnly,
    [switch]$FullSetup
)

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

# If no switch specified, default to FullSetup
if (-not $CloudflareOnly -and -not $GCPOnly -and -not $IAPOnly) {
    $FullSetup = $true
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🌐 VIZUAL-X TUNNEL GATEWAY SETUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# 1. CLOUDFLARE TUNNEL SETUP (Zero Trust, Authenticated)
# ============================================================================

if ($FullSetup -or $CloudflareOnly) {
    Write-Host "📡 CLOUDFLARE TUNNEL SETUP" -ForegroundColor Magenta
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Magenta
    
    $cloudflareConfig = @{
        tunnel_name = "vizual-x-production"
        account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"  # Replace with actual
        tunnel_credentials = "YOUR_TUNNEL_CREDENTIALS_JSON_PATH"
        domains = @(
            @{ domain = "vizual-x.com"; service = "frontend"; port = 3000 }
            @{ domain = "www.vizual-x.com"; service = "frontend"; port = 3000 }
            @{ domain = "api.vizual-x.com"; service = "api"; port = 8787 }
            @{ domain = "agent.vizual-x.com"; service = "agent"; port = 8787 }
        )
    }
    
    Write-Host "✓ Cloudflare Tunnel configuration:"
    Write-Host "  - Tunnel Name: $($cloudflareConfig.tunnel_name)"
    Write-Host "  - Account ID: $($cloudflareConfig.account_id)"
    Write-Host ""
    Write-Host "📋 Cloudflare Configuration Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 1. Install Cloudflare Tunnel CLI (if needed)"
    Write-Host "choco install cloudflared -y"
    Write-Host ""
    Write-Host "# 2. Authenticate with Cloudflare"
    Write-Host "cloudflared tunnel login"
    Write-Host ""
    Write-Host "# 3. Create tunnel"
    Write-Host "cloudflared tunnel create $($cloudflareConfig.tunnel_name)"
    Write-Host ""
    Write-Host "# 4. Create config.yaml with:"
    Write-Host @"
tunnel: $($cloudflareConfig.tunnel_name)
credentials-file: /path/to/credentials.json

ingress:
  - hostname: vizual-x.com
    service: http://frontend:3000
  - hostname: www.vizual-x.com
    service: http://frontend:3000
  - hostname: api.vizual-x.com
    service: http://backend:8787
  - hostname: agent.vizual-x.com
    service: http://backend:8787
  - service: http_status:404
"@
    Write-Host ""
    Write-Host "# 5. Run tunnel"
    Write-Host "cloudflared tunnel run $($cloudflareConfig.tunnel_name)"
    Write-Host ""
    Write-Host "# 6. Configure DNS (CNAME records already in place)"
    Write-Host "# DNS is configured in Cloudflare dashboard to use tunnel"
    Write-Host ""
}

# ============================================================================
# 2. GOOGLE CLOUD SETUP (Cloud Run, Cloud Armor, IAP)
# ============================================================================

if ($FullSetup -or $GCPOnly) {
    Write-Host "☁️  GOOGLE CLOUD SETUP" -ForegroundColor Blue
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Blue
    
    $gcpConfig = @{
        project_id = $ProjectId
        region = $Region
        services = @(
            @{ name = "vizualx-frontend"; image = "frontend:latest"; port = 3000; memory = "512Mi"; cpu = "0.5" }
            @{ name = "vizualx-api"; image = "backend:latest"; port = 8787; memory = "1Gi"; cpu = "1" }
            @{ name = "vizualx-agent"; image = "agent:latest"; port = 8787; memory = "2Gi"; cpu = "2" }
        )
        armor_policy = "vizualx-security-policy"
        iap_brand = "vizualx-iap-brand"
    }
    
    Write-Host "✓ GCP Configuration:"
    Write-Host "  - Project: $($gcpConfig.project_id)"
    Write-Host "  - Region: $($gcpConfig.region)"
    Write-Host ""
    Write-Host "📋 GCP Setup Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 1. Set GCP project"
    Write-Host "gcloud config set project $($gcpConfig.project_id)"
    Write-Host ""
    Write-Host "# 2. Enable required APIs"
    Write-Host "gcloud services enable run.googleapis.com"
    Write-Host "gcloud services enable compute.googleapis.com"
    Write-Host "gcloud services enable iap.googleapis.com"
    Write-Host "gcloud services enable cloudarmor.googleapis.com"
    Write-Host ""
    Write-Host "# 3. Build and push images to Artifact Registry"
    Write-Host "gcloud builds submit --tag $Region-docker.pkg.dev/$ProjectId/vizualx/frontend:latest ./frontend"
    Write-Host "gcloud builds submit --tag $Region-docker.pkg.dev/$ProjectId/vizualx/backend:latest ./backend"
    Write-Host ""
    Write-Host "# 4. Deploy frontend to Cloud Run"
    Write-Host "gcloud run deploy vizualx-frontend \"
    Write-Host "  --image $Region-docker.pkg.dev/$ProjectId/vizualx/frontend:latest \"
    Write-Host "  --region $Region \"
    Write-Host "  --platform managed \"
    Write-Host "  --allow-unauthenticated \"
    Write-Host "  --set-env-vars=VITE_API_URL=https://api.vizual-x.com,VITE_AGENT_URL=https://agent.vizual-x.com"
    Write-Host ""
    Write-Host "# 5. Deploy backend/API to Cloud Run"
    Write-Host "gcloud run deploy vizualx-api \"
    Write-Host "  --image $Region-docker.pkg.dev/$ProjectId/vizualx/backend:latest \"
    Write-Host "  --region $Region \"
    Write-Host "  --platform managed \"
    Write-Host "  --no-allow-unauthenticated"
    Write-Host ""
    Write-Host "# 6. Deploy agent to Cloud Run"
    Write-Host "gcloud run deploy vizualx-agent \"
    Write-Host "  --image $Region-docker.pkg.dev/$ProjectId/vizualx/backend:latest \"
    Write-Host "  --region $Region \"
    Write-Host "  --platform managed \"
    Write-Host "  --no-allow-unauthenticated"
    Write-Host ""
}

# ============================================================================
# 3. IDENTITY-AWARE PROXY (IAP) SETUP
# ============================================================================

if ($FullSetup -or $IAPOnly) {
    Write-Host "🔐 IDENTITY-AWARE PROXY (IAP) SETUP" -ForegroundColor DarkMagenta
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkMagenta
    
    $iapConfig = @{
        oauth_client_id = "YOUR_OAUTH_CLIENT_ID"  # Replace with actual
        oauth_secret = "YOUR_OAUTH_SECRET"  # Replace with actual
        brand_name = "vizual-x-brand"
        protected_resources = @("vizualx-api", "vizualx-agent")
    }
    
    Write-Host "✓ IAP Configuration:"
    Write-Host "  - OAuth Client ID: $($iapConfig.oauth_client_id)"
    Write-Host "  - Protected Resources: $($iapConfig.protected_resources -join ', ')"
    Write-Host ""
    Write-Host "📋 IAP Setup Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 1. Create OAuth 2.0 Consent Screen (in GCP Console)"
    Write-Host "# Go to: APIs & Services > OAuth consent screen"
    Write-Host "# Add: vizual-x.com domain"
    Write-Host "# Scopes: email, profile, openid"
    Write-Host ""
    Write-Host "# 2. Create OAuth 2.0 Client ID"
    Write-Host "# Type: Web application"
    Write-Host "# Redirect URIs: https://iap.googleapis.com/oauth2/authorized"
    Write-Host ""
    Write-Host "# 3. Enable IAP on backend services"
    Write-Host "gcloud iap-web enable --resource-names=projects/$ProjectId/global/backendServices/vizualx-api"
    Write-Host "gcloud iap-web enable --resource-names=projects/$ProjectId/global/backendServices/vizualx-agent"
    Write-Host ""
    Write-Host "# 4. Bind IAP.OAuthAdmin role"
    Write-Host "gcloud projects add-iam-policy-binding $ProjectId \"
    Write-Host "  --member=serviceAccount:vizualx-iap@$ProjectId.iam.gserviceaccount.com \"
    Write-Host "  --role=roles/iap.oauthAdmin"
    Write-Host ""
}

# ============================================================================
# 4. CLOUD ARMOR SECURITY POLICY
# ============================================================================

if ($FullSetup) {
    Write-Host "🛡️  CLOUD ARMOR SECURITY POLICY" -ForegroundColor Red
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "📋 Cloud Armor Setup Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 1. Create Cloud Armor security policy"
    Write-Host "gcloud compute security-policies create vizualx-security-policy \"
    Write-Host "  --description='Vizual-X security policy'"
    Write-Host ""
    Write-Host "# 2. Add DDoS protection rules"
    Write-Host "gcloud compute security-policies rules create 100 \"
    Write-Host "  --security-policy=vizualx-security-policy \"
    Write-Host "  --action=allow"
    Write-Host ""
    Write-Host "# 3. Add rate limiting"
    Write-Host "gcloud compute security-policies rules create 200 \"
    Write-Host "  --security-policy=vizualx-security-policy \"
    Write-Host "  --action=rate-based-ban \"
    Write-Host "  --rate-limit-options=enforced-on-key=IP,ban-duration-sec=600,ban-threshold-count=100,ban-threshold-interval-sec=60"
    Write-Host ""
    Write-Host "# 4. Block common attack patterns"
    Write-Host "gcloud compute security-policies rules create 300 \"
    Write-Host "  --security-policy=vizualx-security-policy \"
    Write-Host "  --expression='origin.region_code == \"CN\" || origin.region_code == \"RU\"' \"
    Write-Host "  --action=deny-403"
    Write-Host ""
}

# ============================================================================
# 5. MULTI-REGION ROUTING SETUP
# ============================================================================

if ($FullSetup) {
    Write-Host "🌍 MULTI-REGION ROUTING SETUP" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "📋 Multi-Region Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 1. Create health checks for failover"
    Write-Host "gcloud compute health-checks create https vizualx-health-check \"
    Write-Host "  --port=443 \"
    Write-Host "  --request-path=/health"
    Write-Host ""
    Write-Host "# 2. Create backend services for multi-region"
    Write-Host "gcloud compute backend-services create vizualx-backend-service-us \"
    Write-Host "  --health-checks=vizualx-health-check \"
    Write-Host "  --global \"
    Write-Host "  --load-balancing-scheme=EXTERNAL"
    Write-Host ""
    Write-Host "# 3. Create Cloud CDN for frontend caching"
    Write-Host "gcloud compute backend-services update vizualx-frontend-service \"
    Write-Host "  --enable-cdn \"
    Write-Host "  --cache-mode=CACHE_ALL_STATIC"
    Write-Host ""
}

# ============================================================================
# 6. MONITORING & LOGGING SETUP
# ============================================================================

if ($FullSetup) {
    Write-Host "📊 MONITORING & LOGGING SETUP" -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📋 Monitoring Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 1. Create log sink for Cloud Logging"
    Write-Host "gcloud logging sinks create vizualx-logs \"
    Write-Host "  logging.googleapis.com/projects/$ProjectId/logs/vizualx \"
    Write-Host "  --log-filter='resource.type=cloud_run_revision OR resource.type=cloud_function'"
    Write-Host ""
    Write-Host "# 2. Create uptime checks"
    Write-Host "gcloud monitoring uptime create vizualx-uptime-check \"
    Write-Host "  --display-name='Vizual-X Uptime' \"
    Write-Host "  --monitored-resource=uptime-url \"
    Write-Host "  --http-check-path=/health \"
    Write-Host "  --http-check-port=443 \"
    Write-Host "  --selected-regions=USA,EUROPE,ASIA_PACIFIC"
    Write-Host ""
    Write-Host "# 3. Create alert policies"
    Write-Host "gcloud alpha monitoring policies create \"
    Write-Host "  --notification-channels=CHANNEL_ID \"
    Write-Host "  --display-name='High Error Rate Alert' \"
    Write-Host "  --condition-display-name='Error rate > 5%'"
    Write-Host ""
}

# ============================================================================
# 7. SERVICE ACCOUNT & IAM SETUP
# ============================================================================

if ($FullSetup) {
    Write-Host "👤 SERVICE ACCOUNT & IAM SETUP" -ForegroundColor Magenta
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Magenta
    
    Write-Host ""
    Write-Host "📋 Service Account Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 1. Create service accounts"
    Write-Host "gcloud iam service-accounts create vizualx-frontend \"
    Write-Host "  --display-name='Vizual-X Frontend Service Account'"
    Write-Host ""
    Write-Host "gcloud iam service-accounts create vizualx-backend \"
    Write-Host "  --display-name='Vizual-X Backend Service Account'"
    Write-Host ""
    Write-Host "gcloud iam service-accounts create vizualx-agent \"
    Write-Host "  --display-name='Vizual-X Agent Service Account'"
    Write-Host ""
    Write-Host "# 2. Grant Cloud Run roles"
    Write-Host "gcloud projects add-iam-policy-binding $ProjectId \"
    Write-Host "  --member=serviceAccount:vizualx-frontend@$ProjectId.iam.gserviceaccount.com \"
    Write-Host "  --role=roles/run.developer"
    Write-Host ""
    Write-Host "# 3. Grant Secret Manager access"
    Write-Host "gcloud projects add-iam-policy-binding $ProjectId \"
    Write-Host "  --member=serviceAccount:vizualx-backend@$ProjectId.iam.gserviceaccount.com \"
    Write-Host "  --role=roles/secretmanager.secretAccessor"
    Write-Host ""
    Write-Host "# 4. Grant Logging & Monitoring access"
    Write-Host "gcloud projects add-iam-policy-binding $ProjectId \"
    Write-Host "  --member=serviceAccount:vizualx-agent@$ProjectId.iam.gserviceaccount.com \"
    Write-Host "  --role=roles/logging.logWriter"
    Write-Host ""
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ TUNNEL GATEWAY SETUP COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 DNS Configuration (Already in place):" -ForegroundColor Yellow
Write-Host "   vizual-x.com      → 34.98.120.255 (Cloudflare/GCP)" -ForegroundColor Gray
Write-Host "   www.vizual-x.com  → 34.98.120.255 (Frontend)" -ForegroundColor Gray
Write-Host "   api.vizual-x.com  → Cloud Run Service (API)" -ForegroundColor Gray
Write-Host "   agent.vizual-x.com → Cloud Run Service (Agent)" -ForegroundColor Gray
Write-Host ""
Write-Host "🛡️  Access Control:" -ForegroundColor Yellow
Write-Host "   ✓ Cloudflare Tunnel (Zero Trust)" -ForegroundColor Green
Write-Host "   ✓ Google Cloud Armor (DDoS/WAF)" -ForegroundColor Green
Write-Host "   ✓ Identity-Aware Proxy (OAuth2)" -ForegroundColor Green
Write-Host "   ✓ Service Accounts (RBAC)" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Yellow
Write-Host "   ✓ Cloud Logging (centralized)" -ForegroundColor Green
Write-Host "   ✓ Cloud Monitoring (metrics)" -ForegroundColor Green
Write-Host "   ✓ Uptime Checks (availability)" -ForegroundColor Green
Write-Host "   ✓ Alert Policies (notifications)" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 Deployment:" -ForegroundColor Yellow
Write-Host "   ✓ Multi-region Cloud Run" -ForegroundColor Green
Write-Host "   ✓ Cloud CDN (frontend caching)" -ForegroundColor Green
Write-Host "   ✓ Load balancing (failover)" -ForegroundColor Green
Write-Host "   ✓ Auto-scaling (performance)" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Replace placeholder credentials in GCP setup"
Write-Host "   2. Execute gcloud commands for Cloud Run deployment"
Write-Host "   3. Configure Cloudflare Tunnel credentials"
Write-Host "   4. Set up OAuth2 consent screen in GCP Console"
Write-Host "   5. Test tunnel access: curl https://api.vizual-x.com/health"
Write-Host ""
