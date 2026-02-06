import crypto from 'crypto';
import { getDb } from '../db.js';

function nowIso() {
  return new Date().toISOString();
}

export async function listConnectors() {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query('SELECT * FROM qxb_connectors ORDER BY created_at DESC');
  return result.rows;
}

export async function upsertConnector({ id, definition }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const connectorId = id || crypto.randomUUID();
  await db.query(
    'INSERT INTO qxb_connectors (id, definition) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET definition = $2',
    [connectorId, definition]
  );
  return { id: connectorId, definition, createdAt: nowIso() };
}

export async function listAutonomyProfiles() {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query('SELECT * FROM qxb_autonomy_profiles ORDER BY created_at DESC');
  return result.rows;
}

export async function upsertAutonomyProfile({ id, profile }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const profileId = id || crypto.randomUUID();
  await db.query(
    'INSERT INTO qxb_autonomy_profiles (id, profile) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET profile = $2',
    [profileId, profile]
  );
  return { id: profileId, profile, createdAt: nowIso() };
}

export async function createRun({ connectors, autonomyProfileId }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const id = `run_${crypto.randomUUID()}`;
  const state = 'SPEC_INTAKE';
  await db.query(
    'INSERT INTO qxb_runs (id, state, connectors, autonomy_profile_id) VALUES ($1, $2, $3, $4)',
    [id, state, connectors, autonomyProfileId || null]
  );
  return { id, state, connectors, autonomyProfileId, createdAt: nowIso() };
}

export async function getRun(id) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query('SELECT * FROM qxb_runs WHERE id = $1', [id]);
  if (!result.rows.length) throw new Error('Run not found');
  return result.rows[0];
}
