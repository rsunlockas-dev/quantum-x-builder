# GitHub App Integration Guide for AI Services

This guide helps you connect your GitHub App with ChatGPT, GitHub Copilot, VS Code Copilot, and Google Gemini for read/write access to your quantum-x-builder repository.

## 📋 Prerequisites

- ✅ GitHub App ID: `2494652`
- ✅ Client ID: `Iv23liWSRKS3dsHX0oYV`
- ✅ Organization: `InfinityXOneSystems`
- ✅ Repository: `quantum-x-builder`

## 🚀 Quick Start

```bash
# Run the OAuth setup script
bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh setup

# Verify credentials
source /workspaces/quantum-x-builder/.github.env

# Test git access
git ls-remote https://github.com/InfinityXOneSystems/quantum-x-builder
```

---

## 1️⃣ ChatGPT Integration

### Setup Steps

**Step 1: Authorize GitHub in ChatGPT**
1. Go to: https://chat.openai.com
2. Click your account → Settings → Connected apps
3. Click "Connect" next to GitHub
4. You'll be redirected to GitHub authorization
5. Click "Authorize OpenAI"
6. Return to ChatGPT

**Step 2: Grant Permissions**
- ✅ Read repository contents
- ✅ Read pull requests and issues
- ✅ Create pull requests and issues
- ✅ Write repository contents
- ✅ Execute workflows and actions
- ✅ Manage deployment environments

**Step 3: Configure in ChatGPT**

In ChatGPT chat, say:
```
"Connect to my GitHub repository at InfinityXOneSystems/quantum-x-builder with read, write, and execute permissions"
```

### Verify Connection
```bash
# Test that ChatGPT can access your repo
curl -H "Authorization: token $(cat /tmp/github_access_token)" \
  https://api.github.com/repos/InfinityXOneSystems/quantum-x-builder
```

---

## 2️⃣ GitHub Copilot Integration

### Setup Steps

**Step 1: Install GitHub Copilot Extension**
1. Go to: https://github.com/copilot
2. Click "Get Copilot"
3. Choose your IDE (VS Code recommended)
4. Click "Install"

**Step 2: Sign In with GitHub**
1. In VS Code: View → Command Palette
2. Type: `Copilot: Sign In`
3. Authorize with your GitHub account
4. Confirm permissions: repo, gist, read:user, workflows (execute)

**Step 3: Enable Quantum-X-Builder Access**
1. VS Code → Settings → Copilot
2. Under "Copilot: Repository Access" add:
   ```
   InfinityXOneSystems/quantum-x-builder
   ```

### Configuration
Create `.github/copilot-config.json`:
```json
{
  "workspace": "quantum-x-builder",
  "organization": "InfinityXOneSystems",
  "repositories": [
    "quantum-x-builder"
  ],
  "permissions": {
    "read": true,
    "write": true,
    "execute": true
  },
  "context": {
    "include": [
      "src/**",
      "backend/**",
      "services/**"
    ],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "_evidence/**"
    ]
  }
}
```

### Verify Connection
In VS Code, type `/workspace` and Copilot should show your repo context.

---

## 3️⃣ VS Code Copilot Integration

### Setup Steps

**Step 1: Install Extensions**
1. VS Code → Extensions
2. Search for: `GitHub Copilot`
3. Click "Install"
4. Also install: `GitHub Copilot Chat`

**Step 2: Sign In**
1. Click Copilot icon (bottom right corner)
2. Click "Sign in to GitHub"
3. Authorize with your GitHub account
4. Select: `repo`, `read:user`, `user:email`

**Step 3: Configure for quantum-x-builder**
1. Open quantum-x-builder workspace in VS Code
2. VS Code will auto-detect GitHub credentials
3. Copilot will load repository context

### Settings
Add to `.vscode/settings.json`:
```json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": false
  },
  "github.copilot.chat.experimental.webview": true,
  "github.copilot.advanced": {
    "debug.overrideEngine": "gpt-4",
    "debug.testOverrideProxyUrl": "",
    "debug.testOverrideProxyStrict": false,
    "debug.overrideProxyUrl": "",
    "authProvider": "github"
  },
  "editor.inlineSuggest.enabled": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Verify Connection
```bash
# Check VS Code authentication
cat ~/.config/Code/User/globalStorage/GitHub.copilot/telemetry.json
```

---

## 4️⃣ Google Gemini Integration

### Setup Steps

**Step 1: Enable Gemini GitHub Connector**
1. Go to: https://gemini.google.com
2. Click Settings → Integrations
3. Find "GitHub"
4. Click "Connect to GitHub"
5. Authorize with your GitHub account

**Step 2: Grant Permissions**
When prompted, allow:
- ✅ Read repository data
- ✅ Read pull requests and issues
- ✅ Create commits and PRs
- ✅ Read workflows
- ✅ Execute workflows and actions
- ✅ Manage secrets and deployments

**Step 3: Configure Repository Access**
In Gemini settings:
```
GitHub Repository: InfinityXOneSystems/quantum-x-builder
Branch: main
Permissions: read/write/execute
Workflows: enabled
Auto-sync: enabled
Max context: 200k tokens
```

**Step 4: Test in Gemini**
In Gemini chat:
```
@quantum-x-builder what is the architecture of this project?
```

### Verify Connection
```bash
# Check if Gemini can read your repo
curl -H "Authorization: token $(cat /tmp/github_access_token)" \
  https://api.github.com/repos/InfinityXOneSystems/quantum-x-builder/contents
