import crypto from 'crypto';

export function createCloudEvent({ type, source, subject, data, extensions = {} }) {
  return {
    specversion: '1.0',
    id: crypto.randomUUID(),
    source,
    type,
    time: new Date().toISOString(),
    subject,
    datacontenttype: 'application/json',
    dataschema: extensions.dataschema || '',
    data,
    ...extensions
  };
}

export function ensureQxbExtensions(event, extensions = {}) {
  return {
    ...event,
    qxb_run_id: extensions.qxb_run_id || event.qxb_run_id || null,
    qxb_task_id: extensions.qxb_task_id || event.qxb_task_id || null,
    qxb_agent_id: extensions.qxb_agent_id || event.qxb_agent_id || null,
    qxb_role: extensions.qxb_role || event.qxb_role || null,
    qxb_risk: extensions.qxb_risk || event.qxb_risk || null,
    qxb_autonomy_mode: extensions.qxb_autonomy_mode || event.qxb_autonomy_mode || null,
    qxb_policy_hash: extensions.qxb_policy_hash || event.qxb_policy_hash || null,
    qxb_authority_hash: extensions.qxb_authority_hash || event.qxb_authority_hash || null,
    qxb_trace_id: extensions.qxb_trace_id || event.qxb_trace_id || null,
    qxb_span_id: extensions.qxb_span_id || event.qxb_span_id || null
  };
}
