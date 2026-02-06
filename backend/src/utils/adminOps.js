import fs from 'fs/promises';
import { config } from '../config.js';
import { resolvePath } from './paths.js';
import { loadFeatureFlags } from './featureFlags.js';
import { readinessReport } from './readiness.js';
import { runAdminReadinessGateV2, runIntegrityGateV3 } from './gates.js';
import { QXB_STREAMS } from '../../../packages/qxb-protocol/src/index.js';
import { fetchVarzSnapshot, resolveNatsUrls, withNatsConnection } from '../lib/nats.js';
import { listDirectories, listFiles, tailFile } from '../lib/fsSafe.js';

const LOGS_DIR = resolvePath('_OPS/_LOGS');
const EVIDENCE_DIR = resolvePath('_evidence');
const OPS_EVIDENCE_DIR = resolvePath('_OPS/_EVIDENCE');
const GATES_PATH = resolvePath('_state/gates.latest.json');

const ADMIN_ENDPOINTS = [
  {
    id: 'capabilities',
    method: 'GET',
    path: '/__ops/admin/capabilities',
    action: 'ops:admin:capabilities',
    scope: 'admin',
    description: 'Control-plane feature discovery'
  },
  {
    id: 'readiness',
    method: 'GET',
    path: '/__ops/admin/readiness',
    action: 'ops:admin:readiness',
    scope: 'admin',
    description: 'Boot readiness snapshot'
  },
  {
    id: 'gates',
    method: 'GET',
    path: '/__ops/admin/gates',
    action: 'ops:admin:gates',
    scope: 'admin',
    description: 'Gate summary and close-handling health'
  },
  {
    id: 'nats_varz',
    method: 'GET',
    path: '/__ops/admin/nats/varz',
    action: 'ops:admin:nats:varz',
    scope: 'admin',
    description: 'NATS varz snapshot'
  },
  {
    id: 'nats_js',
    method: 'GET',
    path: '/__ops/admin/nats/js',
    action: 'ops:admin:nats:js',
    scope: 'admin',
    description: 'JetStream streams/consumers snapshot'
  },
  {
    id: 'runtime',
    method: 'GET',
    path: '/__ops/admin/runtime',
    action: 'ops:admin:runtime',
    scope: 'admin',
    description: 'Runtime summary'
  },
  {
    id: 'evidence',
    method: 'GET',
    path: '/__ops/admin/evidence',
    action: 'ops:admin:evidence',
    scope: 'admin',
    description: 'Evidence pack index'
  },
  {
    id: 'logs',
    method: 'GET',
    path: '/__ops/admin/logs',
    action: 'ops:admin:logs',
    scope: 'admin',
    description: 'Log inventory'
  },
  {
    id: 'logs_tail',
    method: 'GET',
    path: '/__ops/admin/logs/:name',
    action: 'ops:admin:logs:tail',
    scope: 'admin',
    description: 'Log tail'
  }
];

export function envelope(data, warnings) {
  const payload = {
    ok: true,
    ts: new Date().toISOString(),
    data
  };
  if (warnings && warnings.length) payload.warnings = warnings;
  return payload;
}

export function errorEnvelope(error, status = 500) {
  return {
    status,
    payload: {
      ok: false,
      ts: new Date().toISOString(),
      error: String(error)
    }
  };
}

export async function loadAdminCapabilities() {
  const flags = await loadFeatureFlags();
  return envelope({
    flags: {
      admin_enabled: Boolean(flags.admin?.enabled),
      phase3_enabled: Boolean(flags.admin?.expansion?.phase3?.enabled),
      autonomy_enabled: Boolean(flags.autonomy?.enabled)
    },
    runtime: {
      env_profile: config.runtime.envProfile,
      stub_mode: config.runtime.stubMode,
      port: config.port
    },
    providers: {
      order: config.providerOrder,
      ollama: Boolean(config.ollama.url),
      groq: Boolean(config.groq.apiKey),
      gemini: Boolean(config.gemini.apiKey),
      vertex: Boolean(config.vertex.accessToken)
    },
    endpoints: ADMIN_ENDPOINTS
  });
}

