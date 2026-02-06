import fs from 'fs/promises';
import { connect } from 'nats';

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_BODY_BYTES = 512 * 1024;

async function isContainerRuntime() {
  if (process.env.CODESPACES || process.env.CI) return true;
  try {
    await fs.access('/.dockerenv');
    return true;
  } catch {
    return false;
  }
}

export async function resolveNatsUrls() {
  const inContainer = await isContainerRuntime();
  const defaultNats = inContainer ? 'nats://nats:4222' : 'nats://127.0.0.1:4222';
  const defaultVarz = inContainer ? 'http://nats:8222/varz' : 'http://127.0.0.1:8222/varz';
  return {
    natsUrl: process.env.NATS_URL || defaultNats,
    varzUrl: process.env.NATS_VARZ_URL || defaultVarz,
    runtime: inContainer ? 'container' : 'host'
  };
}

export async function fetchJsonWithLimit(url, timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = MAX_BODY_BYTES) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const buffer = await response.arrayBuffer();
    const clipped = buffer.byteLength > maxBytes;
    const slice = clipped ? buffer.slice(0, maxBytes) : buffer;
    const text = new TextDecoder().decode(slice);
    let body = null;
    let warning = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = text.slice(0, 2000);
    }
    if (clipped) {
      warning = `response truncated at ${maxBytes} bytes`;
    }
    return {
      ok: response.ok,
      status: response.status,
      body,
      warning
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

export async function fetchVarzSnapshot(url) {
  return fetchJsonWithLimit(url, DEFAULT_TIMEOUT_MS, MAX_BODY_BYTES);
}

export async function withNatsConnection(natsUrl, fn, retries = 1) {
  let attempt = 0;
  let lastError = null;
  while (attempt <= retries) {
    let nc;
    try {
      nc = await connect({ servers: natsUrl, timeout: DEFAULT_TIMEOUT_MS });
      nc.closed().catch(() => {});
      return await fn(nc);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) throw error;
    } finally {
      if (nc) {
        try {
          await nc.close();
        } catch {
          // Ignore close errors.
        }
      }
    }
    attempt += 1;
  }
  throw lastError;
}
