import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

const DEFAULT_FLAGS = {
  version: 'v1',
  admin: {
    enabled: false,
    index: { enabled: false },
    todos: { enabled: false },
    catalog: { enabled: false },
    memory: { enabled: false },
    expansion: {
      phase3: { enabled: false }
    }
  },
  autonomy: { enabled: false },
  landing: { enabled: false },
  x1_predict: { enabled: false }
};

export async function loadFeatureFlags() {
  const flagsPath = path.resolve(config.workspaceRoot, '_state', 'feature_flags.v1.json');
  try {
    const contents = await fs.readFile(flagsPath, 'utf-8');
    const parsed = JSON.parse(contents);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_FLAGS;
    return { ...DEFAULT_FLAGS, ...parsed };
  } catch {
    return DEFAULT_FLAGS;
  }
}
