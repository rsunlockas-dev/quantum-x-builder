/**
 * PROPOSAL SYNTHESIS ENGINE
 * Converts reasoning state into canonical Proposal object.
 * Pure function. No execution. No side effects.
 */

import { HumanIntent, Proposal, ReasoningState } from "./types";
import { runReasoningPipeline, synthesizeRecommendation } from "./reasoning";

/**
 * Generate unique proposal ID
 * Format: PROP-{timestamp}-{random}
 */
function generateProposalId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROP-${timestamp}-${random}`;
}

/**
 * Build one-line intent summary
 */
function buildIntentSummary(intent: HumanIntent): string {
  const descriptionMap: Record<string, string> = {
    account_operation: `Perform account operation: ${intent.description}`,
    code_edit: `Edit code: ${intent.description}`,
    workspace_action: `Workspace action: ${intent.description}`,
    simulation: `Run simulation: ${intent.description}`,
    infrastructure_change: `Change infrastructure: ${intent.description}`,
    resource_allocation: `Allocate resources: ${intent.description}`,
  };

  return descriptionMap[intent.type] || intent.description;
}

/**
 * CANONICAL PROPOSAL SYNTHESIZER
 * Takes reasoning state and assembles Proposal object.
 *
 * This function MUST NOT:
 * - Execute anything
 * - Call external APIs
 * - Modify state
 * - Auto-approve
 *
 * It ONLY:
 * - Organizes reasoning output
 * - Validates structure
 * - Returns immutable Proposal
 */
export function synthesizeProposal(reasoningState: ReasoningState): Proposal {
  const finalRecommendation = synthesizeRecommendation(reasoningState.recommendations);

  const proposal: Proposal = {
    id: generateProposalId(),
    intent: reasoningState.intent.description,
    summary: buildIntentSummary(reasoningState.intent),
    actions: reasoningState.plannedActions,
    diffs: reasoningState.intent.payload?.diffs || undefined,
    resources: reasoningState.identifiedResources,
    risk: {
      impact: reasoningState.riskAssessment.level,
      explanation: reasoningState.riskAssessment.explanation,
      rollbackAvailable: reasoningState.riskAssessment.rollbackPossible,
    },
    recommendation: finalRecommendation,
    status: "AWAITING_APPROVAL",
    createdAt: Date.now(),
  };

  return proposal;
}

/**
 * MAIN ENTRY POINT: From Human Intent to Proposal
 * This is the public API for proposal generation.
 *
 * Flow:
 * 1. Accept human intent
 * 2. Run reasoning pipeline (pure functions)
 * 3. Synthesize proposal
 * 4. Return (does NOT execute)
 */
export function generateProposal(intent: HumanIntent): Proposal {
  // Step 1: Run all reasoning roles
  const reasoningState = runReasoningPipeline(intent);

  // Step 2: Synthesize canonical Proposal
  const proposal = synthesizeProposal(reasoningState);

  return proposal;
}
