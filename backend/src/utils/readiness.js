import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

const DEFAULT_INVENTORY = {
  version: 'v1',
  keys: [
    { key: 'DATABASE_URL', class: 'CORE_BOOT_REQUIRED', boxed_fallback: 'sqlite://./_state/qxb.sqlite' },
    { key: 'OLLAMA_URL', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.ollama.enabled' },
    { key: 'TWILIO_ACCOUNT_SID', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.twilio.enabled' },
    { key: 'TWILIO_AUTH_TOKEN', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.twilio.enabled' },
    { key: 'TWILIO_FROM_NUMBER', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.twilio.enabled' },
    {
      key: 'VERTEX_SPEECH_PROJECT_ID',
      class: 'OPTIONAL_CONNECTOR',
      feature_flag: 'providers.vertex_speech.enabled'
    },
    {
      key: 'VERTEX_SEARCH_PROJECT_ID',
      class: 'OPTIONAL_CONNECTOR',
      feature_flag: 'providers.vertex_search.enabled'
    },
    {
      key: 'VERTEX_SEARCH_DATASTORE',
      class: 'OPTIONAL_CONNECTOR',
      feature_flag: 'providers.vertex_search.enabled'
    },
    { key: 'BIGQUERY_PROJECT_ID', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.bigquery.enabled' },
    { key: 'BIGQUERY_DATASET', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.bigquery.enabled' },
    { key: 'GCS_BUCKET', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.gcs.enabled' },
    { key: 'PLAYWRIGHT_ENDPOINT', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.playwright.enabled' },
    { key: 'AUTOML_PROJECT_ID', class: 'OPTIONAL_CONNECTOR', feature_flag: 'providers.automl.enabled' },
    { key: 'GITHUB_CLIENT_ID', class: 'OPTIONAL_CONNECTOR', feature_flag: 'auth.github.enabled' },
    { key: 'GITHUB_CLIENT_SECRET', class: 'OPTIONAL_CONNECTOR', feature_flag: 'auth.github.enabled' },
    { key: 'GOOGLE_CLIENT_ID', class: 'OPTIONAL_CONNECTOR', feature_flag: 'auth.google.enabled' },
    { key: 'GOOGLE_CLIENT_SECRET', class: 'OPTIONAL_CONNECTOR', feature_flag: 'auth.google.enabled' }
  ]
};

const FLAG_TRUE = new Set(['1', 'true', 'yes', 'on']);
const FLAG_FALSE = new Set(['0', 'false', 'no', 'off']);

function readFlag(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const normalized = String(raw).trim().toLowerCase();
  if (FLAG_TRUE.has(normalized)) return true;
  if (FLAG_FALSE.has(normalized)) return false;
  return defaultValue;
}

function connectorNameForFlag(flagName) {
  if (!flagName) return 'unclassified';
  return flagName.replace(/\.enabled$/, '');
}

async function loadInventory() {
  const inventoryPath = path.resolve(config.workspaceRoot, '_state', 'secrets.inventory.v1.json');
  try {
    const contents = await fs.readFile(inventoryPath, 'utf-8');
    const parsed = JSON.parse(contents);
    if (!parsed || !Array.isArray(parsed.keys)) return DEFAULT_INVENTORY;
    return parsed;
  } catch {
    return DEFAULT_INVENTORY;
  }
}

export async function readinessReport() {
  const inventory = await loadInventory();
  const stubbed = config.runtime.stubMode || ['dev', 'boxed'].includes(config.runtime.envProfile);
  const isBoxed = config.runtime.envProfile === 'boxed';

  const coreEntries = inventory.keys.filter((entry) => entry.class === 'CORE_BOOT_REQUIRED');
  const optionalEntries = inventory.keys.filter((entry) => entry.class === 'OPTIONAL_CONNECTOR');
  const licenseEntries = inventory.keys.filter((entry) => entry.class === 'LICENSE_UNLOCK');

  const missingCore = coreEntries.filter((entry) => !process.env[entry.key]);
  const coreFallbacks = missingCore.filter((entry) => isBoxed && entry.boxed_fallback);
  const blockedCore = stubbed
    ? []
    : missingCore.filter((entry) => !(isBoxed && entry.boxed_fallback));

  const connectorGroups = new Map();
  optionalEntries.forEach((entry) => {
    const group = connectorNameForFlag(entry.feature_flag);
    if (!connectorGroups.has(group)) {
      connectorGroups.set(group, {
        feature_flag: entry.feature_flag || null,
        keys: []
      });
    }
    connectorGroups.get(group).keys.push(entry.key);
  });

  const connectors = {};
  const advisories = [];
  connectorGroups.forEach((group, name) => {
    const missingKeys = group.keys.filter((key) => !process.env[key]);
    const enabled = group.feature_flag ? readFlag(group.feature_flag, false) : false;
    const configured = missingKeys.length === 0;
    connectors[name] = {
      configured,
      missing_keys: missingKeys,
      enabled
    };
    if (missingKeys.length) {
      advisories.push({ connector: name, missing_keys: missingKeys });
    }
  });

  const licenseMissing = licenseEntries.filter((entry) => !process.env[entry.key]);

  const bootReady = stubbed || blockedCore.length === 0;

  return {
    status: bootReady ? (stubbed ? 'stub-ok' : 'ok') : 'blocked',
    env_profile: config.runtime.envProfile,
    stubbed,
    boot_ready: bootReady,
    blocked_by: blockedCore.map((entry) => entry.key),
    boot_overrides: coreFallbacks.map((entry) => ({ key: entry.key, boxed_fallback: entry.boxed_fallback })),
    connectors,
    advisories,
    license: {
      configured: licenseMissing.length === 0,
      missing_keys: licenseMissing.map((entry) => entry.key)
    }
  };
}
