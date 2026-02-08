import { Message, GenerationConfig, UITheme } from '../types';

const baseUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;

function headers() {
  const base = { 'Content-Type': 'application/json' } as Record<string, string>;
  if (apiToken) base.Authorization = `Bearer ${apiToken}`;
  return base;
}

export const backendService = {
  isConfigured: Boolean(baseUrl),
  async streamChat(
    messages: Message[],
    config: GenerationConfig,
    theme: UITheme,
    onChunk: (chunk: string, links?: any[]) => void
  ) {
    if (!baseUrl) throw new Error('Backend not configured');
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
