import { listTemplates, loadTemplate } from '../utils/templates.js';

export function registerTemplateRoutes(app) {
  app.get('/api/templates', async (_req, res) => {
    try {
      const templates = await listTemplates();
      res.json({ templates });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/templates/:name', async (req, res) => {
    try {
      const template = await loadTemplate(req.params.name);
      res.json({ template });
    } catch (error) {
      res.status(404).json({ error: String(error) });
    }
  });
}
