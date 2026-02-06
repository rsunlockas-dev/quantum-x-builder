const REQUIRED_DOCS = [
  'MANIFEST.md',
  'QUANTUM_CODING_CONSTITUTION.md',
  'GOVERNOR_AGENT.md',
  'ARCHITECT_AGENT.md',
  'FEATURE_AGENT.md',
  'TEST_GENERATION_AGENT.md',
  'EDGE_CASE_AGENT.md',
  'SECURITY_AGENT.md',
  'PERFORMANCE_AGENT.md',
  'AUTO_FIX_AGENT.md',
  'REVIEW_AGENT.md',
  'SANDBOX_ORCHESTRATION.md',
  'FAILURE_CLASSIFICATION.md',
  'AUTO_FIX_LOOP.md',
  'PAT_PROTOCOL.md',
  'PIPELINE_EXECUTOR.md',
  'IMPLEMENTATION_GUIDE.md'
];

export function validateSpec({ availableDocs = [] }) {
  const missing = REQUIRED_DOCS.filter((doc) => !availableDocs.includes(doc));
  return {
    status: missing.length === 0 ? 'pass' : 'fail',
    missing,
    required: REQUIRED_DOCS
  };
}
