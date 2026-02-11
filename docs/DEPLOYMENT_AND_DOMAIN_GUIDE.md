# Deployment and Domain Configuration Guide

## Overview

This guide explains the deployment architecture and how to access the Quantum-X-Builder documentation and applications.

## GitHub Pages Deployment

### Documentation Site (Docusaurus)

The Quantum-X-Builder documentation is deployed to **GitHub Pages** via the `deploy-docs.yml` workflow.

**Deployment Details:**
- **URL**: https://infinityxonesystems.github.io/quantum-x-builder/
- **Workflow**: `.github/workflows/deploy-docs.yml`
- **Source**: `website/` directory (Docusaurus)
- **Base URL**: `/quantum-x-builder/`
- **Trigger**: Push to `main` branch with changes to `website/**` or manual dispatch

**Configuration:**
```typescript
// website/docusaurus.config.ts
url: 'https://infinityxonesystems.github.io',
baseUrl: '/quantum-x-builder/',
```

### Frontend Application

The React frontend is also deployed to GitHub Pages via the `deploy-pages.yml` workflow.

**Deployment Details:**
- **URL**: https://infinityxonesystems.github.io/quantum-x-builder/ (alternative path)
- **Workflow**: `.github/workflows/deploy-pages.yml`
- **Source**: `frontend/` directory (Vite/React)
- **Trigger**: Push to `main` branch with changes to `frontend/**` or manual dispatch
- **Mode**: Mock mode enabled (no backend connection)

## Custom Domain: vizual-x.com

### Current Status

**vizual-x.com is NOT currently deployed or accessible via GitHub Pages.**

The domain `vizual-x.com` is referenced throughout the infrastructure code for **cloud-based deployments** using:
- Google Cloud Run
- Cloudflare Tunnels
- Cloud IAP (Identity-Aware Proxy)

### Infrastructure References

The domain is configured for cloud infrastructure in:
- `infrastructure/cloudflare-tunnel-config.yaml` - Tunnel configuration
- `infrastructure/iap-setup.sh` - Google Cloud IAP setup
- `infrastructure/docker-cloud-run.yaml` - Cloud Run deployment
- `infrastructure/tunnel-gateway-setup.ps1` - Gateway configuration

**Configured subdomains:**
- `vizual-x.com` - Frontend service
- `www.vizual-x.com` - Frontend service
- `api.vizual-x.com` - API service
- `agent.vizual-x.com` - Agent service
- `health.vizual-x.com` - Health monitoring
- `metrics.vizual-x.com` - Metrics endpoint

### Why vizual-x.com Shows 404

**Reason 1: No CNAME File**
- GitHub Pages requires a `CNAME` file in the deployment to map a custom domain
- Current deployment does NOT include a CNAME file

**Reason 2: DNS Not Configured**
- The domain DNS records must point to GitHub Pages servers
- Required DNS records:
  ```
  vizual-x.com        A       185.199.108.153
  vizual-x.com        A       185.199.109.153
  vizual-x.com        A       185.199.110.153
  vizual-x.com        A       185.199.111.153
  www.vizual-x.com    CNAME   infinityxonesystems.github.io
  ```

**Reason 3: GitHub Pages Custom Domain Not Configured**
- The repository settings must enable custom domain in GitHub Pages configuration
- Navigate to: Settings → Pages → Custom domain

### How to Enable vizual-x.com for GitHub Pages

If you own the `vizual-x.com` domain and want to use it for GitHub Pages:

#### Step 1: Add CNAME File

Create a file at `website/static/CNAME` with content:
```
vizual-x.com
```

#### Step 2: Update Docusaurus Configuration

Edit `website/docusaurus.config.ts`:
```typescript
// Change from:
url: 'https://infinityxonesystems.github.io',
baseUrl: '/quantum-x-builder/',

// To:
url: 'https://vizual-x.com',
baseUrl: '/',
```

#### Step 3: Configure DNS Records

Add DNS records at your domain registrar:
```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     infinityxonesystems.github.io
```

#### Step 4: Enable Custom Domain in GitHub

