const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vizualx.open', () => openVizualX(context))
  );

  openVizualX(context);
}

function openVizualX(context) {
  const panel = vscode.window.createWebviewPanel(
    'vizualx.studio',
    'Vizual-X Studio',
    { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(getDistPath(context))
      ]
    }
  );

  panel.webview.html = getWebviewHtml(panel.webview, context);
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

  html = html.replace(/\"\/assets\//g, `\"${assetsUri}/`);
  html = html.replace(/\'\/assets\//g, `\'${assetsUri}/`);
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
  <title>Vizual-X Studio</title>
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
  <h2>Vizual-X build not found</h2>
  <p>Run <code>npm install</code> then <code>npm run build</code> in the Vizual-X folder.</p>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
