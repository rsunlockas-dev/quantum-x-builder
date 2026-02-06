import { createJob, listJobs, updateJob, createAuditLog, listAuditLogs } from '../services/governor.js';
import { requirePatFor } from '../middleware/pat.js';

export function registerGovernorRoutes(app) {
  app.post(
    '/api/governor/jobs',
    requirePatFor({ action: 'governor:jobs:create', scope: 'governor' }),
    async (req, res) => {
      try {
        const { type, payload } = req.body || {};
        if (!type) return res.status(400).json({ error: 'Missing type' });
        const job = await createJob({ type, payload: payload || {} });
        res.json({ job });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get('/api/governor/jobs', async (_req, res) => {
    try {
      const jobs = await listJobs();
      res.json({ jobs });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.patch(
    '/api/governor/jobs/:id',
    requirePatFor({ action: 'governor:jobs:update', scope: 'governor' }),
    async (req, res) => {
      try {
        const { status, payload } = req.body || {};
        if (!status) return res.status(400).json({ error: 'Missing status' });
        const job = await updateJob({ id: req.params.id, status, payload: payload || {} });
        res.json({ job });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.post(
    '/api/governor/audit',
    requirePatFor({ action: 'governor:audit:create', scope: 'governor' }),
    async (req, res) => {
      try {
        const { event, data } = req.body || {};
        if (!event) return res.status(400).json({ error: 'Missing event' });
        const log = await createAuditLog({ event, data: data || {} });
        res.json({ log });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get('/api/governor/audit', async (_req, res) => {
    try {
      const logs = await listAuditLogs();
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}
