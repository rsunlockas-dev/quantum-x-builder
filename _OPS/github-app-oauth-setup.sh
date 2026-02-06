#!/bin/bash
# GitHub App OAuth Setup for Multi-Agent Integration
# Supports: ChatGPT, GitHub Copilot, VS Code Copilot, Google Gemini
# Provides: Read/Write access to quantum-x-builder repository

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub App Configuration
APP_ID="2494652"
CLIENT_ID="Iv23liWSRKS3dsHX0oYV"
CLIENT_SECRET="${GITHUB_APP_SECRET:-123456789123456789}"
WEBHOOK_SECRET="123456789123456789"
GITHUB_ORG="InfinityXOneSystems"
REPO_NAME="quantum-x-builder"

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CREDS_DIR="${REPO_ROOT}/_state/github-app"
CONFIG_DIR="${REPO_ROOT}/.github"

# Files
PRIVATE_KEY_FILE="${CREDS_DIR}/private-key.pem"
TOKEN_CACHE="${CREDS_DIR}/access-token.cache"
CONFIG_FILE="${CONFIG_DIR}/app-config.json"
ENV_FILE="${REPO_ROOT}/.github.env"

mkdir -p "$CREDS_DIR" "$CONFIG_DIR"
chmod 700 "$CREDS_DIR"

# ============================================================================
# FUNCTION: Save Private Key
# ============================================================================
save_private_key() {
    if [ -f "$PRIVATE_KEY_FILE" ]; then
        echo -e "${YELLOW}ℹ️ Private key already exists at ${PRIVATE_KEY_FILE}${NC}"
        return 0
    fi
    
    echo -e "${BLUE}🔐 Saving GitHub App private key...${NC}"
    
    cat > "$PRIVATE_KEY_FILE" << 'EOF'
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA24m8rrRxVa0p1vw+ZlECGwt+EAYUe3J5LuKTgI7SLyutW34l
fTq+KzSqpfrqRLob5OU1JJdpnAMC2XKl8xejdlPPsaiThy/HlP23/E2RZvZBEurX
X4dpQi8bYU67A5I/8vwzoZez5uiPiapY7PP1o3zhzt91PpN6/Q7rfVfHkOVwuqct
hxeNh1tPQGzkxATpl0Y+BwpQ9ph4lpp0tw4V99fBI8Tc6kM5zzmMw0N8Xwpnufa/
YF7YnhNtScbEI5VgvTh1yz++5+K+dA6FfSZrU+Ao1M2tVO52Vp7S4NlJeBv0QKv9
uIJbD+3VA25Kfui8RoDvmpjCPDEijoyVc7SbkQIDAQABAoIBAQDTEdT/XurMBaWB
VZkkw+OzXtQ/0ailm0SZaCuKYUYBJgwRN/IROYYWghdDZz8O/qPM6PW0DYLzBQ4b
RBf65RI6tI+t7jaQtcY8H8dhYq5WAJJF/tU8ujLf9+xqHMi+wUCMfB+jz/eeHJ/M
KqQ+hLr5CRsMy1is5hxL6qlMJDXxvm4sP4fPIkFoHYa1cYY6OPJCMGtsSnCnkGmR
7VfeKcSe2zihqdPucrUSZA/ZuldR6F3hyvnKjTqfIYSRZRfJSMw/AWtEWWCjFMwW
SR4eYa0++EDG7fBqjH/ZF4N+2ms33nqygVj9qOo7a2lJ+/Jrnww+ZVKp+WV+Zlbe
1nFRE6+lAoGBAPLI64MJ+akEPQZMsvx9ECrAn2/wNB5QDhrPD3cSHB/z8XcWADfD
7qjNA8qL6Gzw3O+vyJoUQqLoG9ZiMEU0VTXlVNBRcXJ4dMTp2Iq1hNRlKhsQs9nh
72HXhPFb9u31TCYfsdPuG+ix4yzArcLOn4ZCBSc/bWxMrGzH0nx9IgOvAoGBAOd8
4osykwMRXXv5ZrEuWa/Bo7b48DRsBaitiFOMaBpsrLEDMtpt/D2d8eYgBpNt5xFP
/WJilg1AOTDCY6TJhSQpHtJTxTOnWYiYPDXhhmTavWqzSBW6xKEgsZ25TeLdn4Pj
Jcr3X3ieanU1aqij/V14fEg6GNCmCH9ku3hbtOS/AoGAe0iZhwYGt9PGJS/HZ70d
+4eqro3b+VSPhP+GC+GvVG5sPBt46thclWzdsvmOgdthZXjutYb6O3z/vcJIXqvv
ZRnaEpp4sDcInIFeizkXhT8FvY6itU4sX5OwF1uqrTT1gRpxE3wCwguqnywMUDLa
ALP/p+lmaCsbF3X0pXBpWFMCgYEAyZPRfp86r4g2nNdwGkgfZ1I66wFZwnxybRE3
znFM0f3iX35GkTkHVuysEdW/hDBG76d1IXBx8/YCFzifJocpfnSkV0kFR1aqO609
eTn7GuXz3e9ijTGHOjxLDuqnLTAKUQHDDjxdkZ55W7l5OIMdBYD+0LJum3qJmc2x
Bjzth+cCgYAwkwYMaqCA1o7hAojSYziuo3WhCQWPN+H/wCknIfYUlzvgTBb4AX//
8O8KBnN959gHV9HyM4RrFaI6cJF+vxLzNEjE2dhv/6dSlBfbOmwqdoMFzvDvNdTe
A9ZGLrNSVMbOC6Upk+JxwGZHczv4YIuFA0pTQS5ZYBvFI95w6cFZcQ==
-----END RSA PRIVATE KEY-----
EOF
    
    chmod 600 "$PRIVATE_KEY_FILE"
    echo -e "${GREEN}✅ Private key saved to ${PRIVATE_KEY_FILE}${NC}"
}

