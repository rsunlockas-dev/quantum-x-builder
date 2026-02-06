import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

export async function callGemini(messages, requestConfig, systemInstruction) {
  const apiKey = config.gemini.apiKey;
  if (!apiKey) return null;

  const model = requestConfig?.model || config.gemini.model;
  const ai = new GoogleGenAI({ apiKey });

  const history = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model,
    contents: history,
    config: {
      temperature: requestConfig?.temperature || 0.7,
      systemInstruction
    }
  });

  const text = response?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return { text, provider: 'gemini' };
}
