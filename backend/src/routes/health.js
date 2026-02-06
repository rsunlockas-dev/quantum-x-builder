import { runSystemChecks } from '../utils/systemChecks.js';

export function registerHealthRoutes(app) {
  app.get('/', (_req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vizual-X Backend</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 40px; }
      h1 { margin-bottom: 8px; }
      ul { padding-left: 18px; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Vizual-X Backend</h1>
    <p>Status: OK</p>
    <h2>Health</h2>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/healthz">/healthz</a></li>
      <li><a href="/api/health">/api/health</a></li>
    </ul>
    <h2>Readiness</h2>
    <ul>
      <li><a href="/readyz">/readyz</a></li>
      <li>/__ops/readiness (PAT-gated)</li>
    </ul>
  </body>
</html>`);
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/startupz', (_req, res) => {
    res.json({ status: 'ok', startup: true });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      const checks = await runSystemChecks();
      res.json({ status: 'ok', checks });
    } catch (error) {
      res.status(500).json({ status: 'fail', error: String(error) });
    }
  });
}
