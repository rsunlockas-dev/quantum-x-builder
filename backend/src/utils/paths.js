import path from 'path';
import { config } from '../config.js';

export function resolvePath(targetPath = '') {
  const resolved = path.resolve(config.workspaceRoot, targetPath);
  if (!resolved.startsWith(config.workspaceRoot)) {
    throw new Error('Path outside workspace root');
  }
  return resolved;
}