```

---

## 🔐 Security Best Practices

### Token Management

**Automatic Token Refresh (hourly)**
```bash
# Add to crontab
0 * * * * bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh refresh-token
```

**Or manually:**
```bash
bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh refresh-token
```

### Credential Files

```bash
# All files are created with mode 600 (owner-only)
ls -la /workspaces/quantum-x-builder/_state/github-app/
ls -la /workspaces/quantum-x-builder/.github/

# Never commit these files:
echo ".github.env" >> .gitignore
echo "_state/github-app/" >> .gitignore
echo ".github/*-config.json" >> .gitignore
```

### Private Key Rotation

If your private key is compromised:
1. Go to: https://github.com/settings/apps/infinity-xos-orchestrator
2. Click "Generate new private key"
3. Replace the key in `_state/github-app/private-key.pem`
4. Run setup script again: `bash github-app-oauth-setup.sh setup`

---

## 🧪 Testing & Verification

### Test Git Access
```bash
# Clone with GitHub App credentials
git clone https://github.com/InfinityXOneSystems/quantum-x-builder.git

# Or in existing repo
git pull origin main
git push origin feature-branch
```

### Test API Access
```bash
# Verify token is valid
curl -H "Authorization: token $(cat /tmp/github_access_token)" \
  https://api.github.com/user

# Get repository information
curl -H "Authorization: token $(cat /tmp/github_access_token)" \
  https://api.github.com/repos/InfinityXOneSystems/quantum-x-builder

# List pull requests
curl -H "Authorization: token $(cat /tmp/github_access_token)" \
  https://api.github.com/repos/InfinityXOneSystems/quantum-x-builder/pulls
```

### Test Each AI Service

**ChatGPT:**
```
"Can you read my GitHub repository at InfinityXOneSystems/quantum-x-builder?"
```

**GitHub Copilot:**
- Open a file in quantum-x-builder
- Type a comment and press Ctrl+Enter for suggestions

**VS Code Copilot:**
- Open VS Code to quantum-x-builder folder
- Open Copilot Chat (Ctrl+Shift+I)
- Ask about the project structure

**Google Gemini:**
```
@quantum-x-builder Show me the README.md file
```

---

## 📊 Permission Matrix

| Feature | ChatGPT | Copilot | VS Code | Gemini |
|---------|---------|---------|---------|---------|
| Read Files | ✅ | ✅ | ✅ | ✅ |
| Read Issues | ✅ | ✅ | ✅ | ✅ |
| Read PRs | ✅ | ✅ | ✅ | ✅ |
| Write Files | ✅ | ✅ | ✅ | ✅ |
| Create Issues | ✅ | ✅ | ✅ | ✅ |
| Create PRs | ✅ | ✅ | ✅ | ✅ || Execute Workflows | ✅ | ✅ | ✅ | ✅ || Merge PRs | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Admin Actions | ❌ | ❌ | ❌ | ❌ |

⚠️ = Requires explicit approval
❌ = Not granted

---

## 🔄 Environment Variables

After running the setup, these variables are available:

```bash
# Source the environment file
source /workspaces/quantum-x-builder/.github.env

# Use in scripts
echo "Token: $GITHUB_APP_TOKEN"
echo "App ID: $GITHUB_APP_ID"
echo "Installation ID: $GITHUB_INSTALLATION_ID"
```

---

## 🆘 Troubleshooting

### Token Not Working
```bash
# Check token status
bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh status

# Refresh token
bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh refresh-token
```

### Git Authentication Fails
```bash
# Clear cached credentials
git credential reject https://github.com

# Reconfigure
bash /workspaces/quantum-x-builder/_OPS/github-app-oauth-setup.sh setup
```

### AI Service Can't Access Repo
1. Verify organization permission: https://github.com/organizations/InfinityXOneSystems/settings/personal-access-tokens
2. Check app installation: https://github.com/apps/infinity-xos-orchestrator
3. Ensure repository is: InfinityXOneSystems/quantum-x-builder

### "Invalid JWT" Error
- Private key may be corrupted
- Run setup again to regenerate: `bash github-app-oauth-setup.sh setup`

---

## 📝 Configuration Files

After setup, you'll have:

1. **Private Key**: `_state/github-app/private-key.pem`
   - RSA-2048 private key
   - Mode: 600 (owner-only)

2. **Token Cache**: `_state/github-app/access-token.cache`
   - JSON file with current access token
   - Expires hourly
   - Mode: 600 (owner-only)

3. **App Config**: `.github/app-config.json`
   - Permission matrix
   - AI service settings
   - OAuth endpoints

4. **Environment File**: `.github.env`
   - Bash-sourceable credentials
   - All tokens and IDs
   - AI service flags

---

## 🚀 Next Steps

1. ✅ Run the setup script
2. ✅ Authorize GitHub in each AI service
3. ✅ Verify git access works
4. ✅ Add token refresh to cron jobs
5. ✅ Test each AI service connection
6. ✅ Configure per-service permissions

---

## 📞 Support

For issues with:
- **GitHub App**: See https://docs.github.com/en/developers/apps
- **ChatGPT**: https://help.openai.com/
- **GitHub Copilot**: https://github.com/features/copilot
- **VS Code**: https://code.visualstudio.com/docs
- **Google Gemini**: https://gemini.google.com/help

---

**Last Updated**: February 6, 2026
**Status**: ✅ Ready for Multi-Agent Integration
