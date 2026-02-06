import { config } from '../config.js';

export async function callOllama(messages, requestConfig, systemInstruction) {
  const baseUrl = config.ollama.url;
  const model = config.ollama.model;
  if (!baseUrl || !model) return null;

  const payload = {
    model,
    stream: false,
    messages: [
      { role: 'system', content: systemInstruction },
      ...messages
    ],
    options: {
      temperature: requestConfig?.temperature || 0.7
    }
  };

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error: ${text}`);
  }

  const data = await response.json();
  return { text: data?.message?.content || '', provider: 'ollama' };
}
