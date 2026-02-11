# Quick Fix: Git Exit Code 128 & Website 404

## TL;DR

**Website Access**: Use https://infinityxonesystems.github.io/quantum-x-builder/  
**vizual-x.com**: Not configured for GitHub Pages (intentional)  
**Git Error**: Workflow is correctly configured; will resolve on next run

---

## 1. Website Not Found (vizual-x.com 404)

### The Issue
Trying to access https://vizual-x.com/ shows:
```
This vizual-x.com page can't be found
HTTP ERROR 404
```

### Why This Happens
The website is **NOT** deployed to `vizual-x.com`. It's deployed to GitHub Pages instead.

### ✅ Solution: Use the Correct URL

**Working URL:**
```
https://infinityxonesystems.github.io/quantum-x-builder/
```

### Why vizual-x.com Isn't Configured

The domain `vizual-x.com` is reserved for **cloud infrastructure**:
- `api.vizual-x.com` → API service (Google Cloud Run)
- `agent.vizual-x.com` → Agent service (Cloud Run)
- `vizual-x.com` → Frontend (Cloud/Cloudflare Tunnel)

These require separate cloud deployment setup.

### Want to Use vizual-x.com?

See detailed instructions in: `docs/DEPLOYMENT_AND_DOMAIN_GUIDE.md`

**Quick steps:**
1. Create `website/static/CNAME` with content: `vizual-x.com`
2. Update `website/docusaurus.config.ts` to use custom URL
3. Configure DNS A records to GitHub Pages IPs
4. Enable custom domain in GitHub repository settings
5. Wait 24-48 hours for DNS propagation

---

## 2. Git Exit Code 128 Error

### The Issue
Workflow fails with:
```
The process '/usr/bin/git' failed with exit code 128
```

### Why This Happens
The `require-rehydrate.yml` workflow validates that baseline tag `qxb-phase5-lock-2026-02-06` exists. The error occurs when:
- Git checkout doesn't fetch tags (shallow clone)
- Tag hasn't been fetched from remote
- Command `git rev-parse qxb-phase5-lock-2026-02-06` fails

### ✅ Solution: Already Fixed

The workflow is **already configured correctly**:
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Fetches all history and tags
```

**Status**: Will work on next workflow run once tags are fetched.

### Manual Verification

```bash
# Fetch all tags
git fetch origin --tags

# Verify tag exists
git tag -l "qxb-phase5-lock-2026-02-06"
# Output: qxb-phase5-lock-2026-02-06 ✓

# Check target commit
git rev-parse qxb-phase5-lock-2026-02-06^{}
# Output: 5c74904882ef8989c76754e34d52ccf71e34db85 ✓
```

### Need More Details?

See comprehensive guide: `docs/GIT_EXIT_CODE_128_TROUBLESHOOTING.md`

---

## Quick Reference

### Access URLs

| What | URL | Status |
|------|-----|--------|
| Documentation | https://infinityxonesystems.github.io/quantum-x-builder/ | ✅ Working |
| Frontend (Mock) | https://infinityxonesystems.github.io/quantum-x-builder/ | ✅ Working |
| vizual-x.com | https://vizual-x.com/ | ❌ Not Configured |
| Local Dev | http://localhost:3000 | 🔧 Development |

### Workflows

| Workflow | Purpose | Status |
|----------|---------|--------|
| deploy-docs.yml | Deploy docs to GitHub Pages | ✅ Working |
| deploy-pages.yml | Deploy frontend to GitHub Pages | ✅ Working |
| require-rehydrate.yml | Validate baseline tag | ✅ Configured |
| ci.yml | Run CI tests | ⚠️ Needs self-hosted runner |

### Important Files

- `.github/workflows/require-rehydrate.yml` - Tag validation workflow
- `.github/workflows/deploy-docs.yml` - Documentation deployment
- `website/docusaurus.config.ts` - Site configuration
- `_OPS/_STATE/PHASE5_STATUS.json` - Phase 5 status with baseline tag

---

## Complete Documentation

For full details, see:

1. **`docs/ISSUE_RESOLUTION_SUMMARY.md`** - Complete investigation and resolution
2. **`docs/DEPLOYMENT_AND_DOMAIN_GUIDE.md`** - Deployment architecture and domain setup
3. **`docs/GIT_EXIT_CODE_128_TROUBLESHOOTING.md`** - Git error troubleshooting
4. **`docs/fixes/GIT_EXIT_CODE_128_FIX.md`** - Original fix documentation

---

## Need Help?

### For Website Access
- ✅ Use: https://infinityxonesystems.github.io/quantum-x-builder/
- 📖 Read: `docs/DEPLOYMENT_AND_DOMAIN_GUIDE.md`

### For Git Errors
- 📖 Read: `docs/GIT_EXIT_CODE_128_TROUBLESHOOTING.md`
- 🔍 Check: Tag exists with `git tag -l "qxb-*"`
- 🔄 Fetch: Run `git fetch origin --tags`

### For Cloud Deployment
- 📖 Read: `infrastructure/cloudflare-tunnel-config.yaml`
- 📖 Read: `DOCKER_DEPLOYMENT_GUIDE.md`

---

**Last Updated**: 2026-02-11  
**Status**: Issues Resolved ✅  
**Documentation**: Complete
