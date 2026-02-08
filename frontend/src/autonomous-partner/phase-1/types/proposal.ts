/**
 * VIZUAL-X Autonomous Partner
 * PHASE 1: CANONICAL PROPOSAL SCHEMA (NON-NEGOTIABLE)
 * 
 * This is the single source of truth for consent and governance.
 * NO execution logic belongs here.
 * NO auto-approval.
 * NO side effects.
 * 
 * All autonomous operations must synthesize exactly ONE Proposal object.
 * Human approval is ALWAYS required before execution.
 */

/**
 * Canonical Proposal: The consent contract between AI and human.
 * 
 * This interface MUST NOT be modified without explicit governance approval.
 */
export interface Proposal {
  /**
   * Unique identifier for this proposal.
   * Format: "proposal-{uuid}" or timestamp-based
   */
  id: string;

  /**
   * What the AI is proposing to do (human-facing intent).
   * One sentence describing the purpose, not the mechanics.
   */
  intent: string;

  /**
   * Summary of the proposal for quick understanding.
   */
  summary: string;

  /**
   * EXPLICIT action steps the AI wants to take.
   * Each step MUST be a complete, unambiguous sentence.
   * Example: "Run migration script v3.1 on production DB"
   */
  actions: string[];

  /**
   * Code/config diffs affected by this proposal (optional).
   * If the proposal involves code changes, include diff representations here.
   * Format: raw diff or structured change objects.
   */
  diffs?: string[];

  /**
   * Resources that would be affected by this proposal.
   */
  resources: {
    /** Git repositories affected */
    repos?: string[];

    /** Files that would be created, modified, or deleted */
    files?: string[];

    /** Accounts, credentials, or user-related resources affected */
    accounts?: string[];

    /** Infrastructure (servers, databases, services, etc.) affected */
    infra?: string[];
  };

  /**
   * Risk assessment for this proposal.
   */
  risk: {
    /** Impact level of this proposal */
    impact: "low" | "medium" | "high";

    /** Plain-English explanation of the risk */
    explanation: string;

    /** Can this proposal be rolled back if it fails? */
    rollbackAvailable: boolean;
  };

  /**
   * AI recommendation based on reasoning.
   * "proceed": Safe to execute
   * "caution": Proceed but with monitoring
   * "do_not_proceed": Strong recommendation against execution
   */
  recommendation: "proceed" | "caution" | "do_not_proceed";

  /**
   * Current status.
   * In Phase 1, proposals are ALWAYS awaiting approval.
   */
  status: "AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "EXECUTED" | "FAILED" | "ROLLED_BACK";

  /**
   * Timestamp when proposal was created (milliseconds since epoch).
   */
  createdAt: number;

  /**
   * Optional: ID of the human who approved/rejected this proposal.
   */
  approvedBy?: string;

  /**
   * Optional: Timestamp of approval/rejection.
   */
  approvalTimestamp?: number;

  /**
   * Optional: Human's notes on approval/rejection.
   */
  approvalNotes?: string;

  /**
   * Optional: Execution timestamp if proposal was executed.
   */
  executedAt?: number;

  /**
   * Optional: Execution result/error details.
   */
  executionResult?: {
    success: boolean;
    message: string;
    rollbackAvailable: boolean;
  };
}

/**
 * Request to synthesize a proposal.
 * The autonomous partner receives this and generates a Proposal.
 */
export interface ProposalRequest {
  /** The human's intent or system trigger */
  intent: string;

  /** Optional context to help the AI understand the intent better */
  context?: Record<string, any>;

  /** Optional: constraints the AI must respect */
  constraints?: string[];

  /** Optional: deadline for this proposal */
  deadline?: number;
}

/**
 * Type for reasoning artifacts from individual roles.
 * Used internally during proposal synthesis.
 */
export interface ReasoningArtifact {
  role: "planner" | "operator" | "critic" | "tap_guardian" | "user_advocate";
  reasoning: string;
  proposedActionSteps?: string[];
  riskFactors?: string[];
  recommendations?: string[];
}
