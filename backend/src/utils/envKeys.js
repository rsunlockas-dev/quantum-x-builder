import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

let cache = null;

function normalizeKeyLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const raw = trimmed.split('=')[0].trim();
  return raw || null;
}

export async function loadEnvKeys() {
  if (cache) return cache;
  const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const filePath = path.resolve(baseDir, 'ENV_KEYS.md');
  const content = await fs.readFile(filePath, 'utf8');
  const keys = content
    .split(/\r?\n/)
    .map(normalizeKeyLine)
    .filter(Boolean);
  cache = new Set(keys);
  return cache;
}
