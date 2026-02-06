import { requirePatFor } from '../middleware/pat.js';
import { browserReady, runBrowserTask } from '../services/browser.js';

export function registerBrowserRoutes(app) {
  app.get('/api/browser/status', (_req, res) => {
    res.json({ ready: browserReady() });
  });

  app.post(
    '/api/browser/run',
    requirePatFor({ action: 'browser:run', scope: 'automation' }),
    async (req, res) => {
      try {
        const { url, script } = req.body || {};
        if (!url) return res.status(400).json({ error: 'Missing url' });
        const result = await runBrowserTask({ url, script });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );
}
