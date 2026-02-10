import { Message, GenerationConfig, UITheme } from '../types';

// Accept both names for compatibility; prefer VITE_BACKEND_URL.
const baseUrl = (import.meta.env.VITE_BACKEND_URL as string)
  || (import.meta.env.VITE_API_URL as string)
  || undefined;

const useMock = (import.meta.env.VITE_MOCK_API === 'true');

function headers() {
  const base = { 'Content-Type': 'application/json' } as Record<string, string>;
  const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;
  if (apiToken) base.Authorization = `Bearer ${apiToken}`;
  return base;
}

async function mockStreamChat(messages: Message[], config: GenerationConfig, theme: UITheme, onChunk: (chunk: string) => void) {
  const reply = { text: 'This is a mock reply — enable a real backend by setting VITE_BACKEND_URL.' };
  const chunks = reply.text.match(/.{1,60}/g) || [reply.text];
  for (const c of chunks) {
    await new Promise((r) => setTimeout(r, 120));
    onChunk(c);
  }
}

export const backendService = {
  isConfigured: Boolean(baseUrl) && !useMock,
  async streamChat(
    messages: Message[],
    config: GenerationConfig,
    theme: UITheme,
    onChunk: (chunk: string, links?: any[]) => void
  ) {
    if (useMock || !baseUrl) {
      return mockStreamChat(messages, config, theme, (c) => onChunk(c));
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ messages, config, theme })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    onChunk(data.text || '');
  }
};
