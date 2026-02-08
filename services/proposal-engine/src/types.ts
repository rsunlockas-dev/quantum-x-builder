/**
 * CANONICAL PROPOSAL SCHEMA
 * 
 * Single source of truth for consent and governance.
 * Non-negotiable structure. DO NOT ADD EXECUTION LOGIC.
 * 
 * This is a GOVERNANCE OBJECT, not an action executor.
 */

/**
 * Risk assessment for the proposed action
 */
export interface RiskAssessment {
  impact: "low" | "medium" | "high";
  explanation: string;
  rollbackAvailable: boolean;
}

/**
 * Resources affected by this proposal
 */
export interface AffectedResources {
  repos?: string[];      // GitHub repositories
  files?: string[];      // File paths
  accounts?: string[];   // Service accounts / credentials
  infra?: string[];      // Infrastructure components
}

/**
 * CANONICAL PROPOSAL SCHEMA
 * 
 * This object encapsulates everything a human needs to know
 * to make an informed consent decision.
 * 
 * It contains NO execution paths, NO side effects, NO auto-approval logic.
 * It is pure data representing a PROPOSED action.
 */
export interface Proposal {
  // Unique identifier for this proposal
  id: string;

  // What the user or system wants to accomplish (one sentence)
  intent: string;

  // Brief description of what this proposal does
  summary: string;

  // Explicit action steps the AI wants to take (in order)
  // Each step must be understandable by a human
  actions: string[];

  // Optional: Code/config diffs that would be applied
  // (for transparency, not for direct execution)
  diffs?: string[];

  // Resources affected by this proposal
  resources: AffectedResources;

  // Risk assessment and rollback availability
  risk: RiskAssessment;

  // AI's recommendation based on analysis
  // "proceed" = safe and recommended
  // "caution" = safe but with caveats
  // "do_not_proceed" = risky or not recommended
  recommendation: "proceed" | "caution" | "do_not_proceed";

  // Status of this proposal (locked to AWAITING_APPROVAL in Phase 1)
  status: "AWAITING_APPROVAL";

  // Timestamp when proposal was created
  createdAt: number;

  // Optional: Additional context or reasoning
  reasoning?: string;
}

/**
 * User's response to a proposal
 */
export interface ProposalResponse {
  proposalId: string;
  decision: "YES" | "NO";
  timestamp: number;
  reason?: string;  // Why user approved/rejected
}

/**
 * Internal representation for reasoning (DO NOT EXPOSE TO USER)
 * Used by reasoning roles to build up proposal content
 */
export interface ReasoningContext {
  intent: string;
  plannerAnalysis?: string;
  operatorAnalysis?: string;
  criticAnalysis?: string;
  tapGuardianAnalysis?: string;
  userAdvocateAnalysis?: string;
}

/**
 * Enumeration of reasoning roles (for internal use only)
 */
export enum ReasoningRole {
  PLANNER = "planner",           // What should be done?
  OPERATOR = "operator",         // How should it be done?
  CRITIC = "critic",             // What could go wrong?
  TAP_GUARDIAN = "tap_guardian", // TAP policy compliance
  USER_ADVOCATE = "user_advocate" // What's best for the user?
}
