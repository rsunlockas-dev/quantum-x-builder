import { callOllama } from './ollama.js';
import { callGroq } from './groq.js';
import { callGemini } from './gemini.js';
import { callVertex } from './vertex.js';

export const providers = {
  ollama: callOllama,
  groq: callGroq,
  gemini: callGemini,
  vertex: callVertex
};
