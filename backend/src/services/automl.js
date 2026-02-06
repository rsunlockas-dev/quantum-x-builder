import { config } from '../config.js';

export function automlReady() {
  return Boolean(config.automl.projectId);
}

export async function startTraining({ datasetId, displayName }) {
  if (!automlReady()) {
    throw new Error('AutoML not configured');
  }

  return {
    status: 'queued',
    datasetId,
    displayName
  };
}

export async function predict({ modelId, payload }) {
  if (!automlReady()) {
    throw new Error('AutoML not configured');
  }

  return {
    modelId,
    predictions: [],
    payload
  };
}
