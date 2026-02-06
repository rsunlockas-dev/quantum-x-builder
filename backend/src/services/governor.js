import crypto from 'crypto';
import { getDb } from '../db.js';

function nowIso() {
  return new Date().toISOString();
}

export async function createJob({ type, payload }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const id = `job_${crypto.randomUUID()}`;
  const status = 'pending';
  await db.query(
    'INSERT INTO governor_jobs (id, type, status, payload) VALUES ($1, $2, $3, $4)',
    [id, type, status, payload]
  );
  return { id, type, status, payload, createdAt: nowIso() };
}

export async function listJobs() {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query('SELECT * FROM governor_jobs ORDER BY created_at DESC');
  return result.rows;
}

export async function updateJob({ id, status, payload }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query(
    'UPDATE governor_jobs SET status = $1, payload = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [status, payload, id]
  );
  if (!result.rows.length) throw new Error('Job not found');
  return result.rows[0];
}

export async function createAuditLog({ event, data }) {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const id = `audit_${crypto.randomUUID()}`;
  await db.query(
    'INSERT INTO audit_logs (id, event, data) VALUES ($1, $2, $3)',
    [id, event, data]
  );
  return { id, event, data, createdAt: nowIso() };
}

export async function listAuditLogs() {
  const db = getDb();
  if (!db) throw new Error('Database not configured');
  const result = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
  return result.rows;
}
