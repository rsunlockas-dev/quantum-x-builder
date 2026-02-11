# GitHub Pages Deployment Guide

This guide explains how to deploy the Quantum-X-Builder frontend to GitHub Pages.

## Overview

The frontend is configured to run in two modes:
- **Full Mode**: With backend API (Docker/local development)
- **Mock Mode**: Standalone demo without backend (GitHub Pages)

GitHub Pages deployment uses mock mode to provide an interactive demo of the UI even when the backend is not publicly hosted.

## Automatic Deployment

The frontend automatically deploys to GitHub Pages when:
- Changes are pushed to the `main` branch
- Changes affect files in the `frontend/` directory
- Or manually triggered via GitHub Actions

### Workflow: `.github/workflows/deploy-pages.yml`

The deployment workflow:
1. Builds the frontend with mock mode enabled
2. Uploads the built assets to GitHub Pages
3. Deploys to: `https://infinityxonesystems.github.io/quantum-x-builder/`

## Manual Deployment

To manually trigger a deployment:

1. Go to the repository on GitHub
2. Click on **Actions** tab
3. Select **Deploy to GitHub Pages** workflow
4. Click **Run workflow**
5. Select the `main` branch
6. Click **Run workflow**

The deployment takes about 2-3 minutes to complete.

## Local Testing (Mock Mode)

Test the mock mode build locally before deploying:

```bash
cd frontend

# Install dependencies
npm install

# Build with mock mode
MOCK_MODE=true VITE_MOCK_MODE=true PAGES_BASE=/quantum-x-builder/ npm run build

# Preview the build
npm run preview
```

Visit: http://localhost:3000

## Local Testing (Full Mode)

Test with the backend running:

```bash
# From project root
./launch.sh

# Frontend will be at: http://localhost:3000
# Backend will be at: http://localhost:8787
```

## Configuration

### Environment Variables

**Build-time Variables:**
- `PAGES_BASE` - Base path for assets (e.g., `/quantum-x-builder/`)
- `MOCK_MODE` - Enable mock mode (`true`/`false`)
- `VITE_MOCK_MODE` - Vite-specific mock mode flag

**Runtime Variables (optional):**
- `VITE_BACKEND_URL` - Backend API URL (not used in mock mode)
- `VITE_API_TOKEN` - Backend API token (not used in mock mode)
- `GEMINI_API_KEY` - Gemini API key (for AI features)

### Mock Mode Features

When running in mock mode (GitHub Pages):
- ✅ Full UI exploration
- ✅ Theme customization
- ✅ Component interaction
- ✅ Interface navigation
- ⚠️ Simulated chat responses (not real AI)
- ❌ No backend persistence
- ❌ No real AI integration

### Vite Configuration

The `vite.config.ts` handles:
- Base path configuration for GitHub Pages
- Mock mode environment variables
- Build optimization
- `.nojekyll` file copying (prevents Jekyll processing)

## GitHub Pages Setup

To enable GitHub Pages for this repository:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will handle the rest automatically

## Troubleshooting

### Issue: Pages shows 404 errors

**Solution:** Ensure `PAGES_BASE` is set correctly in the workflow:
```yaml
PAGES_BASE: '/quantum-x-builder/'  # Must match repo name
```

### Issue: Assets not loading

**Solution:** Check the base path in `vite.config.ts` matches the repository name.

### Issue: Build fails

**Solution:** 
1. Check Node.js version (requires 20+)
2. Verify all dependencies install: `npm ci`
3. Check workflow logs in GitHub Actions

### Issue: Mock mode not working

**Solution:** Ensure `MOCK_MODE=true` is set in the workflow environment variables.

## Architecture

```
┌─────────────────────────────────────┐
│      GitHub Actions Workflow        │
│  (deploy-pages.yml)                 │
└───────────────┬─────────────────────┘
                │
                ├─► Install Node.js 20
                ├─► Install dependencies (npm ci)
                ├─► Build frontend (MOCK_MODE=true)
                ├─► Upload to Pages
                └─► Deploy
                      │
                      ▼
            ┌──────────────────────┐
            │   GitHub Pages       │
            │   (Static Hosting)   │
            └──────────────────────┘
                      │
                      ▼
            User accesses:
            https://infinityxonesystems.github.io/quantum-x-builder/
```

## Security

- Mock mode does not expose backend credentials
- No API keys are included in the build
- Frontend-only, no server-side code execution
- All sensitive operations require backend (not available on Pages)

## Performance

**Build Output:**
- Vendor bundle: ~12 KB (gzipped)
- Main bundle: ~90 KB (gzipped)
- Total: ~100 KB (gzipped)

**Optimization:**
- Code splitting for vendor dependencies
- Gzip compression
- No source maps in production
- Optimized React imports

## Next Steps

- For full functionality, deploy the backend separately
- Configure `VITE_BACKEND_URL` to connect frontend to backend
- Set up proper authentication and API tokens
- Enable real AI integration with Gemini API

## Related Documentation

- [Quick Start Guide](../QUICK_START.md) - Docker deployment
- [Docker Deployment Guide](../DOCKER_DEPLOYMENT_GUIDE.md) - Full stack deployment
- [Frontend README](../frontend/README.md) - Frontend development guide
