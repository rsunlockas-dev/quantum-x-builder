/**
 * CRITIC ROLE
 * 
 * Pure function that identifies weaknesses and alternative approaches.
 * Devil's advocate function.
 * Contributes to proposal synthesis.
 * Does NOT execute.
 * Does NOT modify state.
 */

import { ReasoningArtifact } from "../../types/proposal";

export interface CriticInput {
  intent: string;
  actionSteps: string[];
  context?: Record<string, any>;
}

export interface CriticOutput {
  concerns: string[];
  alternatives: string[];
  assumptions: string[];
  questionable_steps: number[];
  artifact: ReasoningArtifact;
}

/**
 * Critic identifies weaknesses and questions in the proposal.
 * 
 * @param input - Intent and proposed action steps
 * @returns Concerns, alternatives, and questionable assumptions
 */
export function critique(input: CriticInput): CriticOutput {
  const { intent, actionSteps, context = {} } = input;

  const concerns: string[] = [];
  const alternatives: string[] = [];
  const assumptions: string[] = [];
  const questionable_steps: number[] = [];

  // Generic concerns
  concerns.push("No rollback strategy explicitly stated");
  concerns.push("Success criteria not defined in proposal");

  // Analyze for risky assumptions
  assumptions.push("Assumes existing infrastructure is stable");
  assumptions.push("Assumes all dependencies are available");

  // Alternative approaches
  alternatives.push("Execute in stages (phased approach)");
  alternatives.push("Create test environment first, then replicate to production");
  alternatives.push("Schedule during maintenance window");

  // Identify questionable steps (by index)
  if (actionSteps.length > 5) {
    questionable_steps.push(actionSteps.length - 1); // Last step if many
  }

  const reasoning = `
Critic analysis:
- Identified concerns: ${concerns.length}
- Suggested alternatives: ${alternatives.length}
- Unvalidated assumptions: ${assumptions.length}
- Questionable steps: ${questionable_steps.length > 0 ? questionable_steps.join(", ") : "none"}

Recommendation: Review assumptions and consider alternatives before approval.
  `.trim();

  return {
    concerns,
    alternatives,
    assumptions,
    questionable_steps,
    artifact: {
      role: "critic",
      reasoning,
      recommendations: alternatives,
    },
  };
}
