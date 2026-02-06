# VIZUAL X - VS Code Admin Control Panel Activation Guide

## ✨ Overview

VIZUAL X is now configured as a permanent VS Code extension that provides an admin control panel for Quantum-X-Builder operations. The extension is activated automatically and provides:

- **Real-time dashboard** showing Phase 3 status
- **Quick access commands** for self-checks and operations
- **Admin controls** for governance and autonomy management
- **Built-in chat editor** with Monaco and Gemini AI integration

## 🚀 Installation & Activation

### Option 1: Install from Built Artifacts (Current)

The extension is already built and ready. To install it in your current VS Code instance:

```bash
# The extension is configured to load from this directory
# VS Code will discover it via the extension.json manifest

# Manual activation:
# In VS Code, press Ctrl+Shift+X (Cmd+Shift+X on Mac)
# Or use Command Palette: Extensions: Install from VSIX
# Point to: /workspaces/quantum-x-builder/vizual-x/vscode-extension/extension.js
```

### Option 2: Package as VSIX (For distribution)

```bash
# Install vsce (if not already installed)
npm install -g vsce

# Package the extension
cd /workspaces/quantum-x-builder/vizual-x
vsce package

# Install the resulting .vsix file
# In VS Code: Extensions → ... → Install from VSIX
```

## 🎮 Usage

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open VIZUAL X Studio | `Ctrl+Shift+X` | `Cmd+Shift+X` |
| Show Control Panel Status | Via Command Palette | Via Command Palette |

### Command Palette Commands

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type:

- `VIZUAL X: Open VIZUAL X Studio` - Open the full studio interface
- `VIZUAL X: Show Control Panel Status` - Display control panel status
- `VIZUAL X: Run QXB Self Check` - Execute self-check (backend integration)
- `VIZUAL X: Check Phase 3 Status` - Display Phase 3 status

### Sidebar Integration

A new **VIZUAL X** activity bar icon appears on the left sidebar with:
- Admin Control Panel view
- Quick operation buttons
- Status indicators

## 📋 Features

### 1. Admin Control Panel
- Real-time status of Phase 3 operations
- Quick access to common operations
- Visual indicators for system health

### 2. Studio Editor
- Monaco editor integration
- Gemini AI chat for code assistance
- File editing capabilities with PAT-aligned access

### 3. Phase 3 Integration
- Display current feature flags
- Show admin API endpoints
- Monitor operation status

### 4. Self-Check Operations
- Backend health verification
- Feature flag snapshot
- Evidence collection triggers

## 🔧 Configuration

### Extension Manifest

The extension is configured in `extension.json`:

```json
{
  "name": "vizual-x-admin-control-panel",
  "displayName": "VIZUAL X - Admin Control Panel",
  "main": "./vscode-extension/extension.js",
  "activationEvents": ["onStartupFinished", "onCommand:vizualx.open"],
  "contributes": {
    "commands": [
      {
        "command": "vizualx.open",
        "title": "Open VIZUAL X Studio"
      }
    ]
  }
}
```

### Extension Entry Point

The VS Code extension code is in `vscode-extension/extension.js`:
- Activates on startup
- Registers commands
- Creates webview panels
- Manages lifecycle

## 🔐 Security & PAT Alignment

- All admin operations require proper PAT tokens
- CSP (Content Security Policy) headers configured
- Local resource isolation for webview content
- No hardcoded credentials in extension code

## 📊 Integration with Phase 3

The extension connects to Phase 3 admin endpoints:

```
GET /api/admin/phase3/status     - Phase 3 status
GET /api/admin/phase3/catalog    - Catalog items
GET /api/admin/phase3/todos      - Operations todos
GET /api/admin/phase3/memory     - Memory state
GET /api/admin/phase3/backplane  - Service status
```

And AI service endpoints:

```
GET /api/ai/services/status           - AI services status
POST /api/ai/services/{service}/test  - Test service connection
```

## 🧪 Testing the Extension

### Manual Test

1. Open VS Code
2. The extension activates automatically on startup
3. You should see a notification: "✨ VIZUAL X Admin Control Panel is active"
4. Press `Ctrl+Shift+X` to open the studio
5. Use Command Palette to run other commands

### Debug Mode

To debug the extension:

1. In VS Code, open the extension directory: `File → Open Folder → vizual-x/vscode-extension`
2. Press `F5` to start debugging
3. A new VS Code window opens with the extension loaded
4. Set breakpoints and step through code

## 📖 Development

### Build Frontend

```bash
cd /workspaces/quantum-x-builder/vizual-x
npm run build
```

### Development Mode

```bash
cd /workspaces/quantum-x-builder/vizual-x
npm run dev
```

### Extension Structure

```
vizual-x/
├── vscode-extension/
│   ├── extension.js         # VS Code extension entry point
│   └── package.json         # Extension manifest
├── extension.json           # Extension configuration
├── dist/                    # Built frontend (generated)
│   ├── index.html
│   └── assets/
├── src/
│   ├── App.tsx             # Main React component
│   ├── index.tsx           # React entry point
│   └── services/           # API integration
└── package.json            # Frontend dependencies
```

## 🐛 Troubleshooting

### Extension not appearing

1. Check that `dist/index.html` exists (run `npm run build` if missing)
2. Reload VS Code window (`Cmd+R` or `Ctrl+R`)
3. Check Extension output: `View → Output → VIZUAL X`

### Webview not loading

1. Verify file paths in `extension.js` are correct
2. Check browser console for errors (`View → Toggle Developer Tools`)
3. Ensure CSP (Content-Security-Policy) headers are properly set

### Commands not working

1. Verify commands are registered in `extension.json`
2. Check Command Palette for command availability
3. Review VS Code output for activation errors

## 📞 Support

For issues or feature requests:
- Check the [Quantum-X-Builder documentation](../docs/)
- Review [Phase 3 Implementation Summary](../PHASE3_IMPLEMENTATION_SUMMARY.md)
- Check backend health: `GET /api/health`

## 🎯 Next Steps

1. ✅ Extension built and configured
2. ✅ Activation code in place
3. ⏳ Install extension in VS Code
4. ⏳ Test admin commands
5. ⏳ Connect to Phase 3 admin API
6. ⏳ Monitor operations via dashboard

---

**Status**: ✅ Ready for activation and testing  
**Last Updated**: February 6, 2026  
**Version**: 0.1.0
