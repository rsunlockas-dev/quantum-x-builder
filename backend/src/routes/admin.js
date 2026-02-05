import { requirePatFor } from '../middleware/pat.js';
import { readinessReport } from '../utils/readiness.js';
import { loadFeatureFlags } from '../utils/featureFlags.js';

export function registerAdminRoutes(app) {
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
        const flags = await loadFeatureFlags();
        if (!flags.admin?.enabled || !flags.admin?.expansion?.phase3?.enabled) {
          res.status(404).json({ error: 'Phase 3 admin expansions disabled' });
          return;
        }

        res.json({
          status: 'enabled',
          mode: 'phase3'
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );
}
