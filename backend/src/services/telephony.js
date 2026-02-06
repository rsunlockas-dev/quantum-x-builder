import { config } from '../config.js';

export function telephonyReady() {
  const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = config.telephony;
  return Boolean(twilioAccountSid && twilioAuthToken && twilioFromNumber);
}

export async function initiateCall({ to, message }) {
  if (!telephonyReady()) {
    throw new Error('Telephony not configured');
  }

  return {
    status: 'queued',
    provider: 'twilio',
    to,
    message
  };
}

export async function inboundWebhook(payload) {
  return {
    status: 'received',
    payload
  };
}
