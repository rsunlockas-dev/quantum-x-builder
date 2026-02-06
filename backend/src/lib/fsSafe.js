import fs from 'fs/promises';
import path from 'path';

const MAX_LINES = 400;

function isSafeName(name) {
  if (!name) return false;
  if (name.includes('..')) return false;
  if (name.includes('/') || name.includes('\\')) return false;
  return name === path.basename(name);
}

export async function listFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath);
    const files = [];
    for (const name of entries) {
      const filePath = path.join(dirPath, name);
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) continue;
        files.push({
          name,
          bytes: stat.size,
          updated_at: stat.mtime.toISOString()
        });
      } catch {
        // Ignore bad entries.
      }
    }
    files.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    return files;
  } catch {
    return [];
  }
}

export async function listDirectories(dirPath) {
  try {
    const entries = await fs.readdir(dirPath);
    const dirs = [];
    for (const name of entries) {
      const entryPath = path.join(dirPath, name);
      try {
        const stat = await fs.stat(entryPath);
        if (!stat.isDirectory()) continue;
        dirs.push({ name, updated_at: stat.mtime.toISOString() });
      } catch {
        // Ignore.
      }
    }
    dirs.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    return dirs;
  } catch {
    return [];
  }
}

export async function tailFile(dirPath, fileName, limit = 120) {
  if (!isSafeName(fileName)) {
    throw new Error('Invalid file name');
  }
  const safeLimit = Math.min(Math.max(Number(limit) || 120, 1), MAX_LINES);
  const filePath = path.join(dirPath, fileName);
  const contents = await fs.readFile(filePath, 'utf-8');
  const lines = contents.split(/\r?\n/);
  return {
    name: fileName,
    limit: safeLimit,
    lines: lines.slice(-safeLimit)
  };
}
