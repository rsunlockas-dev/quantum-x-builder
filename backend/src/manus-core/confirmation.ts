/**
 * CONFIRMATION PROMPT RENDERER
 * Converts Proposal to human-facing confirmation prompt.
 *
 * LOCKED FORMAT (No variation, no paraphrasing)
 * Silence is NOT approval.
 */

import { Proposal } from "./types";

/**
 * Format resources for display
 */
function formatResources(resources: Proposal["resources"]): string {
  const lines: string[] = [];

  if (resources.repos && resources.repos.length > 0) {
    lines.push(`- Repos: ${resources.repos.join(", ")}`);
  }
  if (resources.files && resources.files.length > 0) {
    lines.push(`- Files: ${resources.files.join(", ")}`);
  }
  if (resources.accounts && resources.accounts.length > 0) {
    lines.push(`- Accounts: ${resources.accounts.join(", ")}`);
  }
  if (resources.infra && resources.infra.length > 0) {
    lines.push(`- Infra: ${resources.infra.join(", ")}`);
  }

  return lines.length > 0 ? lines.join("\n") : "- None identified";
}

/**
 * Format actions for display
 */
function formatActions(actions: string[]): string {
  return actions.map((action, idx) => `${idx + 1}. ${action}`).join("\n");
}

/**
 * CANONICAL CONFIRMATION PROMPT GENERATOR
 * Fixed format. No variation.
 *
 * This is NOT a suggestion. This is BEHAVIORAL DISCIPLINE.
 */
export function renderConfirmationPrompt(proposal: Proposal): string {
  const rollbackStatus = proposal.risk.rollbackAvailable ? "available" : "not available";

  const prompt = `
------------------------------------
INTENT:
I propose to: ${proposal.summary}

ACTIONS:
${formatActions(proposal.actions)}

AFFECTED RESOURCES:
${formatResources(proposal.resources)}

RISK:
Impact: ${proposal.risk.impact}
Explanation: ${proposal.risk.explanation}
Rollback: ${rollbackStatus}

Recommendation: ${proposal.recommendation}

Do you approve this action?
Type: YES or NO
------------------------------------
`;

  return prompt.trim();
}

/**
 * CONFIRMATION RESPONSE VALIDATOR
 * Checks if human response is explicit approval.
 *
 * RULE: Silence is NOT approval.
 * Only "YES" (case-insensitive) counts as approval.
 */
export function parseConfirmationResponse(response: string): boolean {
  const normalized = response.trim().toUpperCase();
  return normalized === "YES";
}

/**
 * HUMAN INTERACTION HANDLER (Stateless)
 * Accepts human response and determines next action.
 *
 * Returns:
 * - "APPROVED" if human said YES
 * - "REJECTED" if human said NO or anything else
 * - "INVALID" if response is empty/unclear
 */
export function handleConfirmationResponse(
  response: string
): "APPROVED" | "REJECTED" | "INVALID" {
  if (!response || response.trim().length === 0) {
    return "INVALID"; // Silence is NOT approval
  }

  if (parseConfirmationResponse(response)) {
    return "APPROVED";
  }

  return "REJECTED";
}