export async function loadReadinessWithFlags() {
  const [flags, readiness] = await Promise.all([loadFeatureFlags(), readinessReport()]);
  return envelope({
    readiness,
    phase3: {
      enabled: Boolean(flags.admin?.expansion?.phase3?.enabled),
      admin_enabled: Boolean(flags.admin?.enabled)
    }
  });
}

async function loadGateState() {
  try {
    const contents = await fs.readFile(GATES_PATH, 'utf-8');
    return JSON.parse(contents);
  } catch {
    return null;
  }
}

export async function loadGateSummary() {
  const [v2, v3, persisted] = await Promise.all([
    runAdminReadinessGateV2(),
    runIntegrityGateV3(),
    loadGateState()
  ]);
  return envelope({
    persisted,
    v2,
    v3
  });
}

export async function fetchNatsVarz() {
  const resolved = await resolveNatsUrls();
  const snapshot = await fetchVarzSnapshot(resolved.varzUrl);
  const warnings = [];
  if (snapshot.warning) warnings.push(snapshot.warning);
  return envelope(
    {
      nats_url: resolved.natsUrl,
      varz_url: resolved.varzUrl,
      runtime: resolved.runtime,
      snapshot
    },
    warnings
  );
}

export async function fetchJetStreamStatus() {
  const resolved = await resolveNatsUrls();
  const streams = await withNatsConnection(resolved.natsUrl, async (nc) => {
    const js = await nc.jetstreamManager();
    const streamNames = Object.values(QXB_STREAMS);
    const results = [];

    for (const stream of streamNames) {
      try {
        const info = await js.streams.info(stream);
        let consumers = [];
        try {
          consumers = await js.consumers.list(stream).next();
        } catch (error) {
          consumers = [{ name: 'unavailable', error: String(error) }];
        }
        const consumerDetails = [];
        for (const consumer of consumers) {
          if (!consumer?.name || consumer?.error) {
            consumerDetails.push(consumer);
            continue;
          }
          const detail = await js.consumers.info(stream, consumer.name);
          consumerDetails.push({
            name: consumer.name,
            num_pending: detail.num_pending || 0,
            num_ack_pending: detail.num_ack_pending || 0,
            delivered: detail.delivered?.consumer_seq || 0
          });
        }
        results.push({
          name: stream,
          subjects: info.config?.subjects || [],
          retention: info.config?.retention,
          storage: info.config?.storage,
          state: info.state,
          consumers: consumerDetails
        });
      } catch (error) {
        results.push({ name: stream, status: 'missing', error: String(error) });
      }
    }
    return results;
  });

  return envelope({
    nats_url: resolved.natsUrl,
    streams
  });
}

export async function summarizeRuntime() {
  return envelope({
    pid: process.pid,
    uptime_s: Math.round(process.uptime()),
    node_version: process.version,
    env_profile: config.runtime.envProfile,
    port: config.port,
    workspace_root: config.workspaceRoot,
    api_token_configured: Boolean(config.apiToken),
    database_url_configured: Boolean(config.databaseUrl)
  });
}

export async function listEvidenceRuns(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const [primary, ops] = await Promise.all([
    listDirectories(EVIDENCE_DIR),
    listDirectories(OPS_EVIDENCE_DIR)
  ]);
  const runs = [
    ...primary.map((entry) => ({ ...entry, source: '_evidence' })),
    ...ops.map((entry) => ({ ...entry, source: '_OPS/_EVIDENCE' }))
  ];
  runs.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  return envelope({
    limit: safeLimit,
    runs: runs.slice(0, safeLimit)
  });
}

export async function listLogFiles() {
  const files = await listFiles(LOGS_DIR);
  return envelope({ files });
}

export async function tailLogFile(fileName, limit = 120) {
  const data = await tailFile(LOGS_DIR, fileName, limit);
  return envelope(data);
}
