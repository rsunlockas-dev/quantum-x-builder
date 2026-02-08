# VIZUAL-X Autonomous Partner - Phase 1: Governance & Consent

## Status: PREPARATION ONLY

This is the core foundation of the Autonomous Partner system. It provides:

1. **Canonical Proposal Schema** - The consent contract
2. **Reasoning-Only Pipeline** - Pure functions, no execution
3. **Confirmation Prompt Renderer** - Locked format, human-facing
4. **Role-Based Synthesis** - Five specialized reasoning roles

## Architecture

### Proposal Schema (`types/proposal.ts`)

```typescript
interface Proposal {
  id: string
  intent: string
  summary: string
  actions: string[]              // Explicit action steps
  diffs?: string[]              // Code/config changes
  resources: {                  // Affected systems
    repos?: string[]
    files?: string[]
    accounts?: string[]
    infra?: string[]
  }
  risk: {
    impact: "low" | "medium" | "high"
    explanation: string
    rollbackAvailable: boolean
  }
  recommendation: "proceed" | "caution" | "do_not_proceed"
  status: "AWAITING_APPROVAL"    // Always awaiting approval in Phase 1
  createdAt: number
}
```

### Reasoning Roles

1. **Planner** (`roles/planner.ts`)
   - Breaks intent into explicit action steps
   - Identifies affected resources
   - Emits sequential warnings

2. **Operator** (`roles/operator.ts`)
   - Assesses operational feasibility
   - Lists dependencies
   - Enforces constraints

3. **Critic** (`roles/critic.ts`)
   - Identifies weaknesses
   - Suggests alternatives
   - Questions assumptions

4. **TAP Guardian** (`roles/tap-guardian.ts`)
   - Validates governance requirements
   - Ensures consent is documented
   - Sets audit trail requirements

5. **User Advocate** (`roles/user-advocate.ts`)
   - Ensures user interests are prioritized
   - Identifies benefits and costs
   - Recommends user-centric path

### Proposal Engine (`reasoning/proposal-engine.ts`)

Pure function that:
1. Invokes all 5 roles in parallel
2. Synthesizes their outputs
3. Generates exactly ONE Proposal
4. Returns reasoning artifacts

```typescript
synthesizeProposal(request: ProposalRequest): ProposalEngineOutput
```

### Confirmation Prompt Renderer (`confirmation/prompt-renderer.ts`)

Locked format for human approval:

```
------------------------------------
INTENT:
I propose to: <intent>

ACTIONS:
1. <action one>
2. <action two>

AFFECTED RESOURCES:
- Repos: [...]
- Files: [...]
- Accounts: [...]
- Infra: [...]

RISK:
Impact: <low | medium | high>
Rollback: <available | not available>

Do you approve this action?
Type: YES or NO
------------------------------------
```

## Usage

```typescript
import { createProposal, renderConfirmationPrompt, parseApprovalResponse } from "./phase-1";

// Step 1: Create proposal from intent
const { proposal, reasoning } = createProposal({
  intent: "Deploy new feature to production",
});

// Step 2: Render confirmation prompt
const prompt = renderConfirmationPrompt(proposal);
console.log(prompt);

// Step 3: Wait for user approval
// (User reads prompt and types YES or NO)

// Step 4: Parse approval
const approved = parseApprovalResponse(userInput);
if (approved) {
  // Phase 2: Execute (not implemented in Phase 1)
} else {
  // Proposal rejected
}
```

## Key Constraints (Non-Negotiable)

- ✅ PREPARATION ONLY - No execution logic
- ✅ NO UI - Just data structures and text rendering
- ✅ NO auto-approval - Humans always decide
- ✅ NO side effects - Pure functions
- ✅ NO Express middleware - Stateless
- ✅ NO external API calls with side effects

## Next Steps

Phase 2 (when approved):
- Express API layer
- Approval workflow
- Execution pipelines
- Rollback mechanisms

Phase 3 (when Phase 2 complete):
- Web UI for proposal review
- Analytics dashboard
- Integration with external systems

---

**PHASE 1 LOCKED**: Ready for review. Awaiting explicit instruction to proceed to Phase 2.
