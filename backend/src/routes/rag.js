import { requirePatFor } from '../middleware/pat.js';
import { ingestMemory, queryMemory, ragReady } from '../services/rag.js';

export function registerRagRoutes(app) {
  app.get('/api/rag/status', (_req, res) => {
    res.json({ ready: ragReady() });
  });

  app.post('/api/rag/query', async (req, res) => {
    try {
      const { query } = req.body || {};
      if (!query) return res.status(400).json({ error: 'Missing query' });
      const result = await queryMemory({ query });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post(
    '/api/rag/ingest',
    requirePatFor({ action: 'rag:ingest', scope: 'memory' }),
    async (req, res) => {
      try {
        const { events } = req.body || {};
        const result = await ingestMemory({ events });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );
}
