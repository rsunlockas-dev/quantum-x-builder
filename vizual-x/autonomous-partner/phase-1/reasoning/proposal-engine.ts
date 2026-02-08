/**
 * PROPOSAL ENGINE
 * 
 * Pure reasoning pipeline that synthesizes a canonical Proposal.
 * 
 * PHASE 1: PREPARATION ONLY
 * - NO execution logic
 * - NO side effects
 * - NO auto-approval
 * - Only generates Proposal objects for human approval
 */

import { v4 as uuidv4 } from "uuid";
import { Proposal, ProposalRequest, ReasoningArtifact } from "../types/proposal";
import { planActions } from "./roles/planner";
import { assessFeasibility } from "./roles/operator";
import { critique } from "./roles/critic";
import { validateGovernance } from "./roles/tap-guardian";
import { advocateForUser } from "./roles/user-advocate";

export interface ProposalEngineOutput {
  proposal: Proposal;
  reasoning: {
    artifacts: ReasoningArtifact[];
    deliberation: string;
  };
}

/**
 * Core proposal synthesis engine.
 * 
 * Takes a request and produces a canonical Proposal object.
 * All reasoning is pure and immutable.
 * No state is modified.
 * No external actions are taken.
 * 
 * @param request - The user's intent or system trigger
 * @returns A complete Proposal awaiting human approval
 */
export function synthesizeProposal(request: ProposalRequest): ProposalEngineOutput {
  const { intent, context, constraints = [], deadline } = request;

  // Timestamp proposal creation
  const createdAt = Date.now();
  const proposalId = `proposal-${uuidv4()}`;

  // ROLE 1: Planner breaks intent into actions
  const plannerOutput = planActions({ intent, context });

  // ROLE 2: Operator assesses feasibility
  const operatorOutput = assessFeasibility({
    actionSteps: plannerOutput.actionSteps,
    affectedResources: plannerOutput.affectedResources,
    context,
  });

  // ROLE 3: Critic identifies weaknesses
  const criticOutput = critique({
    intent,
    actionSteps: plannerOutput.actionSteps,
    context,
  });

  // Assess risk based on role inputs
  const riskAssessment = assessRisk(
    plannerOutput.actionSteps,
    operatorOutput.constraints,
    criticOutput.concerns,
    operatorOutput.feasible
  );

  // ROLE 4: TAP Guardian validates governance
  const tapOutput = validateGovernance({
    intent,
    actionSteps: plannerOutput.actionSteps,
    risk: riskAssessment,
    context,
  });

  // ROLE 5: User Advocate ensures user interests
  const userAdvocateOutput = advocateForUser({
    intent,
    summary: intent,
    actionSteps: plannerOutput.actionSteps,
    risk: riskAssessment,
    context,
  });

  // Synthesize recommendation
  const recommendation = synthesizeRecommendation(
    operatorOutput.feasible,
    riskAssessment.impact,
    criticOutput.concerns,
    userAdvocateOutput.shouldProceed,
    riskAssessment.rollbackAvailable
  );

  // Build canonical Proposal
  const proposal: Proposal = {
    id: proposalId,
    intent,
    summary: `${intent} (${plannerOutput.actionSteps.length} actions, ${riskAssessment.impact} risk)`,
    actions: plannerOutput.actionSteps,
    resources: plannerOutput.affectedResources,
    risk: riskAssessment,
    recommendation,
    status: "AWAITING_APPROVAL",
    createdAt,
  };

  // Collect all reasoning artifacts
  const artifacts = [
    plannerOutput.artifact,
    operatorOutput.artifact,
    criticOutput.artifact,
    tapOutput.artifact,
    userAdvocateOutput.artifact,
  ];

  // Build deliberation summary
  const deliberation = `
PROPOSAL SYNTHESIS COMPLETE

Proposal ID: ${proposalId}
Created: ${new Date(createdAt).toISOString()}

ROLE CONTRIBUTIONS:
1. Planner: ${plannerOutput.actionSteps.length} action steps identified
2. Operator: Feasible=${operatorOutput.feasible}, ${operatorOutput.constraints.length} constraints
3. Critic: ${criticOutput.concerns.length} concerns, ${criticOutput.alternatives.length} alternatives
4. TAP Guardian: Governance level=${tapOutput.governanceLevel}, Consent required=YES
5. User Advocate: Aligns with goals=${userAdvocateOutput.alignsWithUserGoals}

SYNTHESIZED RECOMMENDATION: ${recommendation}

ACTION REQUIRED:
Human approval is mandatory before any execution.
Review the proposal details and roles' reasoning.
Type YES to approve or NO to reject.
  `.trim();

  return {
    proposal,
    reasoning: {
      artifacts,
      deliberation,
    },
  };
}

/**
 * Assess risk based on action steps and constraints.
 */
function assessRisk(
  actionSteps: string[],
  operatorConstraints: string[],
  criticConcerns: string[],
  feasible: boolean
) {
  let impact: "low" | "medium" | "high" = "low";

  // Determine risk impact
  if (!feasible || actionSteps.length > 10 || criticConcerns.length > 3) {
    impact = "high";
  } else if (actionSteps.length > 5 || operatorConstraints.length > 2) {
    impact = "medium";
  }

  const explanation = buildRiskExplanation(
    actionSteps.length,
    operatorConstraints,
    criticConcerns
  );

  // Assume rollback available unless steps are infrastructure-level deletions
  const rollbackAvailable = !actionSteps.some(
    (s) => s.toLowerCase().includes("delete") && s.toLowerCase().includes("production")
  );

  return { impact, explanation, rollbackAvailable };
}

/**
 * Build human-readable risk explanation.
 */
function buildRiskExplanation(
  stepCount: number,
  constraints: string[],
  concerns: string[]
): string {
  const parts: string[] = [];

  if (stepCount > 5) {
    parts.push(`Multiple action steps (${stepCount})`);
  }
  if (constraints.length > 0) {
    parts.push(`Operational constraints: ${constraints.length}`);
  }
  if (concerns.length > 0) {
    parts.push(`Identified concerns: ${concerns.length}`);
  }

  return parts.length > 0
    ? parts.join(", ")
    : "Minimal operational risk identified";
}

/**
 * Synthesize final recommendation based on all inputs.
 */
function synthesizeRecommendation(
  feasible: boolean,
  impact: "low" | "medium" | "high",
  concerns: string[],
  userAdvocateApproves: boolean,
  rollbackAvailable: boolean
): "proceed" | "caution" | "do_not_proceed" {
  // Hard stop: not feasible + no rollback
  if (!feasible && !rollbackAvailable) {
    return "do_not_proceed";
  }

  // Caution: high impact or many concerns
  if (impact === "high" || concerns.length > 3 || !rollbackAvailable) {
    return "caution";
  }

  // Proceed: feasible, low/medium impact, user approves, rollback available
  if (feasible && userAdvocateApproves && rollbackAvailable) {
    return "proceed";
  }

  return "caution";
}
