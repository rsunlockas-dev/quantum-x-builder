import { Pool } from 'pg';
import { config } from './config.js';

let pool = null;

export function getDb() {
  if (!config.databaseUrl) return null;
  if (config.databaseUrl.startsWith('sqlite://')) return null;
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
  }
  return pool;
}

export async function initDb() {
  const db = getDb();
  if (!db) return { enabled: false };

  await db.query(`
    CREATE TABLE IF NOT EXISTS governor_jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS qxb_connectors (
      id TEXT PRIMARY KEY,
      definition JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS qxb_autonomy_profiles (
      id TEXT PRIMARY KEY,
      profile JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS qxb_runs (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      connectors JSONB NOT NULL,
      autonomy_profile_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  return { enabled: true };
}
