import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { getDb } from '../db.js';
import { validateSpec } from './validator.js';
import { readinessReport } from './readiness.js';

function isStubMode() {
  return config.runtime.stubMode || ['dev', 'boxed'].includes(config.runtime.envProfile);
}

async function checkDb() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  const db = getDb();
  if (!db) return { status: 'skipped', detail: 'DATABASE_URL not set' };
  try {
    await db.query('SELECT 1');
    return { status: 'ok' };
  } catch (error) {
    return { status: 'fail', detail: String(error) };
  }
}

async function checkOllama() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  if (!config.ollama.url) return { status: 'skipped', detail: 'OLLAMA_URL not set' };
  try {
    const response = await fetch(`${config.ollama.url.replace(/\/$/, '')}/api/tags`);
    if (!response.ok) return { status: 'fail', detail: `HTTP ${response.status}` };
    return { status: 'ok' };
  } catch (error) {
    return { status: 'fail', detail: String(error) };
  }
}


async function checkSpec() {
  try {
    const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    const specDir = path.resolve(baseDir, 'spec');
    const entries = await fs.readdir(specDir);
    return validateSpec({ availableDocs: entries });
  } catch (error) {
    return { status: 'fail', detail: String(error) };
  }
}

async function checkTemplates() {
  try {
    const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    const templateDir = path.resolve(baseDir, 'templates');
    const entries = await fs.readdir(templateDir);
    const templates = entries.filter((name) => name.endsWith('.json'));
    return { status: templates.length ? 'ok' : 'fail', count: templates.length };
  } catch (error) {
    return { status: 'fail', detail: String(error) };
  }
}

function checkTelephony() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = config.telephony;
  const ready = Boolean(twilioAccountSid && twilioAuthToken && twilioFromNumber);
  return { status: ready ? 'ok' : 'fail' };
}

function checkConnectors() {
  if (isStubMode()) {
    return { status: 'ok', github: true, google: true, vscode: true };
  }
  return {
    status: 'ok',
    github: Boolean(config.connectors.githubClientId),
    google: Boolean(config.connectors.googleClientId),
    vscode: Boolean(config.connectors.vscodeClientId)
  };
}

function checkRag() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  const ready = Boolean(config.rag.vertexSearchProjectId && config.rag.vertexSearchDatastore);
  return { status: ready ? 'ok' : 'fail' };
}

function checkBrowser() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  return { status: config.browser.playwrightEndpoint ? 'ok' : 'fail' };
}

function checkAutoMl() {
  if (isStubMode()) return { status: 'ok', detail: 'stubbed' };
  return { status: config.automl.projectId ? 'ok' : 'fail' };
}

export async function runSystemChecks() {
  const [db, ollama, spec, templates] = await Promise.all([
    checkDb(),
    checkOllama(),
    checkSpec(),
    checkTemplates()
  ]);

  return {
    db,
    ollama,
    spec,
    templates,
    telephony: checkTelephony(),
    connectors: checkConnectors(),
    rag: checkRag(),
    browser: checkBrowser(),
    automl: checkAutoMl(),
    readiness: await readinessReport()
  };
}
