const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

let studioPanel = null;

function activate(context) {
  console.log('✨ VIZUAL X Admin Control Panel activating...');

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('vizualx.open', () => openVizualXStudio(context)),
    vscode.commands.registerCommand('vizualx.showStatus', () => showStatus()),
    vscode.commands.registerCommand('vizualx.runSelfCheck', () => runSelfCheck()),
    vscode.commands.registerCommand('vizualx.phase3Status', () => phase3Status())
  );

  // Auto-show control panel on startup
  vscode.window.showInformationMessage(
    '✨ VIZUAL X Admin Control Panel is active. Press Ctrl+Shift+X to open studio.',
    'Show'
  ).then(selection => {
    if (selection === 'Show') {
      vscode.commands.executeCommand('vizualx.open');
    }
  });
}

function openVizualXStudio(context) {
  if (studioPanel) {
    studioPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  studioPanel = vscode.window.createWebviewPanel(
    'vizualx.studio',
    '✨ VIZUAL X Studio - Admin Control Panel',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(getDistPath(context))]
    }
  );

  studioPanel.webview.html = getWebviewHtml(studioPanel.webview, context);

  studioPanel.onDidDispose(
    () => {
      studioPanel = null;
    },
    null,
    context.subscriptions
  );
}

function showStatus() {
  vscode.window.showInformationMessage(
    '✅ VIZUAL X Admin Control Panel is active and ready for operations'
  );
}

function runSelfCheck() {
  vscode.window.showInformationMessage(
    '🔍 Self check would run via backend API integration'
  );
}

function phase3Status() {
  vscode.window.showInformationMessage(
    '📊 Phase 3 is enabled. Admin API endpoints available.'
  );
}

function getDistPath(context) {
  return path.join(context.extensionPath, '..', 'dist');
}

function getWebviewHtml(webview, context) {
  const distPath = getDistPath(context);
  const indexPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return renderMissingBuild();
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  const assetsPath = path.join(distPath, 'assets');
  const assetsUri = webview.asWebviewUri(vscode.Uri.file(assetsPath)).toString();

  html = html.replace(/\"\/assets\//g, `"${assetsUri}/`);
  html = html.replace(/\'\/assets\//g, `'${assetsUri}/`);
  html = html.replace(/\/assets\//g, `${assetsUri}/`);

  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `font-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource}`,
    "connect-src https: http: ws: wss:"
  ].join('; ');

  html = html.replace(
    /<head>/i,
    `<head>\n<meta http-equiv="Content-Security-Policy" content="${csp}">`
  );

  return html;
}

function renderMissingBuild() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VIZUAL X Studio</title>
  <style>
    body {
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: system-ui, sans-serif;
      padding: 32px;
    }
    code { color: #89d185; }
  </style>
</head>
<body>
  <h2>✨ VIZUAL X build not found</h2>
  <p>To activate the admin control panel, run:</p>
  <code style="display: block; background: #252526; padding: 12px; border-radius: 4px; margin: 8px 0; overflow-x: auto;">cd vizual-x && npm run build</code>
</body>
</html>`;
}

function deactivate() {
  console.log('VIZUAL X Admin Control Panel deactivated');
}

module.exports = {
  activate,
  deactivate
};
