import { requirePatFor } from '../middleware/pat.js';
import { connectorStatus } from '../services/connectors.js';

export function registerConnectorRoutes(app) {
  app.get('/api/connectors/status', (_req, res) => {
    res.json({ status: connectorStatus() });
  });

  app.post(
    '/api/connectors/github/start',
    requirePatFor({ action: 'connectors:github', scope: 'integrations' }),
    (req, res) => {
      res.json({ status: 'stub', next: 'oauth', detail: req.body || {} });
    }
  );

  app.post(
    '/api/connectors/google/start',
    requirePatFor({ action: 'connectors:google', scope: 'integrations' }),
    (req, res) => {
      res.json({ status: 'stub', next: 'oauth', detail: req.body || {} });
    }
  );

  app.post(
    '/api/connectors/vscode/link',
    requirePatFor({ action: 'connectors:vscode', scope: 'integrations' }),
    (req, res) => {
      res.json({ status: 'stub', next: 'oauth', detail: req.body || {} });
    }
  );

  app.post(
    '/api/connectors/gcp/link',
    requirePatFor({ action: 'connectors:gcp', scope: 'integrations' }),
    (req, res) => {
      res.json({ status: 'stub', next: 'service-account', detail: req.body || {} });
    }
  );
}
