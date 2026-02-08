# PHASE 1: AUTONOMOUS PARTNER PROPOSAL ENGINE

**Status**: PREPARATION ONLY  
**Mode**: GOVERNANCE + CONSENT CONTRACT  
**Execution**: DISABLED  

---

## Overview

This is **not a chatbot**. This is an **AUTONOMOUS OPERATOR** that:

1. **PREPARES** actions (reasoning only)
2. **ASKS** for explicit consent (confirmation prompt)
3. **WAITS** for human approval (strict YES/NO)
4. (Phase 2+) **EXECUTES** after approval

---

## Core Components

### 1. Proposal Schema (`01-proposal-schema.ts`)

**Canonical interface** (non-negotiable):

```typescript
interface Proposal {
  id: string
  intent: string
  summary: string
  actions: string[]          // explicit steps
  diffs?: string[]           // optional code changes
  resources: {
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
  status: "AWAITING_APPROVAL"
  createdAt: number
}
```

**No execution logic here.** This object is the **single source of truth for consent**.

### 2. Reasoning Pipeline (`02-reasoning-pipeline.ts`)

**Pure functions** that synthesize Proposal content:

- **Planner**: Breaks intent into explicit ACTION STEPS
- **Operator**: Identifies affected RESOURCES and constraints
- **Critic**: Assesses RISK and rollback availability
- **TAP Guardian**: Ensures transparency, accountability, permission
- **User Advocate**: Ensures human AGENCY is preserved

**Master flow**: `masterReasoningFlow(intent)` → returns complete Proposal

### 3. Confirmation Renderer (`03-confirmation-renderer.ts`)

**Human-facing consent prompt** (locked format):

```
------------------------------------
INTENT:
I propose to: [one sentence]

ACTIONS:
1. [step one]
2. [step two]
3. [step three]

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

**Strict parsing**: Only `YES` or `NO` are valid.  
**Silence is NOT approval.**

---

## Governance Model

### PHASE 1 Rules (ABSOLUTE)

✅ **ALLOWED**:
- Proposal preparation
- Reasoning (pure functions)
- Confirmation prompt rendering
- User consent request

❌ **FORBIDDEN**:
- Execution of actions
- Side effects of any kind
- Auto-approval
- Express middleware
- UI components
- External API calls with consequences

### Consent Flow (Phase 1)

```
1. Human intent arrives
   ↓
2. Reasoning pipeline synthesizes Proposal
   ↓
3. TAP Guardian validates consent viability
   ↓
4. Confirmation renderer shows prompt
   ↓
5. HUMAN TYPES: YES or NO
   ↓
6. Response handler logs decision
   ↓
7. (If YES) → Await Phase 2 execution instruction
   (If NO) → Proposal archived, halt
```

---

## Current State (Phase 1)

### ✅ Implemented

- [x] Canonical Proposal schema
- [x] Reasoning pipeline (all 5 roles)
- [x] Confirmation prompt renderer
- [x] Consent response handler
- [x] Proposal validation

### ⏳ Stubs (Ready for Phase 2+)

The following are **placeholder implementations** for Phase 1:

- Planner action decomposition (basic keyword matching)
- Operator resource detection (empty defaults)
- Critic risk assessment (keyword-based)
- Predictive models (advisory only, not used in Phase 1)

These will be enhanced in Phase 2 when execution logic is introduced.

### ❌ NOT IMPLEMENTED (Blocked until Phase 2)

- Action execution
- File system modifications
- External API calls
- Rollback/recovery logic
- State management for execution
- Audit trail persistence (beyond logging)

---

## How to Use (Phase 1)

### 1. Create a Proposal

```typescript
import { masterReasoningFlow } from './02-reasoning-pipeline'

const intent = 'Add authentication to the backend API'
const proposal = masterReasoningFlow(intent)
```

### 2. Render Confirmation Prompt

```typescript
import { renderConfirmationPrompt } from './03-confirmation-renderer'

const prompt = renderConfirmationPrompt(proposal)
console.log(prompt)
```

### 3. Handle User Response

```typescript
import { handleConfirmationResponse } from './03-confirmation-renderer'

const userInput = 'YES' // or 'NO'
const result = handleConfirmationResponse(userInput)

if (result.approved) {
  console.log('✅ User approved. Await Phase 2 execution instruction.')
} else {
  console.log('❌ User declined.')
}
```

---

## Constraints & Boundaries

### HARD BOUNDARIES

1. **No execution** - This phase prepares only
2. **No side effects** - Pure functions only
3. **No auto-approval** - Humans always decide
4. **Strict consent** - Only `YES` or `NO`
5. **Silence = No** - Lack of response is rejection

### REASONING WITHOUT ACTING

The reasoning roles contribute to Proposal content, but they:
- Do NOT perform actions
- Do NOT access the file system
- Do NOT call external APIs
- Do NOT modify state
- Do NOT assume approval

Their job is to **synthesize** the best proposal for human review.

---

## Success Criteria (Phase 1)

✅ **Phase 1 is successful when**:

- Proposal schema is well-formed and validated
- Reasoning pipeline produces sensible Proposals
- Confirmation prompt is rendered exactly as specified
- User consent is captured strictly (YES/NO only)
- NO execution occurs without Phase 2 instruction
- All code is pure functions (no side effects)
- Audit trail captures Proposal + response

---

## Next Steps

Do NOT proceed to Phase 2 without explicit instruction.

When ready, Phase 2 will introduce:
- Action execution engine
- Rollback/recovery logic
- State persistence
- Audit trail database
- Automated action scheduling

---

## Files in This Directory

```
01-proposal-schema.ts       ← Canonical Proposal interface
02-reasoning-pipeline.ts    ← Reasoning roles (5 functions)
03-confirmation-renderer.ts ← Confirmation prompt (locked format)
README.md                   ← This file
CONSTRAINTS.md              ← Hard boundaries (detailed)
```

---

**PHASE 1 LOCKED: PREPARATION ONLY**

No execution. No side effects. No auto-approval.

Human consent is MANDATORY.
