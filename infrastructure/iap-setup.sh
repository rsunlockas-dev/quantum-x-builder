#!/bin/bash
# ============================================================================
# Identity-Aware Proxy (IAP) Setup Script
# vizual-x.com Infrastructure
# ============================================================================

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-vizual-x-896380409704}"
REGION="${GCP_REGION:-us-central1}"
BRAND_NAME="vizual-x-iap"
OAUTH_DOMAIN="${OAUTH_DOMAIN:-vizual-x.com}"

echo "════════════════════════════════════════════════════════════"
echo "🔐 IDENTITY-AWARE PROXY SETUP"
echo "════════════════════════════════════════════════════════════"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 1. Enable required APIs
# ─────────────────────────────────────────────────────────────────────────

echo "📡 Enabling required APIs..."
gcloud services enable iap.googleapis.com \
  --project=$PROJECT_ID

gcloud services enable iamcredentials.googleapis.com \
  --project=$PROJECT_ID

gcloud services enable serviceusage.googleapis.com \
  --project=$PROJECT_ID

gcloud services enable compute.googleapis.com \
  --project=$PROJECT_ID

echo "✓ APIs enabled"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 2. Create OAuth consent screen (requires manual completion)
# ─────────────────────────────────────────────────────────────────────────

echo "📋 OAuth 2.0 Consent Screen Setup"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo "2. Select: External"
echo "3. Fill in:"
echo "   - App name: Vizual-X"
echo "   - User support email: support@$OAUTH_DOMAIN"
echo "   - Developer contact: dev@$OAUTH_DOMAIN"
echo "4. Add scopes: email, profile, openid"
echo "5. Add test users (if in development)"
echo ""
echo "Press ENTER when complete..."
read

# ─────────────────────────────────────────────────────────────────────────
# 3. Create OAuth 2.0 Client ID
# ─────────────────────────────────────────────────────────────────────────

echo "📋 OAuth 2.0 Credentials Setup"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "2. Click: Create Credentials > OAuth 2.0 Client ID"
echo "3. Select: Web application"
echo "4. Configure:"
echo "   - Name: Vizual-X IAP"
echo "   - Authorized redirect URIs:"
echo "     https://iap.googleapis.com/oauth2/authorized"
echo "5. Copy: Client ID and Client Secret"
echo ""
echo "Enter OAuth Client ID (or press ENTER to skip for now):"
read CLIENT_ID

echo "Enter OAuth Client Secret (or press ENTER to skip for now):"
read -s CLIENT_SECRET

# ─────────────────────────────────────────────────────────────────────────
# 4. Store credentials in Secret Manager
# ─────────────────────────────────────────────────────────────────────────

if [ ! -z "$CLIENT_ID" ] && [ ! -z "$CLIENT_SECRET" ]; then
  echo ""
  echo "🔒 Storing credentials in Secret Manager..."
  
  # Create secret for Client ID
  echo -n "$CLIENT_ID" | gcloud secrets create oauth-client-id \
    --data-file=- \
    --project=$PROJECT_ID \
    2>/dev/null || gcloud secrets versions add oauth-client-id \
    --data-file=- \
    --project=$PROJECT_ID < <(echo -n "$CLIENT_ID")
  
  # Create secret for Client Secret
  echo -n "$CLIENT_SECRET" | gcloud secrets create oauth-client-secret \
    --data-file=- \
    --project=$PROJECT_ID \
    2>/dev/null || gcloud secrets versions add oauth-client-secret \
    --data-file=- \
    --project=$PROJECT_ID < <(echo -n "$CLIENT_SECRET")
  
  echo "✓ Credentials stored in Secret Manager"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 5. Create service accounts for IAP
# ─────────────────────────────────────────────────────────────────────────

echo "👤 Creating service accounts..."

# Service account for IAP admin
gcloud iam service-accounts create vizualx-iap-admin \
  --display-name="Vizual-X IAP Admin" \
  --project=$PROJECT_ID \
  2>/dev/null || echo "✓ Service account already exists"

# Service account for backend services
gcloud iam service-accounts create vizualx-backend-service \
  --display-name="Vizual-X Backend Service" \
  --project=$PROJECT_ID \
  2>/dev/null || echo "✓ Service account already exists"

echo "✓ Service accounts created"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 6. Grant IAP roles
# ─────────────────────────────────────────────────────────────────────────

echo "🔐 Granting IAP roles..."

# Grant IAP OAuth Admin to service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:vizualx-iap-admin@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/iap.oauthAdmin \
  --project=$PROJECT_ID \
  --quiet

# Grant Service Account User to backend service
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:vizualx-backend-service@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser \
  --project=$PROJECT_ID \
  --quiet

# Grant IAP Secured Tunnel User for accessing protected resources
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:vizualx-backend-service@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/iap.httpsResourceAccessor \
  --project=$PROJECT_ID \
  --quiet

echo "✓ IAP roles assigned"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 7. Configure Cloud Run services for IAP
# ─────────────────────────────────────────────────────────────────────────

echo "🚀 Configuring Cloud Run services..."

# Services to protect with IAP
declare -a SERVICES=("vizualx-api" "vizualx-agent")

for SERVICE in "${SERVICES[@]}"; do
  echo "Configuring $SERVICE..."
  
  # Get the service URL
  SERVICE_URL=$(gcloud run services describe $SERVICE \
    --region=$REGION \
    --format='value(status.url)' \
    --project=$PROJECT_ID \
    2>/dev/null || echo "")
  
  if [ ! -z "$SERVICE_URL" ]; then
    echo "  URL: $SERVICE_URL"
    echo "  ✓ $SERVICE ready for IAP"
  else
    echo "  ⚠️  $SERVICE not found - will be configured after deployment"
  fi
done

echo ""

# ─────────────────────────────────────────────────────────────────────────
# 8. Create backend service for IAP
# ─────────────────────────────────────────────────────────────────────────

echo "📊 Creating backend service for IAP..."

# Note: This requires Load Balancer setup, which is complex via CLI
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "To enable IAP on your services:"
echo "1. Create an HTTPS Load Balancer in GCP Console"
echo "2. Create backend services pointing to Cloud Run services"
echo "3. Enable IAP on the backend service"
echo "4. Configure OAuth consent and client ID"
echo ""
echo "Or use Terraform/Deployment Manager for automated setup"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 9. Test IAP access
# ─────────────────────────────────────────────────────────────────────────

echo "✅ IAP Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Set up HTTPS Load Balancer (manual)"
echo "2. Enable IAP on backend services"
echo "3. Configure OAuth client credentials"
echo "4. Create access policy for protected resources"
echo "5. Add users/groups to IAP access policy"
echo ""
echo "📚 Reference:"
echo "   https://cloud.google.com/iap/docs/concepts-overview"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# 10. Output configuration summary
# ─────────────────────────────────────────────────────────────────────────

echo "═══════════════════════════════════════════════════════════"
echo "📋 CONFIGURATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "OAuth Domain: $OAUTH_DOMAIN"
echo ""
echo "Service Accounts:"
gcloud iam service-accounts list \
  --filter="displayName:Vizual-X" \
  --format='table(email)' \
  --project=$PROJECT_ID
echo ""
echo "Protected Services:"
gcloud run services list \
  --filter="metadata.name:vizualx" \
  --format='table(metadata.name,status.url)' \
  --region=$REGION \
  --project=$PROJECT_ID
echo ""
