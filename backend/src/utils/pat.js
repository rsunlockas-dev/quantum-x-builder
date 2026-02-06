const ALLOWED_RESPONSE_STATES = new Set([
  'ALLOW: proceed',
  'DENY: policy violation',
  'BLOCKED: exact missing input',
  'FAIL: truth validation failed',
  'PASS: truth validated and sealed'
]);

const TRUTH_VERDICTS = new Set(['PASS', 'FAIL', 'BLOCKED']);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function parseJsonMaybe(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizePolicy(policy) {
  if (!policy) return {};
  if (typeof policy === 'string') return { state: policy };
  if (typeof policy === 'object') return policy;
  return {};
}

function normalizeAuthority(authority) {
  if (!authority) return {};
  if (typeof authority === 'string') return { actor: authority };
  if (typeof authority === 'object') return authority;
  return {};
}

function normalizeTruth(truth) {
  if (!truth) return {};
  if (typeof truth === 'string') return { verdict: truth };
  if (typeof truth === 'object') return truth;
  return {};
}

export function normalizePatRecord(input) {
  if (!input || typeof input !== 'object') return null;

  const policy = normalizePolicy(input.policy ?? input.policy_decision);
  const authority = normalizeAuthority(input.authority ?? input.authority_decision);
  const truth = normalizeTruth(input.truth ?? input.truth_verdict);

  const evidencePaths = asArray(
    input.evidence_paths ?? input.evidence ?? truth.evidence
  ).filter(Boolean);
  const hashes = asArray(input.hashes ?? truth.hashes).filter(Boolean);

  const responseState =
    input.response_state ??
    input.state ??
    policy.state ??
    input.policy_decision?.state ??
    null;

  return {
    policy,
    authority,
    truth,
    evidence_paths: evidencePaths,
    hashes,
    response_state: responseState
  };
}

export function extractPatRecord(req) {
  if (req.body?.pat) return req.body.pat;
  const header = req.headers['x-pat-record'] || req.headers['x-pat'];
  if (typeof header === 'string') return parseJsonMaybe(header);
  return null;
}

export function validatePatRecord(input) {
  const normalized = normalizePatRecord(input);
  if (!normalized) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'Missing PAT record'
    };
  }

  const missing = [];
  if (!normalized.policy || Object.keys(normalized.policy).length === 0) {
    missing.push('policy_decision');
  }
  if (!normalized.authority || Object.keys(normalized.authority).length === 0) {
    missing.push('authority_decision');
  }
  if (!normalized.truth || Object.keys(normalized.truth).length === 0) {
    missing.push('truth_verdict');
  }
  if (!normalized.evidence_paths || normalized.evidence_paths.length === 0) {
    missing.push('evidence_paths');
  }
  if (!normalized.hashes || normalized.hashes.length === 0) {
    missing.push('hashes');
  }

  if (missing.length) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: `Missing fields: ${missing.join(', ')}`,
      missing
    };
  }

  if (normalized.response_state && !ALLOWED_RESPONSE_STATES.has(normalized.response_state)) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'Invalid response_state'
    };
  }

  const verdict = normalized.truth.verdict || normalized.truth_verdict;
  if (verdict && !TRUTH_VERDICTS.has(String(verdict))) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'Invalid truth verdict'
    };
  }

  return { ok: true, normalized };
}

function actionAllowed(policy, action) {
  const denied = asArray(policy.denied ?? policy.denied_actions).map(String);
  if (denied.includes(action)) return { allowed: false, reason: 'Policy denied' };

  const allowed = asArray(policy.allowed ?? policy.allowed_actions).map(String);
  if (allowed.length && !allowed.includes(action)) {
    return { allowed: false, reason: 'Policy does not allow action' };
  }

  return { allowed: true };
}

function authorityAllows(authority, action, scope) {
  if (authority.approvals_required) {
    return { allowed: false, reason: 'Approval required' };
  }

  const permissions = asArray(authority.permissions).map(String);
  if (permissions.length && !permissions.includes(action)) {
    return { allowed: false, reason: 'Permission missing' };
  }

  const scopes = asArray(authority.scope).map(String);
  if (scope && scopes.length && !scopes.includes(scope)) {
    return { allowed: false, reason: 'Scope missing' };
  }

  return { allowed: true };
}

export function enforcePat({ pat, action, scope }) {
  const validation = validatePatRecord(pat);
  if (!validation.ok) {
    return {
      status: validation.status,
      reason: validation.reason
    };
  }

  const normalized = validation.normalized;
  const policyCheck = actionAllowed(normalized.policy, action);
  if (!policyCheck.allowed) {
    return { status: 'DENY', reason: policyCheck.reason };
  }

  const authorityCheck = authorityAllows(normalized.authority, action, scope);
  if (!authorityCheck.allowed) {
    return { status: 'BLOCKED', reason: authorityCheck.reason };
  }

  const verdict = normalized.truth.verdict || normalized.truth_verdict;
  if (String(verdict) !== 'PASS') {
    return { status: 'FAIL', reason: 'Truth verdict not PASS' };
  }

  return { status: 'ALLOW', normalized };
}
