import { config } from '../config.js';

export async function callGroq(messages, requestConfig, systemInstruction) {
  const apiKey = config.groq.apiKey;
  if (!apiKey) return null;

  const payload = {
    model: config.groq.model,
    messages: [
      { role: 'system', content: systemInstruction },
      ...messages
    ],
    temperature: requestConfig?.temperature || 0.7
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq error: ${text}`);
  }

  const data = await response.json();
  return { text: data?.choices?.[0]?.message?.content || '', provider: 'groq' };
}
