import { config } from '../config.js';

export function ragReady() {
  return Boolean(config.rag.vertexSearchProjectId && config.rag.vertexSearchDatastore);
}

export async function queryMemory({ query }) {
  if (!ragReady()) {
    throw new Error('RAG store not configured');
  }

  return {
    matches: [],
    query
  };
}

export async function ingestMemory({ events }) {
  if (!ragReady()) {
    throw new Error('RAG store not configured');
  }

  return {
    status: 'accepted',
    count: Array.isArray(events) ? events.length : 0
  };
}
