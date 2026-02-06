import { requirePatFor } from '../middleware/pat.js';
import { automlReady, startTraining, predict } from '../services/automl.js';

export function registerAutoMlRoutes(app) {
  app.get('/api/automl/status', (_req, res) => {
    res.json({ ready: automlReady() });
  });

  app.post(
    '/api/automl/train',
    requirePatFor({ action: 'automl:train', scope: 'ml' }),
    async (req, res) => {
      try {
        const { datasetId, displayName } = req.body || {};
        if (!datasetId) return res.status(400).json({ error: 'Missing datasetId' });
        const result = await startTraining({ datasetId, displayName });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.post('/api/automl/predict', async (req, res) => {
    try {
      const { modelId, payload } = req.body || {};
      if (!modelId) return res.status(400).json({ error: 'Missing modelId' });
      const result = await predict({ modelId, payload });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}
