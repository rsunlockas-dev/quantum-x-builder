/**
 * OPERATOR ROLE
 * 
 * Pure function that assesses operational feasibility.
 * Considers infrastructure, dependencies, and execution context.
 * Contributes to proposal synthesis.
 * Does NOT execute.
 * Does NOT modify state.
 */

import { ReasoningArtifact } from "../../types/proposal";

export interface OperatorInput {
  actionSteps: string[];
  affectedResources: {
    repos?: string[];
    files?: string[];
    accounts?: string[];
    infra?: string[];
  };
  context?: Record<string, any>;
}

export interface OperatorOutput {
  feasible: boolean;
  dependencies: string[];
  constraints: string[];
  estimatedDuration?: string;
  artifact: ReasoningArtifact;
}

/**
 * Operator assesses feasibility of action steps.
 * 
 * @param input - Action steps and affected resources
 * @returns Feasibility assessment and constraints
 */
export function assessFeasibility(input: OperatorInput): OperatorOutput {
  const { actionSteps, affectedResources, context = {} } = input;

  const dependencies: string[] = [];
  const constraints: string[] = [];

  // Assess resource dependencies
  if (affectedResources.repos && affectedResources.repos.length > 0) {
    dependencies.push("Git repository access");
    constraints.push("Must maintain commit history integrity");
  }

  if (affectedResources.infra && affectedResources.infra.length > 0) {
    dependencies.push("Infrastructure access");
    constraints.push("Must have rollback capability");
    constraints.push("Should not execute during peak hours (if applicable)");
  }

  if (affectedResources.accounts && affectedResources.accounts.length > 0) {
    dependencies.push("Account/credential management");
    constraints.push("Must audit all account changes");
  }

  // Check for operational red flags
  const feasible = actionSteps.length > 0 && actionSteps.length < 20;

  const reasoning = `
Operator assessment:
- Steps to execute: ${actionSteps.length}
- Feasible: ${feasible}
- Key dependencies: ${dependencies.join(", ") || "none"}
- Operational constraints: ${constraints.length > 0 ? constraints.join("; ") : "none"}
- Status: ${feasible ? "All systems check out" : "Feasibility concerns detected"}
  `.trim();

  return {
    feasible,
    dependencies,
    constraints,
    estimatedDuration: feasible ? "< 15 minutes" : "unknown",
    artifact: {
      role: "operator",
      reasoning,
    },
  };
}