1. Go to repository settings: https://github.com/InfinityXOneSystems/quantum-x-builder/settings/pages
2. Under "Custom domain", enter: `vizual-x.com`
3. Click "Save"
4. Wait for DNS check to pass
5. Enable "Enforce HTTPS" once DNS propagates (24-48 hours)

#### Step 5: Redeploy

Push changes to `main` branch to trigger deployment:
```bash
git add website/static/CNAME website/docusaurus.config.ts
git commit -m "Configure custom domain vizual-x.com"
git push origin main
```

## Cloud-Based Deployment (Alternative)

For production deployment with backend services, consider using the cloud infrastructure:

### Option 1: Google Cloud Run

Deploy containerized services to Cloud Run:
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml build
gcloud run deploy quantum-x-builder --image gcr.io/PROJECT_ID/quantum-x-builder

# Configure custom domain
gcloud run domain-mappings create --service quantum-x-builder --domain api.vizual-x.com
```

See: `infrastructure/docker-cloud-run.yaml`

### Option 2: Cloudflare Tunnel

Expose local services via secure tunnel:
```bash
# Install cloudflared
# Configure tunnel
cloudflared tunnel create quantum-x-builder
cloudflared tunnel route dns quantum-x-builder vizual-x.com

# Run tunnel
cloudflared tunnel --config infrastructure/cloudflare-tunnel-config.yaml run quantum-x-builder
```

See: `infrastructure/cloudflare-tunnel-config.yaml`, `infrastructure/tunnel-gateway-setup.ps1`

## Access URLs

### Current (Active)
- **Documentation**: https://infinityxonesystems.github.io/quantum-x-builder/
- **Frontend (Mock)**: https://infinityxonesystems.github.io/quantum-x-builder/

### Future (With Custom Domain)
- **Documentation**: https://vizual-x.com/ (after configuration)
- **Frontend**: https://vizual-x.com/
- **API**: https://api.vizual-x.com/ (requires cloud deployment)
- **Agent**: https://agent.vizual-x.com/ (requires cloud deployment)

### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8787
- **Documentation**: http://localhost:3000 (from `website/` directory)

## Troubleshooting

### "Page can't be found" Error

**Problem**: Accessing https://vizual-x.com/ shows HTTP ERROR 404

**Solution**: 
- Use the active GitHub Pages URL instead: https://infinityxonesystems.github.io/quantum-x-builder/
- OR configure custom domain following steps above

### GitHub Pages Not Updating

**Problem**: Changes not reflecting on GitHub Pages

**Solution**:
1. Check workflow runs: https://github.com/InfinityXOneSystems/quantum-x-builder/actions
2. Verify the workflow completed successfully
3. Clear browser cache
4. Wait 5-10 minutes for GitHub Pages CDN to update

### Custom Domain Not Working

**Problem**: Custom domain configured but showing 404

**Checklist**:
- [ ] CNAME file exists in deployment
- [ ] DNS records configured correctly
- [ ] DNS propagated (check with `dig vizual-x.com` or https://dnschecker.org)
- [ ] GitHub Pages custom domain configured in settings
- [ ] Waited 24-48 hours for full DNS propagation
- [ ] HTTPS enforced (disable if DNS not propagated)

## Related Documentation

- [Deploy Documentation Workflow](.github/workflows/deploy-docs.yml)
- [Deploy Pages Workflow](.github/workflows/deploy-pages.yml)
- [Cloudflare Tunnel Config](infrastructure/cloudflare-tunnel-config.yaml)
- [Cloud Run Config](infrastructure/docker-cloud-run.yaml)
- [Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md)
- [Integration Guide](INTEGRATION_GUIDE.md)

## Security Considerations

### GitHub Pages
- Publicly accessible (site is public)
- Static content only (no backend)
- HTTPS enforced automatically
- No authentication required

### Cloud Deployment
- Identity-Aware Proxy (IAP) for authentication
- Cloudflare Zero Trust for network security
- Rate limiting and DDoS protection
- PAT token authentication for API access

## Support

For deployment issues or questions:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Consult cloud provider documentation (GCP, Cloudflare)
4. Check DNS propagation status

---

**Last Updated**: 2026-02-11  
**Status**: Active - Documentation deployed to GitHub Pages  
**Custom Domain Status**: Not configured (vizual-x.com reserved for cloud infrastructure)