# ============================================================================
# FUNCTION: Generate JWT Token
# ============================================================================
generate_jwt() {
    echo -e "${BLUE}🔑 Generating JWT token for GitHub App...${NC}"
    
    # JWT header
    local header='{"alg":"RS256","typ":"JWT"}'
    local header_encoded=$(echo -n "$header" | base64 -w 0 | tr '+/' '-_' | tr -d '=')
    
    # JWT payload with current timestamp
    local now=$(date +%s)
    local exp=$((now + 600))  # 10 minutes
    local payload="{\"iat\":$now,\"exp\":$exp,\"iss\":\"$APP_ID\"}"
    local payload_encoded=$(echo -n "$payload" | base64 -w 0 | tr '+/' '-_' | tr -d '=')
    
    # JWT signature
    local message="$header_encoded.$payload_encoded"
    local signature=$(echo -n "$message" | openssl dgst -sha256 -sign "$PRIVATE_KEY_FILE" | base64 -w 0 | tr '+/' '-_' | tr -d '=')
    
    local jwt="$message.$signature"
    echo "$jwt"
}

# ============================================================================
# FUNCTION: Get Installation ID
# ============================================================================
get_installation_id() {
    local jwt="$1"
    echo -e "${BLUE}🔍 Fetching installation ID for ${GITHUB_ORG}...${NC}"
    
    local response=$(curl -s -X GET \
        -H "Authorization: Bearer $jwt" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/app/installations")
    
    # Extract installation ID for our organization
    local install_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    
    if [ -z "$install_id" ]; then
        echo -e "${RED}❌ Could not find installation for ${GITHUB_ORG}${NC}"
        echo -e "${YELLOW}Install the app at: https://github.com/apps/infinity-xos-orchestrator${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Installation ID: $install_id${NC}"
    echo "$install_id"
}

# ============================================================================
# FUNCTION: Get Access Token
# ============================================================================
get_access_token() {
    local jwt="$1"
    local install_id="$2"
    
    echo -e "${BLUE}🎫 Generating access token (Installation: $install_id)...${NC}"
    
    # Request token with permissions for read/write access
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $jwt" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/app/installations/$install_id/access_tokens" \
        -d '{
            "permissions": {
                "contents": "write",
                "pull_requests": "write",
                "workflows": "write",
                "administration": "read",
                "issues": "write",
                "repository_projects": "write"
            },
            "repositories": ["'"$REPO_NAME"'"]
        }')
    
    local token=$(echo "$response" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
    local expiration=$(echo "$response" | grep -o '"expires_at":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo -e "${RED}❌ Failed to generate access token${NC}"
        echo "$response"
        exit 1
    fi
    
    # Save token to cache
    cat > "$TOKEN_CACHE" << TOKENEOF
{
  "token": "$token",
  "expires_at": "$expiration",
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "installation_id": "$install_id"
}
TOKENEOF
    chmod 600 "$TOKEN_CACHE"
    
    echo -e "${GREEN}✅ Access token generated (expires: $expiration)${NC}"
    echo "$token"
}

# ============================================================================
# FUNCTION: Configure Git
# ============================================================================
configure_git() {
    local token="$1"
    
    echo -e "${BLUE}🔧 Configuring Git with GitHub App credentials...${NC}"
    
    # Configure git credential helper
    git config --global credential.helper store
    git config --global credential.useHttpPath true
    
    # Set commit author
    git config --global user.email "infinity-xos-orchestrator@github.com"
    git config --global user.name "Infinity XOS Orchestrator"
    
    # Create git credentials file
    mkdir -p ~/.config/git
    cat > ~/.config/git/credentials << CREDSEOF
https://x-access-token:${token}@github.com
CREDSEOF
    chmod 600 ~/.config/git/credentials
    
    echo -e "${GREEN}✅ Git configured with GitHub App credentials${NC}"
}

# ============================================================================
# FUNCTION: Create Configuration File
# ============================================================================
create_config_file() {
    local token="$1"
    local install_id="$2"
    
    echo -e "${BLUE}📝 Creating configuration file...${NC}"
    
    cat > "$CONFIG_FILE" << CONFIGEOF
{
  "github_app": {
    "app_id": "$APP_ID",
    "client_id": "$CLIENT_ID",
    "organization": "$GITHUB_ORG",
    "repository": "$REPO_NAME",
    "installation_id": "$install_id"
  },
  "permissions": {
    "contents": "write",
    "pull_requests": "write",
    "workflows": "write",
    "administration": "read",
    "issues": "write",
    "repository_projects": "write"
  },
  "ai_integrations": {
    "chatgpt": {
      "enabled": true,
      "auth_method": "github_oauth",
      "scopes": ["repo", "user:email"]
    },
    "github_copilot": {
      "enabled": true,
      "auth_method": "github_app_token",
      "requires": "write_access"
    },
    "vscode_copilot": {
      "enabled": true,
      "auth_method": "github_app_token",
      "requires": "write_access"
    },
    "google_gemini": {
      "enabled": true,
      "auth_method": "github_oauth",
      "scopes": ["repo", "user:email"]
    }
  },
  "endpoints": {
    "api": "https://api.github.com",
    "oauth_authorize": "https://github.com/login/oauth/authorize",
    "oauth_token": "https://github.com/login/oauth/access_token",
    "app_url": "https://github.com/apps/infinity-xos-orchestrator"
  },
  "webhook": {
    "enabled": false,
    "url": "https://admin.infinityxai.com/webhooks/github",
    "secret": "configured"
  }
}
CONFIGEOF
    chmod 600 "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ Configuration file created: ${CONFIG_FILE}${NC}"
}

# ============================================================================
# FUNCTION: Create Environment File
# ============================================================================
create_env_file() {
    local token="$1"
    local install_id="$2"
    
    echo -e "${BLUE}📝 Creating .env file for AI integrations...${NC}"
    
    cat > "$ENV_FILE" << ENVEOF
# GitHub App Configuration
GITHUB_APP_ID=$APP_ID
GITHUB_CLIENT_ID=$CLIENT_ID
GITHUB_CLIENT_SECRET=$CLIENT_SECRET
GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
GITHUB_ORG=$GITHUB_ORG
GITHUB_REPO=$REPO_NAME
GITHUB_INSTALLATION_ID=$install_id

# GitHub App Access Token (valid for 1 hour)
GITHUB_APP_TOKEN=$token

# AI Service Configurations
# ChatGPT Integration
CHATGPT_GITHUB_AUTH_ENABLED=true
CHATGPT_SCOPES=repo,user:email,admin:repo_hook

# GitHub Copilot Integration
GITHUB_COPILOT_ENABLED=true
GITHUB_COPILOT_AUTH_METHOD=app_token

# VS Code Copilot Integration
VSCODE_COPILOT_ENABLED=true
VSCODE_COPILOT_AUTH_METHOD=app_token

# Google Gemini Integration
GOOGLE_GEMINI_GITHUB_AUTH_ENABLED=true
GOOGLE_GEMINI_SCOPES=repo,user:email

# Git Configuration
GIT_AUTHOR_NAME=Infinity XOS Orchestrator
GIT_AUTHOR_EMAIL=infinity-xos-orchestrator@github.com
GIT_COMMITTER_NAME=Infinity XOS Orchestrator
GIT_COMMITTER_EMAIL=infinity-xos-orchestrator@github.com

# Security
CREDENTIALS_FILE_PATH=${PRIVATE_KEY_FILE}
TOKEN_CACHE_PATH=${TOKEN_CACHE}
CONFIG_FILE_PATH=${CONFIG_FILE}

# Permissions
REPO_WRITE_ACCESS=true
PULL_REQUEST_WRITE_ACCESS=true
WORKFLOWS_WRITE_ACCESS=true
ISSUES_WRITE_ACCESS=true
ENVEOF
    
    chmod 600 "$ENV_FILE"
    
    echo -e "${GREEN}✅ Environment file created: ${ENV_FILE}${NC}"
    echo -e "${YELLOW}⚠️  Remember to add ${ENV_FILE} to .gitignore${NC}"
}

# ============================================================================
# FUNCTION: Display Setup Summary
# ============================================================================
display_summary() {
    local token="$1"
    local install_id="$2"
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     GitHub App Setup Complete - Multi-Agent Integration       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${BLUE}📋 GitHub App Configuration:${NC}"
    echo -e "   App ID: $APP_ID"
    echo -e "   Organization: $GITHUB_ORG"
    echo -e "   Repository: $REPO_NAME"
    echo -e "   Installation ID: $install_id"
    echo ""
    
    echo -e "${BLUE}🔐 Credentials Location:${NC}"
    echo -e "   Private Key: $PRIVATE_KEY_FILE"
    echo -e "   Token Cache: $TOKEN_CACHE"
    echo -e "   Configuration: $CONFIG_FILE"
    echo -e "   Environment: $ENV_FILE"
    echo ""
    
    echo -e "${BLUE}🤖 Supported AI Integrations:${NC}"
    echo -e "   ✅ ChatGPT - OAuth via GitHub"
    echo -e "   ✅ GitHub Copilot - Direct token"
    echo -e "   ✅ VS Code Copilot - Direct token"
    echo -e "   ✅ Google Gemini - OAuth via GitHub"
    echo ""
    
    echo -e "${BLUE}📝 Permissions Granted:${NC}"
    echo -e "   ✅ Contents (read/write)"
    echo -e "   ✅ Pull Requests (read/write)"
    echo -e "   ✅ Workflows (read/write)"
    echo -e "   ✅ Issues (read/write)"
    echo -e "   ✅ Repository Projects (read/write)"
    echo -e "   ✅ Administration (read-only)"
    echo ""
    
    echo -e "${BLUE}🔗 OAuth Setup Instructions:${NC}"
    echo -e "   1. Go to: https://github.com/settings/oauth-apps"
    echo -e "   2. Create new OAuth App with these settings:"
    echo -e "      Authorization callback URL: https://admin.infinityxai.com/auth/github/callback"
    echo -e "   3. For each AI service, use your GitHub account to authorize:"
    echo -e "      • ChatGPT: https://chat.openai.com/auth/github"
    echo -e "      • GitHub Copilot: Built-in GitHub authentication"
    echo -e "      • VS Code Copilot: https://github.com/login/oauth/authorize?..."
    echo -e "      • Gemini: https://gemini.google.com/auth/github"
    echo ""
    
    echo -e "${BLUE}🧪 Testing Git Access:${NC}"
    echo -e "   git ls-remote https://github.com/${GITHUB_ORG}/${REPO_NAME}"
    echo -e "   git clone https://github.com/${GITHUB_ORG}/${REPO_NAME}"
    echo ""
    
    echo -e "${BLUE}🔄 Token Refresh (hourly):${NC}"
    echo -e "   bash $SCRIPT_DIR/$(basename "$0") refresh-token"
    echo ""
    
    echo -e "${YELLOW}⚠️  Security Notes:${NC}"
    echo -e "   • All credential files are mode 600 (owner-only read)"
    echo -e "   • Never commit ${ENV_FILE} to version control"
    echo -e "   • Tokens expire hourly - refresh automatically"
    echo -e "   • Rotate private key if compromised"
    echo ""
    
    echo -e "${GREEN}✅ Ready to use with all AI services!${NC}"
}

# ============================================================================
# FUNCTION: Refresh Token
# ============================================================================
refresh_token() {
    echo -e "${BLUE}♻️  Refreshing GitHub App access token...${NC}"
    
    if [ ! -f "$PRIVATE_KEY_FILE" ]; then
        echo -e "${RED}❌ Private key not found. Run setup first.${NC}"
        exit 1
    fi
    
    local jwt=$(generate_jwt)
    local install_id=$(get_installation_id "$jwt")
    local token=$(get_access_token "$jwt" "$install_id")
    
    configure_git "$token"
    update_env_file "$token"
    
    echo -e "${GREEN}✅ Token refreshed successfully${NC}"
}

# ============================================================================
# FUNCTION: Update Environment File
# ============================================================================
update_env_file() {
    local token="$1"
    
    if [ -f "$ENV_FILE" ]; then
        sed -i "s/GITHUB_APP_TOKEN=.*/GITHUB_APP_TOKEN=$token/" "$ENV_FILE"
        echo -e "${GREEN}✅ Environment file updated${NC}"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    local action="${1:-setup}"
    
    case "$action" in
        setup|install)
            echo -e "${BLUE}🚀 Setting up GitHub App for multi-agent AI integration...${NC}"
            echo ""
            
            save_private_key
            echo ""
            
            local jwt=$(generate_jwt)
            echo ""
            
            local install_id=$(get_installation_id "$jwt")
            echo ""
            
            local token=$(get_access_token "$jwt" "$install_id")
            echo ""
            
            configure_git "$token"
            echo ""
            
            create_config_file "$token" "$install_id"
            echo ""
            
            create_env_file "$token" "$install_id"
            echo ""
            
            display_summary "$token" "$install_id"
            ;;
            
        refresh-token|refresh)
            refresh_token
            ;;
            
        status)
            echo -e "${BLUE}📊 GitHub App Status:${NC}"
            if [ -f "$TOKEN_CACHE" ]; then
                echo -e "${GREEN}Token Cache:${NC}"
                cat "$TOKEN_CACHE"
            else
                echo -e "${YELLOW}No cached token found${NC}"
            fi
            ;;
            
        *)
            echo "Usage: $0 {setup|refresh-token|status}"
            echo ""
            echo "Commands:"
            echo "  setup         - Initial GitHub App setup"
            echo "  refresh-token - Refresh access token (run hourly)"
            echo "  status        - Show current token status"
            exit 1
            ;;
    esac
}

main "$@"
