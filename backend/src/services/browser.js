import { config } from '../config.js';

export function browserReady() {
  return Boolean(config.browser.playwrightEndpoint);
}

export async function runBrowserTask({ url, script }) {
  if (!browserReady()) {
    throw new Error('Playwright endpoint not configured');
  }

  return {
    status: 'queued',
    url,
    script
  };
}
