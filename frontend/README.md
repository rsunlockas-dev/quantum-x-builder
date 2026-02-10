<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Quantum-X-Builder Frontend

The Quantum-X-Builder frontend is a modern React application built with Vite, TypeScript, and Tailwind CSS. It provides an interactive AI studio interface with autonomous partnership capabilities and control panel integration.

🌐 **[View Live Demo](https://infinityxonesystems.github.io/quantum-x-builder/)** (Mock Mode - No backend required)

---

## Features

- 🎨 **Modern UI**: Built with React 19 and Tailwind CSS
- 🚀 **Fast Build**: Powered by Vite for lightning-fast development
- 🤖 **AI Integration**: Google Gemini AI integration
- 🔒 **Phase 5 Controls**: Admin control plane and autonomous operations
- 🎭 **Mock Mode**: Run standalone without backend for demos
- 📦 **Multiple Deployment Options**: Docker, GitHub Pages, or local development

---

## Run Locally (Development Mode)

**Prerequisites:** Node.js >= 20

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables** (optional):
   ```bash
   # .env.local
   VITE_BACKEND_URL=http://localhost:8787
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   http://localhost:3000

---

## Build for Production

### Standard Build
```bash
npm run build
npm run preview  # Preview the production build
```

### Mock Mode Build (for GitHub Pages)
```bash
MOCK_MODE=true VITE_MOCK_MODE=true PAGES_BASE=/quantum-x-builder/ npm run build
npm run preview
```

### Docker Build
```bash
# From the frontend directory
docker build -t quantum-x-builder-frontend .
docker run -p 3000:3000 quantum-x-builder-frontend
```

---

## Deployment Options

### 1. Docker (Full Stack)
```bash
# From project root
./launch.sh
```
Frontend available at: http://localhost:3000

### 2. GitHub Pages (Mock Mode)
Automatically deployed on push to `main` branch when `frontend/` changes.

Live at: https://infinityxonesystems.github.io/quantum-x-builder/

See [GitHub Pages Deployment Guide](../docs/GITHUB_PAGES_DEPLOYMENT.md) for details.

### 3. Local Development
```bash
npm run dev
```

---

## Configuration

### Environment Variables

**Build-time:**
- `PAGES_BASE` - Base path for assets (default: `/`)
- `MOCK_MODE` - Enable mock backend mode (default: `false`)
- `VITE_MOCK_MODE` - Vite-specific mock mode flag

**Runtime:**
- `VITE_BACKEND_URL` - Backend API URL
- `VITE_API_TOKEN` - Backend API authentication token
- `GEMINI_API_KEY` - Google Gemini API key

### Mock Mode

Mock mode allows the frontend to run without a backend, perfect for:
- GitHub Pages deployment
- Quick demos
- UI development
- Testing

When enabled, the backend service returns simulated responses instead of making real API calls.

---

## VS Code Extension (Auto-Open on Startup)

The VS Code extension lives in [vscode-extension](vscode-extension). It opens Vizual-X in a webview on VS Code startup.

1. **Build the web app assets:**
   ```bash
   npm install
   npm run build
   ```

2. **Install the extension in VS Code:**
   - Open the Command Palette and run `Developer: Install Extension from Location...`
   - Choose the [vscode-extension](vscode-extension) folder

3. **Reload VS Code.** Vizual-X will open automatically.

If you need to reopen it manually, run `Vizual-X: Open Vizual-X Studio` from the Command Palette.

---

## Development

### Project Structure
```
frontend/
├── components/         # React components
├── services/          # Backend and AI services
├── src/               # Additional source modules
│   ├── admin/        # Admin control panel
│   ├── autonomous-partner/  # TAP Phase 1
│   └── contracts/    # Contract management
├── vscode-extension/  # VS Code extension
├── App.tsx           # Main application
├── index.tsx         # Entry point
├── vite.config.ts    # Vite configuration
├── Dockerfile        # Docker build configuration
└── package.json      # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run package` - Package VS Code extension
- `npm run publish` - Publish VS Code extension

### Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google Gemini** - AI integration
- **Axios** - HTTP client

---

## Troubleshooting

### Build fails
- Ensure Node.js >= 20
- Run `npm ci` to clean install dependencies
- Check `vite.config.ts` for configuration issues

### Preview shows 404
- Verify `PAGES_BASE` matches your deployment path
- Check browser console for errors
- Ensure `.nojekyll` file exists in dist/

### Backend connection fails
- Verify `VITE_BACKEND_URL` is set correctly
- Check backend is running: `curl http://localhost:8787/health`
- Or enable mock mode: `MOCK_MODE=true`

---

## Related Documentation

- [Quick Start Guide](../QUICK_START.md) - Full system setup
- [GitHub Pages Deployment](../docs/GITHUB_PAGES_DEPLOYMENT.md) - Pages deployment
- [Docker Deployment Guide](../DOCKER_DEPLOYMENT_GUIDE.md) - Docker setup

---

## AI Studio

View your app in AI Studio: https://ai.studio/apps/drive/1fQ99mZgdiM4nUMfKASAVb82os_7cqTnF

---

**Last Updated**: 2026-02-10  
**Version**: 1.1.0  
**Status**: Production Ready 🚀
