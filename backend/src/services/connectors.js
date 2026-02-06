import { config } from '../config.js';

export function connectorStatus() {
  return {
    github: Boolean(config.connectors.githubClientId),
    google: Boolean(config.connectors.googleClientId),
    vscode: Boolean(config.connectors.vscodeClientId),
    gcp: Boolean(config.connectors.googleClientId)
  };
}
