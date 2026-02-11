# GitHub Actions

This directory contains reusable GitHub Actions for the quantum-x-builder repository.

## generate-app-token

A composite action that generates GitHub App installation access tokens for use in workflows.

### Purpose

Replaces `GITHUB_TOKEN` with GitHub App tokens to:
- ✅ Enable workflow triggering (GITHUB_TOKEN cannot trigger workflows)
- ✅ Provide higher rate limits
- ✅ Grant fine-grained permissions
- ✅ Improve security with automatic token expiry
- ✅ Remove dependencies on personal access tokens

### Usage

```yaml
- name: Generate GitHub App Token
  id: app-token
  uses: ./.github/actions/generate-app-token
  with:
    app_id: ${{ secrets.GH_APP_ID }}
    private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}
    installation_id: ${{ secrets.GH_APP_INSTALLATION_ID }}  # Optional

- name: Use token in subsequent steps
  run: |
    gh pr list
    git push origin main
  env:
    GH_TOKEN: ${{ steps.app-token.outputs.token }}
```

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `app_id` | Yes | - | GitHub App ID |
| `private_key` | Yes | - | GitHub App private key (PEM format) |
| `installation_id` | No | Auto-detected | Installation ID (auto-detected if omitted) |

### Outputs

| Output | Description |
|--------|-------------|
| `token` | GitHub App installation access token |
| `token-expiry` | Token expiration timestamp |

### How It Works

1. **Generate JWT**: Creates a JSON Web Token signed with the App's private key
2. **Get Installation ID**: Fetches the installation ID (if not provided)
3. **Request Token**: Uses JWT to request an installation access token
4. **Return Token**: Outputs the token for use in subsequent steps

Token expires after 1 hour (enforced by GitHub).

### Required Secrets

Configure these in your repository settings:

- `GH_APP_ID`: Your GitHub App ID
- `GH_APP_PRIVATE_KEY`: Complete PEM private key (including headers)
- `GH_APP_INSTALLATION_ID`: Installation ID (optional, auto-detected)

See: `docs/GITHUB_APP_SETUP.md` for detailed setup instructions.

### Workflows Using This Action

- `auto-maintain.yml`
- `fix-all-persistent.yml`
- `healing-agent.yml`
- `validation-agent.yml`
- `autonomous-code-agent.yml`

### Security

- Private key is stored in a temporary file with 600 permissions
- Temporary file is deleted immediately after use
- JWT and tokens are masked in workflow logs
- Tokens automatically expire after 1 hour

### Troubleshooting

**Error: "Failed to generate installation token"**
- Verify `GH_APP_ID` is correct
- Ensure `GH_APP_PRIVATE_KEY` includes BEGIN/END headers
- Check that the App is installed on the repository

**Error: "Failed to get installation ID"**
- Install the GitHub App on your repository
- Verify the App has required permissions
- Optionally provide `GH_APP_INSTALLATION_ID` explicitly

### References

- [GitHub Apps Documentation](https://docs.github.com/apps)
- [Authenticating with GitHub Apps](https://docs.github.com/apps/creating-github-apps/authenticating-with-a-github-app)
- Setup Guide: `docs/GITHUB_APP_SETUP.md`
- Quick Start: `GITHUB_APP_QUICK_SETUP.md`
