/**
 * MANUS-CORE AUTONOMOUS PARTNER PROPOSAL ENGINE
 *
 * This module provides the governance foundation for the Autonomous Partner system.
 *
 * PHASE 1: PREPARATION ONLY
 * - Accepts human intents
 * - Generates proposals (pure functions)
 * - Renders confirmation prompts
 * - Validates human approval
 *
 * DOES NOT:
 * - Execute anything
 * - Call external APIs
 * - Modify state
 * - Auto-approve
 *
 * STATUS: AWAITING_APPROVAL
 * All proposals require explicit human confirmation before any real-world action.
 */

// Type definitions (immutable contract)
export {
  type HumanIntent,
  type Proposal,
  type ReasoningState,
  type IntentType,
  type RiskLevel,
  type Recommendation,
  type ProposalStatus,
} from "./types";

// Reasoning pipeline (pure functions)
export {
  plannerRole,
  operatorRole,
  criticRole,
  tapGuardianRole,
  userAdvocateRole,
  synthesizeRecommendation,
  runReasoningPipeline,
} from "./reasoning";

// Proposal synthesis (intent → proposal)
export { synthesizeProposal, generateProposal } from "./proposal";

// Confirmation prompt rendering and validation
export {
  renderConfirmationPrompt,
  parseConfirmationResponse,
  handleConfirmationResponse,
} from "./confirmation";

/**
 * MAIN ENTRY POINT: Complete Proposal Flow
 *
 * Usage:
 *
 * import { generateProposal, renderConfirmationPrompt } from "./manus-core";
 *
 * const intent = {
 *   userId: "user-123",
 *   type: "account_operation",
 *   description: "Reset user password",
 *   payload: { accounts: ["user-456"] }
 * };
 *
 * // Step 1: Generate proposal (pure, no execution)
 * const proposal = generateProposal(intent);
 *
 * // Step 2: Render human-facing prompt
 * const prompt = renderConfirmationPrompt(proposal);
 * console.log(prompt);
 *
 * // Step 3: Human responds with YES or NO
 * // (waiting for explicit confirmation)
 *
 * // Step 4: After approval only → execution (Phase 2+)
 */
