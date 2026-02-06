import { requirePatFor } from '../middleware/pat.js';
import {
  listConnectors,
  upsertConnector,
  listAutonomyProfiles,
  upsertAutonomyProfile,
  createRun,
  getRun
} from '../services/qxb.js';
import { loadFeatureFlags } from '../utils/featureFlags.js';
import { loadGateScores } from '../utils/gates.js';

async function ensureAutonomyEnabled(res) {
  const [flags, scores] = await Promise.all([loadFeatureFlags(), loadGateScores()]);
  const enabled = Boolean(flags.autonomy?.enabled);
  const gatesOk = scores.v2_score === 100 && scores.v3_score === 100;
  if (!enabled || !gatesOk) {
    res.status(423).json({
      error: 'Autonomy modules disabled',
      required: { autonomy_enabled: true, v2_score: 100, v3_score: 100 },
      current: { autonomy_enabled: enabled, v2_score: scores.v2_score, v3_score: scores.v3_score }
    });
    return false;
  }
  return true;
}

export function registerQxbRoutes(app) {
  app.get('/api/qxb/connectors', async (_req, res) => {
    try {
      const connectors = await listConnectors();
      res.json({ connectors });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post(
    '/api/qxb/connectors',
    requirePatFor({ action: 'qxb:connector:write', scope: 'integrations' }),
    async (req, res) => {
      try {
        const { id, definition } = req.body || {};
        if (!definition) return res.status(400).json({ error: 'Missing definition' });
        const connector = await upsertConnector({ id, definition });
        res.json({ connector });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get('/api/qxb/autonomy', async (_req, res) => {
    try {
      const ok = await ensureAutonomyEnabled(res);
      if (!ok) return;
      const profiles = await listAutonomyProfiles();
      res.json({ profiles });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post(
    '/api/qxb/autonomy',
    requirePatFor({ action: 'qxb:autonomy:write', scope: 'governance' }),
    async (req, res) => {
      try {
        const ok = await ensureAutonomyEnabled(res);
        if (!ok) return;
        const { id, profile } = req.body || {};
        if (!profile) return res.status(400).json({ error: 'Missing profile' });
        const saved = await upsertAutonomyProfile({ id, profile });
        res.json({ profile: saved });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.post(
    '/api/qxb/runs',
    requirePatFor({ action: 'qxb:run:create', scope: 'runs' }),
    async (req, res) => {
      try {
        const ok = await ensureAutonomyEnabled(res);
        if (!ok) return;
        const { connectors, autonomyProfileId } = req.body || {};
        if (!Array.isArray(connectors)) return res.status(400).json({ error: 'Missing connectors array' });
        const run = await createRun({ connectors, autonomyProfileId });
        res.json({ run });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get('/api/qxb/runs/:id', async (req, res) => {
    try {
      const ok = await ensureAutonomyEnabled(res);
      if (!ok) return;
      const run = await getRun(req.params.id);
      res.json({ run });
    } catch (error) {
      res.status(404).json({ error: String(error) });
    }
  });
}
