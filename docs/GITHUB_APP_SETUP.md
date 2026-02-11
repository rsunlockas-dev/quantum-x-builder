# GitHub App Setup for Auto-Maintenance Workflows

## Overview

The auto-maintenance workflows have been updated to use a GitHub App for authentication instead of `GITHUB_TOKEN` or PAT (Personal Access Token). This provides several advantages:

### Benefits

1. **Enhanced Permissions**: GitHub App tokens can trigger other workflows (unlike `GITHUB_TOKEN`)
2. **Higher Rate Limits**: GitHub Apps have separate, higher rate limits than personal tokens
3. **Better Security**: Fine-grained permissions with automatic token expiry
4. **Audit Trail**: All actions are attributed to the GitHub App, not individual users
5. **No User Dependencies**: Doesn't require maintaining personal access tokens
6. **Workflow Chaining**: Can trigger dependent workflows and actions

### Workflows Updated

The following workflows now use GitHub App authentication:

- ✅ `auto-maintain.yml` - Auto-maintenance workflow
- ✅ `fix-all-persistent.yml` - Fix-all persistent workflow
- ✅ `healing-agent.yml` - Healing agent
- ✅ `validation-agent.yml` - Validation agent
- ✅ `autonomous-code-agent.yml` - Autonomous code agent

## Required Secrets

You need to configure the following repository secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GH_APP_ID` | GitHub App ID | From GitHub App settings page |
| `GH_APP_PRIVATE_KEY` | GitHub App private key (PEM format) | Generate and download from App settings |
| `GH_APP_INSTALLATION_ID` | Installation ID (optional) | Auto-detected if not provided |

### Setting Up Secrets

1. Go to your repository: `https://github.com/InfinityXOneSystems/quantum-x-builder`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `GH_APP_ID`, Value: Your App ID (e.g., `2494652`)
   - Name: `GH_APP_PRIVATE_KEY`, Value: Your private key (entire PEM file content)
   - Name: `GH_APP_INSTALLATION_ID`, Value: Your installation ID (optional)

## GitHub App Configuration

### App Details

Based on the existing setup script (`_OPS/github-app-oauth-setup.sh`):

- **App Name**: Infinity XOS Orchestrator
- **App ID**: 2494652
- **Client ID**: Iv23liWSRKS3dsHX0oYV
- **Organization**: InfinityXOneSystems
- **Repository**: quantum-x-builder

### Required Permissions

The GitHub App needs the following permissions:

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Contents | Read/Write | Create branches, commit changes |
| Pull Requests | Read/Write | Create and manage PRs |
| Workflows | Read/Write | Trigger other workflows |
| Issues | Read/Write | Comment on issues |
| Checks | Read/Write | Update check statuses |
| Actions | Read/Write | Manage workflow runs |
| Metadata | Read | Repository information |

### Setting Up Your GitHub App

If you don't have a GitHub App yet:

1. Go to **GitHub Settings** → **Developer settings** → **GitHub Apps**
2. Click **New GitHub App**
3. Configure:
   - **Name**: Choose a unique name
   - **Homepage URL**: `https://github.com/InfinityXOneSystems/quantum-x-builder`
   - **Webhook**: Can be disabled for basic usage
   - **Permissions**: Set as listed above
4. Generate a private key (download the PEM file)
5. Install the app on your repository

### Getting Installation ID

The installation ID can be auto-detected, but if you want to provide it explicitly:

```bash
# Using the setup script
bash _OPS/github-app-oauth-setup.sh status

# Or manually via API
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  https://api.github.com/app/installations
```

## How It Works

### Token Generation Flow

1. **JWT Creation**: The workflow creates a JWT (JSON Web Token) signed with the App's private key
2. **Installation Token**: Uses JWT to request an installation access token from GitHub
3. **Token Usage**: The installation token is used for all GitHub API calls
4. **Auto Expiry**: Token automatically expires after 1 hour (GitHub enforced)

### Custom Action

A reusable composite action was created at `.github/actions/generate-app-token/action.yml`:

```yaml
- name: Generate GitHub App Token
  id: app-token
  uses: ./.github/actions/generate-app-token
  with:
    app_id: ${{ secrets.GH_APP_ID }}
    private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}
    installation_id: ${{ secrets.GH_APP_INSTALLATION_ID }}

- name: Use the token
  run: gh pr list
  env:
    GH_TOKEN: ${{ steps.app-token.outputs.token }}
```

## Migration from PAT/GITHUB_TOKEN

### Before (Using GITHUB_TOKEN)
```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}

- run: gh pr create ...
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Limitations:**
- ❌ Cannot trigger other workflows
- ❌ Limited permissions
- ❌ Lower rate limits

### After (Using GitHub App)
```yaml
- uses: actions/checkout@v4

- name: Generate GitHub App Token
  id: app-token
  uses: ./.github/actions/generate-app-token
  with:
    app_id: ${{ secrets.GH_APP_ID }}
    private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}

- run: gh pr create ...
  env:
    GH_TOKEN: ${{ steps.app-token.outputs.token }}
```

**Benefits:**
- ✅ Can trigger other workflows
- ✅ Enhanced permissions
- ✅ Higher rate limits
- ✅ Better security

## Troubleshooting

### Error: "Failed to generate installation token"

**Cause**: Invalid private key or App ID

**Solution**:
1. Verify `GH_APP_ID` matches your GitHub App
2. Ensure `GH_APP_PRIVATE_KEY` contains the complete PEM file (including headers)
3. Check that the App is installed on the repository

### Error: "Failed to get installation ID"

**Cause**: App not installed or insufficient permissions

**Solution**:
1. Install the GitHub App on your repository
2. Verify the App has the required permissions
3. Optionally, provide `GH_APP_INSTALLATION_ID` explicitly

### Token Expired

**Cause**: Installation tokens expire after 1 hour

**Solution**: The token is regenerated on each workflow run, so this is normal. No action needed.

### Workflows Not Triggering

**Cause**: Insufficient permissions

**Solution**: Ensure the App has "Workflows: Read/Write" and "Actions: Read/Write" permissions

## Security Best Practices

1. **Protect Secrets**: Never commit secrets to the repository
2. **Rotate Keys**: Periodically regenerate your private key
3. **Minimal Permissions**: Only grant permissions your workflows need
4. **Audit Logs**: Monitor App activity in GitHub's audit log
5. **IP Allowlisting**: Consider restricting App usage to GitHub Actions IPs

## Testing

After setup, test with:

```bash
# Trigger the auto-maintenance workflow
gh workflow run auto-maintain.yml

# Check workflow run
gh run list --workflow=auto-maintain.yml

# View logs
gh run view <run-id> --log
```

## Rollback

If you need to rollback to using `GITHUB_TOKEN`:

1. The workflows will fall back to `GITHUB_TOKEN` if App secrets are not configured
2. Simply remove the GitHub App token generation steps
3. Restore `token: ${{ secrets.GITHUB_TOKEN }}` in checkout steps

## Support

- **GitHub App Setup**: `_OPS/github-app-oauth-setup.sh`
- **Action Source**: `.github/actions/generate-app-token/action.yml`
- **Workflow Examples**: `.github/workflows/auto-maintain.yml`

## References

- [GitHub Apps Documentation](https://docs.github.com/apps)
- [Authenticating with GitHub Apps](https://docs.github.com/apps/creating-github-apps/authenticating-with-a-github-app)
- [GitHub Actions Security Best Practices](https://docs.github.com/actions/security-guides/security-hardening-for-github-actions)
