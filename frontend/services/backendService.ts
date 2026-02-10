import { Message, GenerationConfig, UITheme } from '../types';

const baseUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;
const isMockMode = process.env.MOCK_MODE === 'true' || import.meta.env.VITE_MOCK_MODE === 'true';

function headers() {
  const base = { 'Content-Type': 'application/json' } as Record<string, string>;
  if (apiToken) base.Authorization = `Bearer ${apiToken}`;
  return base;
}

// Mock response for demo/Pages mode
async function mockStreamChat(
  messages: Message[],
  config: GenerationConfig,
  theme: UITheme,
  onChunk: (chunk: string, links?: any[]) => void
) {
  // Simulate a realistic response
  const mockResponse = `**Mock Mode Active** 🎭

This is a demo response. The Quantum-X-Builder frontend is running in mock mode because no backend is configured.

**Current Configuration:**
- Backend URL: ${baseUrl || 'Not configured'}
- Operating Mode: Demo
- Messages in conversation: ${messages.length}

**Features Available in Mock Mode:**
✅ UI Exploration
✅ Theme Customization  
✅ Interface Navigation
✅ Component Testing

**To Enable Full Functionality:**
Configure the backend by setting VITE_BACKEND_URL environment variable or deploy the full stack using Docker.

For more information, see the documentation at: https://github.com/InfinityXOneSystems/quantum-x-builder`;

  // Simulate streaming with delays
  const words = mockResponse.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    onChunk(words.slice(0, i + 1).join(' '));
  }
}

export const backendService = {
  isConfigured: Boolean(baseUrl) && !isMockMode,
  isMockMode,
  async streamChat(
    messages: Message[],
    config: GenerationConfig,
    theme: UITheme,
    onChunk: (chunk: string, links?: any[]) => void
  ) {
    // Use mock mode if enabled or backend not configured
    if (isMockMode || !baseUrl) {
      return mockStreamChat(messages, config, theme, onChunk);
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
