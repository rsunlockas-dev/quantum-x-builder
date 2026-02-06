import { requirePatFor } from '../middleware/pat.js';
import { initiateCall, inboundWebhook, telephonyReady } from '../services/telephony.js';

export function registerTelephonyRoutes(app) {
  app.get('/api/telephony/status', (_req, res) => {
    res.json({ ready: telephonyReady() });
  });

  app.post(
    '/api/telephony/call',
    requirePatFor({ action: 'telephony:call', scope: 'calls' }),
    async (req, res) => {
      try {
        const { to, message } = req.body || {};
        if (!to) return res.status(400).json({ error: 'Missing to' });
        const result = await initiateCall({ to, message });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.post('/api/telephony/webhook', async (req, res) => {
    try {
      const result = await inboundWebhook(req.body || {});
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}
