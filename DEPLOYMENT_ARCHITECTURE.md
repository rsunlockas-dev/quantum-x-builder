# Deployment Architecture

## Overview

The Quantum X Builder repository contains two distinct components:

1. **Frontend Application** (PRIMARY) - `/frontend` directory
2. **Documentation Site** - `/website` directory (Docusaurus)

## Primary Deployment: Spark-Inspired Command Center

The frontend application (`/frontend`) is the **primary GitHub Pages deployment**. This is the **Spark UI-inspired Command Center** from PR #54 (the 1.5 million line implementation) with:

### Visual Design (Spark-Inspired)
- ✨ **Silver gradient borders** - Elegant visual separators
- 🎨 **Multi-layered radial gradients** - Admin grid background
- 💎 **Metallic silver effects** - Premium UI polish
- ⚡ **Animated elements** - Pulse effects and transitions

### Features
- 📝 **Monaco Editor** - Full code editing capabilities
- 🤖 **AI Integration** - Google Gemini powered
- 🎛️ **Admin Control Plane** - System management
- 🔧 **Low-code Workflow Builder** - Visual automation
- 🌐 **WebSocket** - Real-time updates
- 📱 **PWA** - Service Worker for offline/mobile use
- 🔐 **Security** - RBAC, kill switch, audit logging

**Deployment URL**: https://infinityxonesystems.github.io/quantum-x-builder/

**Workflow**: `.github/workflows/deploy-pages.yml`

### Design Reference

The UI design is inspired by GitHub Sparks with:
```css
/* Silver gradient borders */
.silver-gradient-border::after {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(200,200,200,0.3) 50%, 
    rgba(255,255,255,0) 100%);
}

/* Admin grid background */
.admin-grid {
  background-image:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.12), transparent 45%),
    radial-gradient(circle at 80% 10%, rgba(34, 197, 94, 0.12), transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.12), transparent 45%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.9));
}
```

## Documentation Site (Local Development Only)

The Docusaurus site (`/website`) is for **local documentation development**. It is NOT deployed to GitHub Pages to avoid conflicts with the primary frontend deployment.

### Why Docusaurus is Not Deployed

GitHub Pages allows only ONE deployment per repository. The Monaco-style frontend is the primary application (as per the 1.5M line implementation requirements), so it takes precedence.

### Using Docusaurus Locally

To develop documentation locally:

```bash
cd website
npm install
npm run start     # Dev server at http://localhost:3000
npm run build     # Build static site to website/build/
npm run serve     # Serve built site
```

### Documentation Access

Documentation is available in multiple places:

1. **Markdown files**: `/docs` directory (repository root)
2. **README files**: Throughout the repository
3. **Docusaurus (local)**: Run locally via `cd website && npm start`

## Deployment Workflow

### Automatic Deployment

When changes are pushed to `main` branch:

1. `.github/workflows/deploy-pages.yml` triggers
2. Frontend is built (`npm run build` in `/frontend`)
3. Build output (`frontend/dist`) is deployed to GitHub Pages
4. Site is live at: https://infinityxonesystems.github.io/quantum-x-builder/

### Manual Deployment

To manually trigger deployment:

1. Go to: Actions → "Build and Deploy Frontend to GitHub Pages"
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"

## Why This Architecture?

### The Monaco-Style Frontend Is Primary

Per the original requirements (referenced as "1.5 mil implementations"):

- The frontend should be Monaco Editor-style interface
- It should provide full IDE-like capabilities
- It's the primary user-facing application
- It includes admin controls, AI integration, and autonomous operations

### Docusaurus Is For Documentation Development

- Docusaurus provides excellent local documentation development experience
- It's useful for team documentation workflows
- It can generate static docs for offline use
- But it's not the primary application

## GitHub Pages Configuration

**Repository Settings → Pages:**

- Source: GitHub Actions
- Branch: Deployed from Actions workflows (not from branch)
- Custom domain: (optional)

## Future Considerations

If you need both frontend and docs on GitHub Pages:

### Option A: Subdirectory Deployment
- Configure Docusaurus to build with `baseUrl: '/quantum-x-builder/docs/'`
- Create workflow that builds both and combines them
- Deploy unified build to Pages

### Option B: Separate Repository
- Create separate `quantum-x-builder-docs` repository
- Deploy Docusaurus there: https://infinityxonesystems.github.io/quantum-x-builder-docs/

### Option C: External Hosting
- Host Docusaurus on Netlify, Vercel, or Cloudflare Pages
- Keep frontend on GitHub Pages

## Summary

✅ **Frontend (Monaco-style)**: Primary deployment to GitHub Pages  
✅ **Docusaurus**: Local development only, workflow disabled  
✅ **Documentation**: Available in `/docs` markdown files  
✅ **No conflicts**: Single deployment target

This architecture aligns with the original intent that the Monaco-style frontend should be the primary application, not Docusaurus.
