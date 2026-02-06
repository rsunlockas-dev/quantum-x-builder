# PAT Protocol

PAT (Policy, Authority, Truth) defines the governance execution order for agentic systems. It forces safety and compliance constraints first, then resolves decision rights, then evaluates factual correctness and evidence last.

## Canonical Order

1. Policy
2. Authority
3. Truth

## Purpose

- Prevent unauthorized actions and policy violations even when truth-seeking is strong.
- Ensure safety and scope correctness before verification and optimization.

## Core Primitives

### Policy

Non-negotiable constraints that bound action space (safety, legal, compliance, security, budget, rate limits, data classification, non-destructive rules).

Properties:

- Hard gates (allow/deny)
- Least privilege
- Default-deny when uncertain
- Auditable

Outputs:

- ALLOWED_ACTIONS[]
- DENIED_ACTIONS[] + REASON
- REQUIRED_CONTROLS[] (logging, approvals, redaction, sandboxing)
- RISK_CLASSIFICATION

### Authority

The decision-rights layer: who can authorize what, under which scope, with which credentials. Enforces role boundaries (Neo vs agents vs services), scope, and approvals.

Properties:

- Explicit scope
- Credential boundary enforcement
- Approval requirements
- Separation of duties

Outputs:

- ACTOR (who is deciding/executing)
- SCOPE (systems/projects/resources)
- PERMISSIONS (what can be touched)
- APPROVALS_REQUIRED (true/false + why)
- EXECUTION_MODE (read-only | write | destructive-prohibited)

### Truth

Evidence and verification layer: compute, measure, and validate what is actually true AFTER the action space is bounded and authority is confirmed.

Properties:

- Evidence-driven
- Reproducible checks
- Fail-loud
- Deterministic outputs

Outputs:

- EVIDENCE_PACK (logs, manifests, hashes, snapshots)
- VALIDATION_RESULTS (pass/fail, findings)
- ASSERTIONS[] with proof
- UNCERTAINTIES[] + required data

## Execution Flow

### P0_POLICY_GATE

Steps:

- Classify request (safety, legal, data, budget).
- Enumerate allowed and denied actions.
- Require controls (audit logs, snapshots, rate limits, redaction).

Fail condition:

- Any policy violation => STOP with DENY + REASON.

### A0_AUTHORITY_GATE

Steps:

- Resolve actor and scope (Neo directive vs agent suggestion).
- Verify credentials exist and are within scope.
- Enforce approvals and separation-of-duties.

Fail condition:

- Missing or invalid authority or credentials => STOP with BLOCKED: <exact missing input>.

### T0_TRUTH_VERIFY

Steps:

- Run validations and measurements.
- Generate evidence pack.
- Compute pass/fail verdict.

Fail condition:

- Failed validations => STOP with FAIL + remediation actions (non-destructive).

### T1_TRUTH_LOCK

Steps:

- Seal artifacts (hashes) and write immutable ledger entry.
- Publish final verdict and pointers to evidence.

Artifacts:

- FORENSIC_VERDICT.json
- EVIDENCE_MANIFEST.json
- RUN_LOG.ndjson
- HASHES.sha256

## Canonical Decision Rules

- Policy always overrides Authority and Truth.
- Authority cannot authorize policy-denied actions.
- Truth checks never expand permissions; they only validate within the allowed scope.
- When uncertain: default-deny or require explicit Neo authorization.
- All write actions require pre-snapshots and post-verify.
- No destructive ops unless explicitly authorized and policy-allowed (typically prohibited).

## Response Contract

Allowed response states:

- ALLOW: proceed
- DENY: policy violation
- BLOCKED: exact missing input
- FAIL: truth validation failed
- PASS: truth validated and sealed

Required fields every run:

- policy_decision
- authority_decision
- truth_verdict
- evidence_paths
- hashes

## Minimal Runtime Schema

run_record:

- run_id: uuid
- timestamp_utc: ISO-8601
- policy:
	- allowed: []
	- denied: []
	- controls: []
	- risk: LOW | MED | HIGH | CRITICAL
- authority:
	- actor: Neo | Agent | Service
	- scope: []
	- permissions: []
	- approvals_required: false
- truth:
	- assertions: []
	- validations: []
	- verdict: PASS | FAIL | BLOCKED
	- evidence: []
	- hashes: []

## Shorthand Definition

PAT = Policy-first guardrails, Authority-next decision rights, Truth-last verification. It is an execution order, not a philosophy: it forces safety and scope correctness before facts or optimization.
