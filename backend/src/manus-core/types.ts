/**
 * MANUS-CORE TYPE DEFINITIONS
 * Canonical Proposal Schema (Non-Negotiable)
 * This is the single source of truth for consent contracts.
 */

export type IntentType =
  | "account_operation"
  | "code_edit"
  | "workspace_action"
  | "simulation"
  | "infrastructure_change"
  | "resource_allocation";

export type RiskLevel = "low" | "medium" | "high";
export type Recommendation = "proceed" | "caution" | "do_not_proceed";
export type ProposalStatus = "AWAITING_APPROVAL" | "APPROVED" | "REJECTED";

/**
 * PROPOSAL INTERFACE (IMMUTABLE)
 * This is the consent contract between AI and human.
 * DO NOT add execution logic here.
 * DO NOT modify this without explicit authorization.
 */
export interface Proposal {
  // Unique identifier
  id: string;

  // Human-understandable intent
  intent: string;
  summary: string;

  // Explicit action steps (what the AI wants to do)
  actions: string[];

  // Code/config diffs (if applicable)
  diffs?: string[];

  // Resources affected by this proposal
  resources: {
    repos?: string[];
    files?: string[];
    accounts?: string[];
    infra?: string[];
  };

  // Risk assessment
  risk: {
    impact: RiskLevel;
    explanation: string;
    rollbackAvailable: boolean;
  };

  // AI recommendation based on reasoning
  recommendation: Recommendation;

  // Status (always AWAITING_APPROVAL initially)
  status: ProposalStatus;

  // Timestamp of creation
  createdAt: number;

  // Optional: execution record (filled AFTER approval)
  executionRecord?: {
    approvedBy: string;
    executedAt: number;
    affectedResourcesPost?: string[];
    rollbackId?: string;
  };
}

/**
 * HUMAN INTENT (Input to reasoning engine)
 * This is what humans or systems ask the AI to do.
 */
export interface HumanIntent {
  userId: string;
  type: IntentType;
  description: string;
  context?: Record<string, any>;
  payload?: Record<string, any>;
}

/**
 * REASONING STATE (Internal)
 * Used during proposal synthesis.
 * Never exposed to execution paths.
 */
export interface ReasoningState {
  intent: HumanIntent;
  plannedActions: string[];
  identifiedResources: Proposal["resources"];
  riskAssessment: {
    level: RiskLevel;
    explanation: string;
    rollbackPossible: boolean;
  };
  recommendations: {
    planner: Recommendation;
    operator: Recommendation;
    critic: Recommendation;
    tapGuardian: Recommendation;
    userAdvocate: Recommendation;
  };
}
