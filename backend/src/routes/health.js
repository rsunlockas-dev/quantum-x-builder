import { runSystemChecks } from '../utils/systemChecks.js';

export function registerHealthRoutes(app) {
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
