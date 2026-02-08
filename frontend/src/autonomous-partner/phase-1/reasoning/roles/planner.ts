/**
 * PLANNER ROLE
 * 
 * Pure function that analyzes intent and breaks it into action steps.
 * Contributes to proposal synthesis.
 * Does NOT execute.
 * Does NOT modify state.
 */

import { ReasoningArtifact } from "../../types/proposal";

export interface PlannerInput {
  intent: string;
  context?: Record<string, any>;
}

export interface PlannerOutput {
  actionSteps: string[];
  affectedResources: {
    repos?: string[];
    files?: string[];
    accounts?: string[];
    infra?: string[];
  };
  sequenceWarnings?: string[];
  artifact: ReasoningArtifact;
}

/**
 * Planner breaks down intent into explicit action steps.
 * 
 * @param input - The intent and context
 * @returns Structured action steps and resources
 */
export function planActions(input: PlannerInput): PlannerOutput {
  const { intent, context = {} } = input;

  // Parse intent and extract key subjects
  const intents = parseIntent(intent);

  // Break into explicit action steps
  const actionSteps: string[] = [];
  const affectedResources = {
    repos: [] as string[],
    files: [] as string[],
    accounts: [] as string[],
    infra: [] as string[],
  };

  // Determine affected resources based on intent
  for (const intentPart of intents) {
    if (intentPart.includes("database") || intentPart.includes("db")) {
      affectedResources.infra!.push("database");
    }
    if (intentPart.includes("code") || intentPart.includes("repo")) {
      affectedResources.repos!.push("primary-repo");
    }
    if (intentPart.includes("file")) {
      affectedResources.files!.push("(to-be-determined)");
    }
  }

  // Generate sequential steps
  actionSteps.push(`Analyze request: "${intent}"`);
  actionSteps.push(`Identify affected systems: ${JSON.stringify(affectedResources)}`);
  actionSteps.push(`Prepare detailed action plan`);

  const reasoning = `
Planner analysis:
- Intent: ${intent}
- Key subjects identified: ${intents.join(", ")}
- Affected resources: ${JSON.stringify(affectedResources)}
- Action sequence: ${actionSteps.length} steps identified
  `.trim();

  return {
    actionSteps,
    affectedResources,
    sequenceWarnings: [],
    artifact: {
      role: "planner",
      reasoning,
      proposedActionSteps: actionSteps,
    },
  };
}

/**
 * Parse intent into component parts.
 */
function parseIntent(intent: string): string[] {
  // Simple tokenization - can be enhanced
  return intent
    .toLowerCase()
    .split(/[,;.]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
