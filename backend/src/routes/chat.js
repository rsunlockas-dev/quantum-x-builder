import { config } from '../config.js';
import { providers } from '../providers/index.js';
import { buildSystemInstruction, normalizeMessages } from '../utils/messages.js';

async function routeChat(messages, requestConfig, theme, providerOrder) {
  const order = Array.isArray(providerOrder) && providerOrder.length
    ? providerOrder
    : config.providerOrder;

  const systemInstruction = buildSystemInstruction(theme);
  const normalized = normalizeMessages(messages);

  let lastError = null;
  for (const name of order) {
    const handler = providers[name];
    if (!handler) continue;
    try {
      const result = await handler(normalized, requestConfig, systemInstruction);
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No providers available');
}

export function registerChatRoutes(app) {
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, config: requestConfig, theme, providerOrder } = req.body || {};
      const result = await routeChat(messages || [], requestConfig || {}, theme || {}, providerOrder);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}
