import { config } from '../config.js';

export function requireAuth(req, res, next) {
  if (!config.apiToken) return next();
  const header = req.headers.authorization || '';
  if (header === `Bearer ${config.apiToken}`) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
