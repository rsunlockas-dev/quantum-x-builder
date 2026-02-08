/**
 * TAP GUARDIAN ROLE
 * 
 * TAP = Transparent Autonomous Partnership
 * 
 * Pure function that ensures governance and consent integrity.
 * Validates that the proposal follows consent principles.
 * Contributes to proposal synthesis.
 * Does NOT execute.
 * Does NOT modify state.
 */

import { ReasoningArtifact } from "../../types/proposal";

export interface TAPGuardianInput {
  intent: string;
  actionSteps: string[];
  risk: {
    impact: "low" | "medium" | "high";
    explanation: string;
    rollbackAvailable: boolean;
  };
  context?: Record<string, any>;
}

export interface TAPGuardianOutput {
  consentRequired: boolean;
  governanceLevel: "minimal" | "standard" | "strict";
  notificationRequired: boolean;
  auditTrailRequired: boolean;
  artifact: ReasoningArtifact;
}

/**
 * TAP Guardian validates governance and consent requirements.
 * 
 * @param input - Proposal details
 * @returns Governance requirements
 */
export function validateGovernance(input: TAPGuardianInput): TAPGuardianOutput {
  const { intent, actionSteps, risk, context = {} } = input;

  // Consent is ALWAYS required
  const consentRequired = true;

  // Determine governance level based on impact
  let governanceLevel: "minimal" | "standard" | "strict" = "standard";
  if (risk.impact === "high") {
    governanceLevel = "strict";
  } else if (risk.impact === "low") {
    governanceLevel = "minimal";
  }

  // Notification required for medium/high impact
  const notificationRequired = risk.impact !== "low";

  // Audit trail required for all non-trivial operations
  const auditTrailRequired = actionSteps.length > 1 || risk.impact !== "low";

  const reasoning = `
TAP Guardian validation:
- Consent required: YES (always)
- Governance level: ${governanceLevel.toUpperCase()}
- Risk impact: ${risk.impact}
- Rollback available: ${risk.impact}
- Notifications: ${notificationRequired ? "YES" : "NO"}
- Audit trail: ${auditTrailRequired ? "YES" : "NO"}

The following consent requirements must be met:
1. Human must explicitly approve this proposal
2. Approval must be documented in audit trail
3. Human must understand all action steps
4. Human must accept the stated risks
  `.trim();

  return {
    consentRequired,
    governanceLevel,
    notificationRequired,
    auditTrailRequired,
    artifact: {
      role: "tap_guardian",
      reasoning,
    },
  };
}
