/**
 * AUTONOMOUS PARTNER REASONING PIPELINE
 * Pure functions only. No execution logic. No side effects.
 */

import { HumanIntent, ReasoningState, Recommendation, RiskLevel } from "./types";

/**
 * PLANNER ROLE
 * Breaks intent into explicit action steps.
 * Output: list of planned actions
 */
export function plannerRole(intent: HumanIntent): string[] {
  const actionsByType: Record<string, string[]> = {
    account_operation: [
      "1. Analyze current account state",
      "2. Identify required changes",
      "3. Generate account modification steps",
      "4. Prepare rollback procedure",
    ],
    code_edit: [
      "1. Parse existing code",
      "2. Generate diffs",
      "3. Validate syntax",
      "4. Plan integration steps",
    ],
    workspace_action: [
      "1. Inspect workspace state",
      "2. Identify affected files",
      "3. Plan workspace modifications",
      "4. Prepare recovery steps",
    ],
    simulation: [
      "1. Define simulation parameters",
      "2. Execute simulation (sandbox only)",
      "3. Collect results",
      "4. Prepare analysis report",
    ],
    infrastructure_change: [
      "1. Audit current infrastructure",
      "2. Generate infrastructure changes",
      "3. Validate compatibility",
      "4. Plan deployment sequence",
    ],
    resource_allocation: [
      "1. Check resource availability",
      "2. Calculate required allocation",
      "3. Prepare allocation steps",
      "4. Plan deallocation if needed",
    ],
  };

  return actionsByType[intent.type] || ["Unable to plan for this intent type"];
}

/**
 * OPERATOR ROLE
 * Identifies affected resources.
 * Output: structured resource list
 */
export function operatorRole(intent: HumanIntent): Record<string, string[]> {
  const payload = intent.payload || {};

  return {
    repos: payload.repos || [],
    files: payload.files || [],
    accounts: payload.accounts || [],
    infra: payload.infra || [],
  };
}

/**
 * CRITIC ROLE
 * Assesses risk and rollback availability.
 * Output: risk assessment
 */
export function criticRole(
  intent: HumanIntent,
  actions: string[]
): { level: RiskLevel; explanation: string; rollbackPossible: boolean } {
  // Simple heuristic: more actions = higher risk
  let riskLevel: RiskLevel = "low";
  let rollbackPossible = true;

  if (intent.type === "infrastructure_change") {
    riskLevel = "high";
    rollbackPossible = false; // Assume infrastructure changes are irreversible without explicit mitigation
  } else if (intent.type === "account_operation") {
    riskLevel = "medium";
    rollbackPossible = true;
  } else if (actions.length > 5) {
    riskLevel = "medium";
  }

  const explanation = `Intent type: ${intent.type}. Actions: ${actions.length}. Type-based risk assessment applied.`;

  return {
    level: riskLevel,
    explanation,
    rollbackPossible,
  };
}

/**
 * TAP GUARDIAN ROLE
 * Enforces TAP governance model (Consent + Recovery).
 * Output: TAP-compliant recommendation
 */
export function tapGuardianRole(
  riskLevel: RiskLevel,
  rollbackPossible: boolean
): Recommendation {
  // TAP Guardian enforces: high-impact actions need explicit consent
  // Irreversible actions without rollback = caution or do_not_proceed

  if (riskLevel === "high" && !rollbackPossible) {
    return "do_not_proceed"; // High risk + no rollback = stop
  }
  if (riskLevel === "high") {
    return "caution"; // High risk but reversible = caution
  }
  if (riskLevel === "medium") {
    return "proceed"; // Medium risk = OK with consent
  }
  return "proceed"; // Low risk = OK
}

/**
 * USER ADVOCATE ROLE
 * Recommends based on user benefit.
 * Output: user-benefit recommendation
 */
export function userAdvocateRole(
  intent: HumanIntent,
  riskLevel: RiskLevel
): Recommendation {
  // User advocate balances benefit vs. risk
  // If intent is beneficial and risk is manageable, advocate for proceeding

  if (riskLevel === "high") {
    return "caution"; // High risk requires explicit user awareness
  }
  if (intent.context?.userBenefit === false) {
    return "do_not_proceed"; // If user doesn't benefit, don't proceed
  }
  return "proceed"; // Otherwise advocate for proceeding
}

/**
 * SYNTHESIZE RECOMMENDATIONS
 * Collect all role recommendations into a consensus.
 * Output: final recommendation
 */
export function synthesizeRecommendation(recommendations: Record<string, Recommendation>): Recommendation {
  // Decision logic:
  // - If ANY role says "do_not_proceed", output "do_not_proceed"
  // - Else if ANY role says "caution", output "caution"
  // - Else output "proceed"

  const values = Object.values(recommendations);

  if (values.includes("do_not_proceed")) {
    return "do_not_proceed";
  }
  if (values.includes("caution")) {
    return "caution";
  }
  return "proceed";
}

/**
 * FULL REASONING PIPELINE
 * Orchestrates all reasoning roles.
 * Output: complete reasoning state (for proposal synthesis)
 */
export function runReasoningPipeline(intent: HumanIntent): ReasoningState {
  // Step 1: Planner generates actions
  const plannedActions = plannerRole(intent);

  // Step 2: Operator identifies resources
  const identifiedResources = operatorRole(intent);

  // Step 3: Critic assesses risk
  const riskAssessment = criticRole(intent, plannedActions);

  // Step 4: All roles recommend
  const recommendations = {
    planner: riskAssessment.level === "low" ? "proceed" : "caution",
    operator: "proceed", // Operator always neutral
    critic: riskAssessment.level === "high" ? "caution" : "proceed",
    tapGuardian: tapGuardianRole(riskAssessment.level, riskAssessment.rollbackPossible),
    userAdvocate: userAdvocateRole(intent, riskAssessment.level),
  };

  return {
    intent,
    plannedActions,
    identifiedResources,
    riskAssessment,
    recommendations,
  };
}
