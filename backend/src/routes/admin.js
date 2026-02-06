import { requirePatFor } from '../middleware/pat.js';
import { readinessReport } from '../utils/readiness.js';
import { loadFeatureFlags } from '../utils/featureFlags.js';

export function registerAdminRoutes(app) {
  const ensurePhase3 = async (res) => {
    const flags = await loadFeatureFlags();
    if (!flags.admin?.enabled || !flags.admin?.expansion?.phase3?.enabled) {
      res.status(404).json({ error: 'Phase 3 admin expansions disabled' });
      return false;
    }
    return true;
  };

  app.get(
    '/api/admin/providers/locker',
    requirePatFor({ action: 'admin:providers', scope: 'admin' }),
    async (_req, res) => {
      try {
        const flags = await loadFeatureFlags();
        if (!flags.admin?.enabled) {
          res.status(404).json({ error: 'Admin features disabled' });
          return;
        }

        const report = await readinessReport();
        const connectors = Object.fromEntries(
          Object.entries(report.connectors || {}).map(([name, info]) => [
            name,
            {
              ...info,
              locked: !info.enabled
            }
          ])
        );

        res.json({
          boot_ready: report.boot_ready,
          connectors,
          advisories: report.advisories || [],
          license: report.license || { configured: false, missing_keys: [] }
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/api/admin/phase3/status',
    requirePatFor({ action: 'admin:phase3:read', scope: 'admin' }),
    async (_req, res) => {
      try {
        const ok = await ensurePhase3(res);
        if (!ok) return;

        res.json({
          status: 'enabled',
          mode: 'phase3'
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/api/admin/phase3/catalog',
    requirePatFor({ action: 'admin:phase3:catalog', scope: 'admin' }),
    async (_req, res) => {
      try {
        const ok = await ensurePhase3(res);
        if (!ok) return;
        res.json({
          status: 'ok',
          items: []
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/api/admin/phase3/todos',
    requirePatFor({ action: 'admin:phase3:todos', scope: 'admin' }),
    async (_req, res) => {
      try {
        const ok = await ensurePhase3(res);
        if (!ok) return;
        res.json({
          status: 'ok',
          todos: []
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/api/admin/phase3/memory',
    requirePatFor({ action: 'admin:phase3:memory', scope: 'admin' }),
    async (_req, res) => {
      try {
        const ok = await ensurePhase3(res);
        if (!ok) return;
        res.json({
          status: 'ok',
          entries: []
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/api/admin/phase3/backplane',
    requirePatFor({ action: 'admin:phase3:backplane', scope: 'admin' }),
    async (_req, res) => {
      try {
        const ok = await ensurePhase3(res);
        if (!ok) return;
        res.json({
          status: 'ok',
          services: []
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );
}
