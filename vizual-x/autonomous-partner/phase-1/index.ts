/**
 * VIZUAL-X AUTONOMOUS PARTNER - PHASE 1
 * PREPARATION ONLY
 * 
 * This is the core governance layer.
 * Pure functions. No side effects. No execution.
 * 
 * Exports:
 * - Proposal schema (types)
 * - Proposal synthesis engine
 * - Confirmation prompt renderer
 * - Role-based reasoning functions
 */

// Type exports
export type { Proposal, ProposalRequest, ReasoningArtifact } from "./types/proposal";

// Engine exports
export { synthesizeProposal } from "./reasoning/proposal-engine";
export type { ProposalEngineOutput } from "./reasoning/proposal-engine";

// Role exports (for inspection/testing)
export { planActions } from "./reasoning/roles/planner";
export { assessFeasibility } from "./reasoning/roles/operator";
export { critique } from "./reasoning/roles/critic";
export { validateGovernance } from "./reasoning/roles/tap-guardian";
export { advocateForUser } from "./reasoning/roles/user-advocate";

// Confirmation prompt exports
export {
  renderConfirmationPrompt,
  renderDetailedProposalView,
  parseApprovalResponse,
} from "./confirmation/prompt-renderer";

/**
 * Public API: Main entry point for autonomous partner proposal flow.
 * 
 * Usage:
 * 
 *   import { createProposal, renderConfirmationPrompt } from "./phase-1";
 * 
 *   const { proposal, reasoning } = createProposal({
 *     intent: "Update the database schema",
 *   });
 * 
 *   console.log(renderConfirmationPrompt(proposal));
 *   // User reads prompt and types YES or NO
 * 
 */
export function createProposal(request: {
  intent: string;
  context?: Record<string, any>;
  constraints?: string[];
  deadline?: number;
}) {
  const { synthesizeProposal } = require("./reasoning/proposal-engine");
  return synthesizeProposal(request);
}
