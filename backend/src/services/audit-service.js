/**
 * Audit Service
 * Maintains immutable audit trail of all operations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class AuditService {
  constructor() {
    this.auditPath = null;
  }

  async init() {
    const workspaceRoot = process.env.WORKSPACE_ROOT || '/workspace';
    this.auditPath = path.join(workspaceRoot, '_OPS/AUDIT_IMMUTABLE');
    
    try {
      await fs.mkdir(this.auditPath, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize audit directory:', error);
    }
  }

  async log(entry) {
    if (!this.auditPath) {
      await this.init();
    }

    try {
      // Ensure entry has required fields
      const randomId = randomBytes(4).toString('hex');
      const auditEntry = {
        id: `audit-${Date.now()}-${randomId}`,
        timestamp: entry.timestamp || new Date().toISOString(),
        actor: entry.actor,
        action: entry.action,
        resource: entry.resource || 'unknown',
        result: entry.result || 'EXECUTED',
        details: entry.details || {},
      };

      // Append to current day's audit log (immutable)
      const date = new Date().toISOString().split('T')[0];
      const auditFile = path.join(this.auditPath, `${date}.ndjson`);

      // Append as newline-delimited JSON
      await fs.appendFile(auditFile, JSON.stringify(auditEntry) + '\n');

      return auditEntry.id;
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      throw error;
    }
  }

  async getEntries(limit = 100) {
    if (!this.auditPath) {
      await this.init();
    }

    try {
      const files = await fs.readdir(this.auditPath);
      const entries = [];

      // Sort files in reverse date order (most recent first)
      const sortedFiles = files
        .filter(f => f.endsWith('.ndjson'))
        .sort()
        .reverse();

      for (const file of sortedFiles) {
        const content = await fs.readFile(path.join(this.auditPath, file), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l);

        // Parse and collect entries (reverse to get most recent first)
        for (const line of lines.reverse()) {
          if (entries.length >= limit) break;
          try {
            entries.push(JSON.parse(line));
          } catch {
            // Skip malformed lines
          }
        }

        if (entries.length >= limit) break;
      }

      return entries;
    } catch (error) {
      console.error('Failed to read audit entries:', error);
      return [];
    }
  }

  async getEntriesForAction(action, limit = 50) {
    const allEntries = await this.getEntries(limit * 2);
    return allEntries.filter(e => e.action === action).slice(0, limit);
  }

  async getEntriesByActor(actor, limit = 50) {
    const allEntries = await this.getEntries(limit * 2);
    return allEntries.filter(e => e.actor === actor).slice(0, limit);
  }
}

export const auditService = new AuditService();
