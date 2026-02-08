/**
 * CANONICAL PROPOSAL SCHEMA
 * 
 * This is the single source of truth for consent.
 * NO execution paths belong here.
 * NO auto-approval.
 * NO side effects.
 */

export interface Proposal {
  /**
   * Unique identifier for this proposal
   */
  id: string;

  /**
   * One-sentence human intent this proposal addresses
   * Example: "I propose to add TypeScript support to the project"
   */
  intent: string;

  /**
   * Short summary of the proposal (1-2 sentences)
   */
  summary: string;

  /**
   * Explicit list of steps the AI wants to take
   * Each step should be atomic and observable
   */
  actions: string[];

  /**
   * Optional: Code/config diffs this proposal would apply
   * These are DESCRIPTIONS, not executable patches
   */
  diffs?: string[];

  /**
   * Resources affected by this proposal
   * ALWAYS be explicit about what's at stake
   */
  resources: {
    repos?: string[];      // GitHub repos, local repos
    files?: string[];      // File paths that will be modified
    accounts?: string[];   // Services, credentials, accounts
    infra?: string[];      // Infrastructure, deployments, systems
  };

  /**
   * Risk assessment for this proposal
   * REQUIRED: explicitly state risk level and rollback availability
   */
  risk: {
    impact: "low" | "medium" | "high";
    explanation: string;   // Why is this the risk level?
    rollbackAvailable: boolean;  // Can we undo this?
  };

  /**
   * AI's recommendation for human decision-maker
   * This is ADVISORY ONLY
   */
  recommendation: "proceed" | "caution" | "do_not_proceed";

  /**
   * Status of this proposal
   * Phase 1: Always "AWAITING_APPROVAL"
   */
  status: "AWAITING_APPROVAL";

  /**
   * ISO timestamp when proposal was created
   */
  createdAt: number;
}

/**
 * Validation helper
 * Ensures proposal conforms to schema
 */
export function isValidProposal(obj: unknown): obj is Proposal {
  if (!obj || typeof obj !== "object") return false;

  const p = obj as Record<string, unknown>;

  // Required fields
  if (typeof p.id !== "string") return false;
  if (typeof p.intent !== "string") return false;
  if (typeof p.summary !== "string") return false;

  // Actions must be array of strings
  if (!Array.isArray(p.actions) || !p.actions.every(a => typeof a === "string")) {
    return false;
  }

  // Resources must have correct structure
  if (!p.resources || typeof p.resources !== "object") return false;
  const res = p.resources as Record<string, unknown>;
  if (res.repos && !Array.isArray(res.repos)) return false;
  if (res.files && !Array.isArray(res.files)) return false;
  if (res.accounts && !Array.isArray(res.accounts)) return false;
  if (res.infra && !Array.isArray(res.infra)) return false;

  // Risk must be valid
  if (!p.risk || typeof p.risk !== "object") return false;
  const risk = p.risk as Record<string, unknown>;
  if (!["low", "medium", "high"].includes(risk.impact as string)) return false;
  if (typeof risk.explanation !== "string") return false;
  if (typeof risk.rollbackAvailable !== "boolean") return false;

  // Recommendation must be valid
  if (!["proceed", "caution", "do_not_proceed"].includes(p.recommendation as string)) {
    return false;
  }

  // Status must be AWAITING_APPROVAL in Phase 1
  if (p.status !== "AWAITING_APPROVAL") return false;

  // Timestamp must be number
  if (typeof p.createdAt !== "number") return false;

  return true;
}
