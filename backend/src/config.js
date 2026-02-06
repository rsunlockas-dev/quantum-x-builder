import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: backendEnvPath });
dotenv.config();

const workspaceRootDefault = path.resolve(__dirname, '..', '..');

export const config = {
  port: Number(process.env.PORT || 8787),
  workspaceRoot: path.resolve(process.env.WORKSPACE_ROOT || workspaceRootDefault),
  apiToken: process.env.API_TOKEN || '',
  databaseUrl: process.env.DATABASE_URL || '',
  runtime: {
    envProfile: process.env.ENV_PROFILE || 'prod',
    stubMode: process.env.STUB_MODE === 'true'
  },
  providerOrder: (process.env.PROVIDER_ORDER || 'ollama,groq,gemini,vertex')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
  ollama: {
    url: process.env.OLLAMA_URL,
    model: process.env.OLLAMA_MODEL
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
  },
  vertex: {
    accessToken: process.env.VERTEX_ACCESS_TOKEN,
    projectId: process.env.VERTEX_PROJECT_ID,
    location: process.env.VERTEX_LOCATION || 'us-central1',
    model: process.env.VERTEX_MODEL
  },
  telephony: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
    vertexSpeechProjectId: process.env.VERTEX_SPEECH_PROJECT_ID || '',
    vertexSpeechLocation: process.env.VERTEX_SPEECH_LOCATION || 'us-central1',
    vertexSpeechVoice: process.env.VERTEX_SPEECH_VOICE || 'en-US-Neural2-J',
    geminiVoiceModel: process.env.GEMINI_VOICE_MODEL || 'gemini-2.0-flash'
  },
  rag: {
    vertexSearchProjectId: process.env.VERTEX_SEARCH_PROJECT_ID || '',
    vertexSearchLocation: process.env.VERTEX_SEARCH_LOCATION || 'global',
    vertexSearchDatastore: process.env.VERTEX_SEARCH_DATASTORE || '',
    bigqueryProjectId: process.env.BIGQUERY_PROJECT_ID || '',
    bigqueryDataset: process.env.BIGQUERY_DATASET || '',
    gcsBucket: process.env.GCS_BUCKET || ''
  },
  connectors: {
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    vscodeClientId: process.env.VSCODE_CLIENT_ID || ''
  },
  browser: {
    playwrightEndpoint: process.env.PLAYWRIGHT_ENDPOINT || ''
  },
  automl: {
    projectId: process.env.AUTOML_PROJECT_ID || '',
    location: process.env.AUTOML_LOCATION || 'us-central1'
  }
};
