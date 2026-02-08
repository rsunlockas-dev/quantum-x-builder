/**
 * CONFIRMATION PROMPT RENDERER
 * 
 * Renders a proposal in the EXACT locked format.
 * NO variation. NO paraphrasing.
 * This enforces behavioral discipline.
 * 
 * Output is human-facing and is the ONLY UI component in Phase 1.
 */

import { Proposal } from "../types/proposal";

/**
 * Render a proposal as the canonical confirmation prompt.
 * 
 * Format is LOCKED and MUST NOT be modified.
 * 
 * @param proposal - The Proposal to render
 * @returns Formatted confirmation prompt string
 */
export function renderConfirmationPrompt(proposal: Proposal): string {
  const separator = "-".repeat(36);

  // Build INTENT section
  const intentSection = `INTENT:
I propose to: ${proposal.intent}`;

  // Build ACTIONS section
  const actionsSection = `ACTIONS:
${proposal.actions.map((action, i) => `${i + 1}. ${action}`).join("\n")}`;

  // Build AFFECTED RESOURCES section
  const resourceItems: string[] = [];
  if (proposal.resources.repos && proposal.resources.repos.length > 0) {
    resourceItems.push(`- Repos: ${proposal.resources.repos.join(", ")}`);
  }
  if (proposal.resources.files && proposal.resources.files.length > 0) {
    resourceItems.push(`- Files: ${proposal.resources.files.join(", ")}`);
  }
  if (proposal.resources.accounts && proposal.resources.accounts.length > 0) {
    resourceItems.push(`- Accounts: ${proposal.resources.accounts.join(", ")}`);
  }
  if (proposal.resources.infra && proposal.resources.infra.length > 0) {
    resourceItems.push(`- Infra: ${proposal.resources.infra.join(", ")}`);
  }

  const affectedResourcesSection = `AFFECTED RESOURCES:
${resourceItems.length > 0 ? resourceItems.join("\n") : "[None specified]"}`;

  // Build RISK section
  const riskSection = `RISK:
Impact: ${proposal.risk.impact.toUpperCase()}
Rollback: ${proposal.risk.rollbackAvailable ? "available" : "not available"}`;

  // Build approval section
  const approvalSection = `
Do you approve this action?
Type: YES or NO`;

  // Assemble full prompt
  const prompt = `
${separator}
${intentSection}

${actionsSection}

${affectedResourcesSection}

${riskSection}
${approvalSection}
${separator}
`;

  return prompt.trim();
}

/**
 * Render detailed proposal view (extended information).
 * Used for debugging/review, not for the primary approval flow.
 * 
 * @param proposal - The Proposal to render
 * @returns Detailed proposal view
 */
export function renderDetailedProposalView(proposal: Proposal): string {
  const sections: string[] = [];

  sections.push(`PROPOSAL: ${proposal.id}`);
  sections.push(`Status: ${proposal.status}`);
  sections.push(`Created: ${new Date(proposal.createdAt).toISOString()}`);
  sections.push("");

  sections.push(`INTENT: ${proposal.intent}`);
  sections.push(`SUMMARY: ${proposal.summary}`);
  sections.push("");

  sections.push(`ACTIONS (${proposal.actions.length}):`);
  proposal.actions.forEach((action, i) => {
    sections.push(`  ${i + 1}. ${action}`);
  });
  sections.push("");

  sections.push(`RESOURCES:`);
  sections.push(`  Repos: ${proposal.resources.repos?.join(", ") || "none"}`);
  sections.push(`  Files: ${proposal.resources.files?.join(", ") || "none"}`);
  sections.push(`  Accounts: ${proposal.resources.accounts?.join(", ") || "none"}`);
  sections.push(`  Infra: ${proposal.resources.infra?.join(", ") || "none"}`);
  sections.push("");

  sections.push(`RISK ASSESSMENT:`);
  sections.push(`  Impact: ${proposal.risk.impact}`);
  sections.push(`  Explanation: ${proposal.risk.explanation}`);
  sections.push(`  Rollback Available: ${proposal.risk.rollbackAvailable}`);
  sections.push("");

  sections.push(`RECOMMENDATION: ${proposal.recommendation.toUpperCase()}`);
  sections.push("");

  if (proposal.approvedBy) {
    sections.push(`APPROVAL:`);
    sections.push(`  Approved By: ${proposal.approvedBy}`);
    sections.push(`  Timestamp: ${new Date(proposal.approvalTimestamp || 0).toISOString()}`);
    if (proposal.approvalNotes) {
      sections.push(`  Notes: ${proposal.approvalNotes}`);
    }
    sections.push("");
  }

  if (proposal.executionResult) {
    sections.push(`EXECUTION RESULT:`);
    sections.push(`  Success: ${proposal.executionResult.success}`);
    sections.push(`  Message: ${proposal.executionResult.message}`);
    sections.push(`  Rollback Available: ${proposal.executionResult.rollbackAvailable}`);
  }

  return sections.join("\n");
}

/**
 * Parse user approval response.
 * 
 * @param userInput - User's response to confirmation prompt
 * @returns true if user typed "YES", false otherwise
 */
export function parseApprovalResponse(userInput: string): boolean {
  return userInput.trim().toUpperCase() === "YES";
}
