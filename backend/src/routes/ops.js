import { requirePatFor } from '../middleware/pat.js';
import { readinessReport } from '../utils/readiness.js';
import { runAdminReadinessGateV2, runIntegrityGateV3 } from '../utils/gates.js';
import { createAuditLog } from '../services/governor.js';
import { loadFeatureFlags } from '../utils/featureFlags.js';
import {
  loadAdminCapabilities,
  loadReadinessWithFlags,
  loadGateSummary,
  listEvidenceRuns,
  listLogFiles,
  tailLogFile,
  fetchNatsVarz,
  fetchJetStreamStatus,
  summarizeRuntime,
  envelope,
  errorEnvelope
} from '../utils/adminOps.js';

export function registerOpsRoutes(app) {
  const requirePhase3 = async (req, res, next) => {
    const flags = await loadFeatureFlags();
    if (!flags.admin?.enabled || !flags.admin?.expansion?.phase3?.enabled) {
      res.status(404).json({ ok: false, ts: new Date().toISOString(), error: 'Phase 3 admin expansions disabled' });
      return;
    }
    next();
  };

  app.get(
    '/__ops/readiness',
    requirePatFor({ action: 'ops:readiness', scope: 'ops' }),
    async (_req, res) => {
      try {
        const report = await readinessReport();
        let auditId = null;
        try {
          const log = await createAuditLog({
            event: 'ops.readiness',
            data: report
          });
          auditId = log.id;
        } catch {
          auditId = 'audit_disabled';
        }

        res.json({
          ...report,
          evidence: {
            audit_ledger_id: auditId
          }
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/__ops/gates/v2/admin-readiness',
    requirePatFor({ action: 'ops:gate:v2', scope: 'ops' }),
    async (_req, res) => {
      try {
        const report = await runAdminReadinessGateV2();
        let auditId = null;
        try {
          const log = await createAuditLog({
            event: 'ops.gate.admin_readiness_v2',
            data: report
          });
          auditId = log.id;
        } catch {
          auditId = 'audit_disabled';
        }
        res.json({ ...report, evidence: { audit_ledger_id: auditId } });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/__ops/gates/v3/integrity',
    requirePatFor({ action: 'ops:gate:v3', scope: 'ops' }),
    async (_req, res) => {
      try {
        const report = await runIntegrityGateV3();
        let auditId = null;
        try {
          const log = await createAuditLog({
            event: 'ops.gate.integrity_v3',
            data: report
          });
          auditId = log.id;
        } catch {
          auditId = 'audit_disabled';
        }
        res.json({ ...report, evidence: { audit_ledger_id: auditId } });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    }
  );

  app.get(
    '/__ops/admin/capabilities',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:capabilities', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await loadAdminCapabilities();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/readiness',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:readiness', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await loadReadinessWithFlags();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/gates',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:gates', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await loadGateSummary();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/phase3/status',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:phase3', scope: 'admin' }),
    async (_req, res) => {
      try {
        res.json(envelope({ status: 'enabled', mode: 'phase3' }));
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/nats/varz',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:nats:varz', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await fetchNatsVarz();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/nats/js',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:nats:js', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await fetchJetStreamStatus();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/evidence',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:evidence', scope: 'admin' }),
    async (_req, res) => {
      try {
        const limit = Number(_req.query.limit || 20);
        const payload = await listEvidenceRuns(limit);
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/logs',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:logs', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await listLogFiles();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/logs/:name',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:logs:tail', scope: 'admin' }),
    async (req, res) => {
      try {
        const limit = req.query.limit ? Number(req.query.limit) : 120;
        const payload = await tailLogFile(String(req.params.name || ''), limit);
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error, 400);
        res.status(status).json(payload);
      }
    }
  );

  app.get(
    '/__ops/admin/runtime',
    requirePhase3,
    requirePatFor({ action: 'ops:admin:runtime', scope: 'admin' }),
    async (_req, res) => {
      try {
        const payload = await summarizeRuntime();
        res.json(payload);
      } catch (error) {
        const { status, payload } = errorEnvelope(error);
        res.status(status).json(payload);
      }
    }
  );
}
