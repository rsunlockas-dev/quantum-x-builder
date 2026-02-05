import fs from 'fs/promises';
import net from 'net';
import path from 'path';
import { connect } from 'nats';
import { config } from '../config.js';
import { readinessReport } from './readiness.js';
import { loadFeatureFlags } from './featureFlags.js';
import { QXB_STREAMS } from '../../../packages/qxb-protocol/src/index.js';

const GATES_PATH = path.resolve(config.workspaceRoot, '_state', 'gates.latest.json');
const INVENTORY_PATH = path.resolve(config.workspaceRoot, '_state', 'secrets.inventory.v1.json');
const STREAM_SUBJECTS = {
  [QXB_STREAMS.EVENTS]: ['qxb.evt.>'],
  [QXB_STREAMS.CHAT]: ['qxb.chat.>'],
  [QXB_STREAMS.RUNS]: ['qxb.run.>'],
  [QXB_STREAMS.STATE]: ['qxb.state.>'],
  [QXB_STREAMS.EVIDENCE]: ['qxb.evidence.>'],
  [QXB_STREAMS.TASKS]: ['qxb.task.>']
};

const REQUIRED_STREAMS = Object.keys(STREAM_SUBJECTS);
const REQUIRED_CONSUMERS = [
  { stream: QXB_STREAMS.EVENTS, durable: 'qxb-events-durable', filter: 'qxb.evt.>' },
  { stream: QXB_STREAMS.CHAT, durable: 'qxb-chat-durable', filter: 'qxb.chat.>' },
  { stream: QXB_STREAMS.RUNS, durable: 'qxb-runs-durable', filter: 'qxb.run.>' },
  { stream: QXB_STREAMS.STATE, durable: 'qxb-state-durable', filter: 'qxb.state.>' },
  { stream: QXB_STREAMS.EVIDENCE, durable: 'qxb-evidence-durable', filter: 'qxb.evidence.>' },
  { stream: QXB_STREAMS.TASKS, durable: 'qxb-tasks-durable', filter: 'qxb.task.>' }
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadGateState() {
  try {
    const contents = await fs.readFile(GATES_PATH, 'utf-8');
    return JSON.parse(contents);
  } catch {
    return { v2_admin_readiness: null, v3_integrity: null };
  }
}

async function persistGateState(update) {
  const current = await loadGateState();
  const next = {
    ...current,
    ...update,
    updated_at: new Date().toISOString()
  };
  await fs.mkdir(path.dirname(GATES_PATH), { recursive: true });
  await fs.writeFile(GATES_PATH, JSON.stringify(next, null, 2));
  return next;
}

function scoreChecks(checks) {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce((sum, check) => sum + (check.pass ? check.weight : 0), 0);
  const score = total ? Math.round((earned / total) * 100) : 0;
  return { total, earned, score };
}

async function checkTraceCorrelation() {
  const tracePath = path.resolve(config.workspaceRoot, 'backend', 'src', 'middleware', 'trace.js');
  const exists = await fileExists(tracePath);
  if (!exists) {
    return {
      pass: false,
      detail: 'trace middleware missing'
    };
  }
  const content = await fs.readFile(tracePath, 'utf-8');
  const hasTraceHeader = content.includes('x-trace-id');
  const hasSpanHeader = content.includes('x-span-id');
  return {
    pass: hasTraceHeader && hasSpanHeader,
    detail: hasTraceHeader && hasSpanHeader ? 'trace/span headers enforced' : 'missing trace/span headers'
  };
}

async function isContainerRuntime() {
  if (process.env.CODESPACES || process.env.CI) return true;
  try {
    await fs.access('/.dockerenv');
    return true;
  } catch {
    return false;
  }
}

async function resolveNatsUrls() {
  const inContainer = await isContainerRuntime();
  const defaultNats = inContainer ? 'nats://nats:4222' : 'nats://127.0.0.1:4222';
  const defaultVarz = inContainer ? 'http://nats:8222/varz' : 'http://127.0.0.1:8222/varz';
  return {
    natsUrl: process.env.NATS_URL || defaultNats,
    varzUrl: process.env.NATS_VARZ_URL || defaultVarz,
    runtime: inContainer ? 'container' : 'host'
  };
}

async function fetchVarzSnapshot(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = text.slice(0, 2000);
    }
    return {
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function tcpConnectCheck(natsUrl) {
  let host = '127.0.0.1';
  let port = 4222;
  try {
    const parsed = new URL(natsUrl);
    host = parsed.hostname || host;
    port = Number(parsed.port || 4222);
  } catch {
    return { ok: false, detail: 'invalid NATS_URL' };
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(2000);
    socket.once('connect', () => finish({ ok: true, detail: 'tcp_connect_ok' }));
    socket.once('timeout', () => finish({ ok: false, detail: 'tcp_timeout' }));
    socket.once('error', (error) => finish({ ok: false, detail: String(error) }));
    socket.connect(port, host);
  });
}

async function checkJetStreamLag(natsUrl) {
  let nc;
  try {
    nc = await connect({ servers: natsUrl, timeout: 2000 });
    nc.closed().catch(() => {});
    const js = await nc.jetstreamManager();
    if (config.runtime.envProfile === 'boxed') {
      await ensureJetStreamResources(js);
    }
    const streamNames = Object.values(QXB_STREAMS);
    const streamResults = [];

    for (const stream of streamNames) {
      let consumers = [];
      try {
        const list = await js.consumers.list(stream).next();
        consumers = list || [];
      } catch (error) {
        streamResults.push({ stream, status: 'missing', detail: String(error) });
        continue;
      }

      if (consumers.length === 0) {
        streamResults.push({ stream, status: 'no_consumers', lag: 0 });
        continue;
      }

      for (const consumer of consumers) {
        const info = await js.consumers.info(stream, consumer.name);
        const lag = (info.num_pending || 0) + (info.num_ack_pending || 0);
        streamResults.push({
          stream,
          consumer: consumer.name,
          status: lag === 0 ? 'ok' : 'lagging',
          lag
        });
      }
    }

    const lagging = streamResults.filter((result) => result.status === 'lagging');
    const missingConsumers = streamResults.filter((result) => result.status === 'no_consumers');
    const missingStreams = streamResults.filter((result) => result.status === 'missing');
    return {
      pass: lagging.length === 0 && missingConsumers.length === 0 && missingStreams.length === 0,
      detail:
        lagging.length || missingConsumers.length || missingStreams.length
          ? 'jetstream consumers missing or lagging'
          : 'jetstream consumers healthy',
      results: streamResults
    };
  } catch (error) {
    return {
      pass: false,
      detail: `jetstream unreachable: ${error.message || error}`
    };
  } finally {
    if (nc) {
      try {
        await nc.close();
      } catch {
        // Ignore close errors; they should not hide earlier results.
      }
    }
  }
}

async function ensureJetStreamResources(js) {
  for (const stream of REQUIRED_STREAMS) {
    try {
      await js.streams.info(stream);
    } catch {
      const subjects = STREAM_SUBJECTS[stream] || [];
      await js.streams.add({
        name: stream,
        subjects,
        retention: 'limits',
        storage: 'file'
      });
    }
  }

  for (const consumer of REQUIRED_CONSUMERS) {
    try {
      await js.consumers.info(consumer.stream, consumer.durable);
    } catch {
      await js.consumers.add(consumer.stream, {
        durable_name: consumer.durable,
        ack_policy: 'explicit',
        deliver_policy: 'all',
        filter_subject: consumer.filter
      });
    }
  }
}

export async function runAdminReadinessGateV2() {
  const [flags, readiness, inventoryExists] = await Promise.all([
    loadFeatureFlags(),
    readinessReport(),
    fileExists(INVENTORY_PATH)
  ]);

  const checks = [
    {
      id: 'boot_ready',
      label: 'Boot readiness true',
      pass: Boolean(readiness.boot_ready),
      weight: 25,
      detail: readiness.boot_ready ? 'boot_ready=true' : 'boot_ready=false'
    },
    {
      id: 'admin_enabled',
      label: 'Admin core enabled',
      pass: Boolean(flags.admin?.enabled),
      weight: 25,
      detail: flags.admin?.enabled ? 'admin.enabled=true' : 'admin.enabled=false'
    },
    {
      id: 'inventory',
      label: 'Secrets inventory present',
      pass: inventoryExists,
      weight: 25,
      detail: inventoryExists ? 'inventory found' : 'inventory missing'
    },
    {
      id: 'feature_flags',
      label: 'Feature flag file present',
      pass: await fileExists(path.resolve(config.workspaceRoot, '_state', 'feature_flags.v1.json')),
      weight: 25,
      detail: 'feature flags state checked'
    }
  ];

  const scored = scoreChecks(checks);
  const report = {
    gate: 'ADMIN_READINESS_V2',
    timestamp: new Date().toISOString(),
    score: scored.score,
    checks
  };

  await persistGateState({ v2_admin_readiness: report });
  return report;
}

export async function runIntegrityGateV3() {
  const traceCheck = await checkTraceCorrelation();
  const resolved = await resolveNatsUrls();
  const varzSnapshot = await fetchVarzSnapshot(resolved.varzUrl);
  const tcpCheck = await tcpConnectCheck(resolved.natsUrl);
  const varzOk = varzSnapshot.ok && varzSnapshot.status === 200;

  let jetStreamCheck = {
    pass: false,
    detail: `NATS_VARZ_UNREACHABLE::${resolved.varzUrl}`,
    results: []
  };

  try {
    if (varzOk && tcpCheck.ok) {
      jetStreamCheck = await checkJetStreamLag(resolved.natsUrl);
    } else if (!tcpCheck.ok) {
      jetStreamCheck = {
        pass: false,
        detail: `NATS_TCP_UNREACHABLE::${resolved.natsUrl}`,
        results: []
      };
    }
  } catch (error) {
    jetStreamCheck = {
      pass: false,
      detail: `jetstream_error: ${error.message || error}`,
      results: []
    };
  }

  const checks = [
    {
      id: 'trace_span',
      label: 'Trace/Span correlation enforced',
      pass: traceCheck.pass,
      weight: 50,
      detail: traceCheck.detail
    },
    {
      id: 'jetstream_lag',
      label: 'JetStream durable consumer lag',
      pass: jetStreamCheck.pass,
      weight: 50,
      detail: jetStreamCheck.detail,
      results: jetStreamCheck.results || []
    }
  ];

  const scored = scoreChecks(checks);
  const report = {
    gate: 'INTEGRITY_V3',
    timestamp: new Date().toISOString(),
    score: scored.score,
    checks,
    nats: {
      runtime: resolved.runtime,
      nats_url: resolved.natsUrl,
      varz_url: resolved.varzUrl,
      varz: varzSnapshot,
      tcp: tcpCheck
    }
  };

  await persistGateState({ v3_integrity: report });
  return report;
}

export async function loadGateScores() {
  const state = await loadGateState();
  return {
    v2_score: state.v2_admin_readiness?.score ?? 0,
    v3_score: state.v3_integrity?.score ?? 0
  };
}