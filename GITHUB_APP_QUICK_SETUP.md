# Quick Setup Guide - GitHub App for Auto-Maintenance

## 🚀 Quick Start (5 minutes)

### Step 1: Add Repository Secrets

Navigate to: `https://github.com/InfinityXOneSystems/quantum-x-builder/settings/secrets/actions`

Add these three secrets:

#### Secret 1: GH_APP_ID
```
Name: GH_APP_ID
Value: 2494652
```

#### Secret 2: GH_APP_PRIVATE_KEY
```
Name: GH_APP_PRIVATE_KEY
Value: [Paste entire private key PEM file content]
```
**Note**: Include the full key with headers:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
[full key content]
...cFZcQ==
-----END RSA PRIVATE KEY-----
```

#### Secret 3: GH_APP_INSTALLATION_ID (Optional)
```
Name: GH_APP_INSTALLATION_ID
Value: [Auto-detected if not provided]
```

### Step 2: Verify GitHub App Installation

1. Go to: `https://github.com/apps/infinity-xos-orchestrator`
2. Ensure the app is installed on `InfinityXOneSystems/quantum-x-builder`
3. Verify permissions:
   - ✅ Contents: Read/Write
   - ✅ Pull Requests: Read/Write
   - ✅ Workflows: Read/Write
   - ✅ Issues: Read/Write
   - ✅ Checks: Read/Write
   - ✅ Actions: Read/Write

### Step 3: Test the Setup

Run a workflow to test:

```bash
# Test with auto-maintain workflow
gh workflow run auto-maintain.yml

# Check status
gh run list --workflow=auto-maintain.yml --limit 1
```

## 🔍 Verification Checklist

- [ ] All three secrets are configured in repository settings
- [ ] Private key includes BEGIN/END headers
- [ ] GitHub App is installed on the repository
- [ ] App has all required permissions
- [ ] Test workflow runs successfully

## ⚡ What Changed

### Before
```yaml
env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
**Limitations**: Cannot trigger workflows, limited permissions

### After
```yaml
- name: Generate GitHub App Token
  id: app-token
  uses: ./.github/actions/generate-app-token
  with:
    app_id: ${{ secrets.GH_APP_ID }}
    private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}

env:
  GH_TOKEN: ${{ steps.app-token.outputs.token }}
```
**Benefits**: Can trigger workflows, enhanced permissions, higher rate limits

## 📋 Workflows Updated

All auto-maintenance workflows now use GitHub App authentication:

- ✅ `auto-maintain.yml` - Main auto-maintenance
- ✅ `fix-all-persistent.yml` - Comprehensive fixes
- ✅ `healing-agent.yml` - PR healing
- ✅ `validation-agent.yml` - PR validation
- ✅ `autonomous-code-agent.yml` - Autonomous fixes

## 🔧 Troubleshooting

### Issue: "Failed to generate installation token"
**Solution**: Verify all three secrets are correctly configured

### Issue: "Failed to get installation ID"
**Solution**: Install the GitHub App on your repository

### Issue: Workflow fails immediately
**Solution**: Check that private key includes BEGIN/END headers

## 📚 Full Documentation

See: `docs/GITHUB_APP_SETUP.md` for complete details

## 🆘 Need Help?

1. Run the setup script: `bash _OPS/github-app-oauth-setup.sh status`
2. Check workflow logs: `gh run view --log`
3. Verify App installation: Visit GitHub App settings

---

**Time to complete**: ~5 minutes  
**Difficulty**: Easy  
**Required access**: Repository admin
