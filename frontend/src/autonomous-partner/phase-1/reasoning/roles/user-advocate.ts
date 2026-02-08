/**
 * USER ADVOCATE ROLE
 * 
 * Pure function that ensures user interests are prioritized.
 * Questions whether proposed action truly serves user goals.
 * Contributes to proposal synthesis.
 * Does NOT execute.
 * Does NOT modify state.
 */

import { ReasoningArtifact } from "../../types/proposal";

export interface UserAdvocateInput {
  intent: string;
  summary: string;
  actionSteps: string[];
  risk: {
    impact: "low" | "medium" | "high";
    explanation: string;
    rollbackAvailable: boolean;
  };
  context?: Record<string, any>;
}

export interface UserAdvocateOutput {
  alignsWithUserGoals: boolean;
  userBenefits: string[];
  userRisks: string[];
  userCosts: string[];
  shouldProceed: boolean;
  artifact: ReasoningArtifact;
}

/**
 * User Advocate evaluates if proposal serves user interests.
 * 
 * @param input - Proposal details
 * @returns User-centric analysis
 */
export function advocateForUser(input: UserAdvocateInput): UserAdvocateOutput {
  const { intent, summary, actionSteps, risk, context = {} } = input;

  // Analyze user benefits
  const userBenefits: string[] = [];
  const userRisks: string[] = [];
  const userCosts: string[] = [];

  // Default benefits from any legitimate action
  userBenefits.push("Moves system toward stated intent");

  // Risk analysis
  if (risk.impact === "high") {
    userRisks.push(`High-impact operation: ${risk.explanation}`);
  }
  if (!risk.rollbackAvailable) {
    userRisks.push("No rollback available - failure is permanent");
    userCosts.push("High recovery cost if something goes wrong");
  }

  const userCostsValue = actionSteps.length <= 2 ? "minimal" : "moderate";
  userCosts.push(`Estimated execution cost: ${userCostsValue}`);

  const alignsWithUserGoals = userBenefits.length > userRisks.length;
  const shouldProceed = alignsWithUserGoals && risk.rollbackAvailable !== false;

  const reasoning = `
User Advocate analysis:
- Intent: ${intent}
- Aligns with user goals: ${alignsWithUserGoals ? "YES" : "NO"}
- User benefits: ${userBenefits.join("; ") || "unclear"}
- User risks: ${userRisks.join("; ") || "minimal"}
- User costs: ${userCosts.join("; ") || "minimal"}

Recommendation for user:
${shouldProceed ? "SAFE to proceed - benefits outweigh risks" : "CAUTION - consider alternatives"}
  `.trim();

  return {
    alignsWithUserGoals,
    userBenefits,
    userRisks,
    userCosts,
    shouldProceed,
    artifact: {
      role: "user_advocate",
      reasoning,
    },
  };
}
