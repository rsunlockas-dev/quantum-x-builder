# PHASE 1 HARD CONSTRAINTS

**These are absolute. Do not circumvent.**

---

## EXECUTION DISABLED

```
❌ NO file system operations
❌ NO network calls (except logging)
❌ NO state mutations
❌ NO side effects of any kind
❌ NO Express middleware
❌ NO UI rendering
❌ NO subprocess spawning
❌ NO database queries
❌ NO environment variable changes
```

---

## PREPARATION ONLY

```
✅ Proposal object creation
✅ Pure function reasoning
✅ Confirmation prompt rendering
✅ Consent logging
```

---

## AUTO-APPROVAL FORBIDDEN

```
❌ Never assume approval
❌ Never bypass confirmation
❌ Never execute on default
❌ Never auto-escalate to production
```

---

## CONSENT IS MANDATORY

```
✅ HUMAN says: "YES"
   → Proposal approved, await Phase 2

✅ HUMAN says: "NO"
   → Proposal rejected, halt

❌ HUMAN says: nothing
   → Treat as "NO" (silence is NOT approval)

❌ HUMAN says: anything else
   → Invalid response, ask again
```

---

## REASONING WITHOUT ACTING

### What Reasoning Roles CAN Do

- Analyze intent
- Decompose into steps
- Identify resources
- Assess risk
- Flag concerns
- Recommend approach
- Contribute to Proposal

### What Reasoning Roles CANNOT Do

- Perform actions
- Access file system
- Call external APIs
- Modify state
- Assume approval
- Execute code
- Change environment

---

## TRANSPARENCY REQUIRED

Every Proposal must include:

```
✅ Explicit intent (one sentence)
✅ Atomic action steps (numbered list)
✅ Affected resources (explicit list)
✅ Risk assessment (impact + rollback)
✅ Recommendation (advisory only)
✅ Timestamp (immutable)
```

---

## HUMAN AGENCY PRESERVED

```
✅ User always decides
✅ Prompt is locked format (no hidden meanings)
✅ Response is strict (YES/NO only)
✅ Silence is rejection
✅ Approval is explicit
```

---

## WHAT BREAKS THESE CONSTRAINTS

### RED FLAGS

If your code contains any of these:

```typescript
// ❌ Execute without approval
if (approved) {
  fs.writeFileSync(...)  // FORBIDDEN
}

// ❌ Auto-approve
if (recommendation === 'proceed') {
  execute(proposal)  // FORBIDDEN
}

// ❌ Side effects in reasoning
function synthesizeProposal(intent) {
  exec('git commit ...')  // FORBIDDEN
}

// ❌ Bypass consent
async function silentlyApply(proposal) {
  // FORBIDDEN
}

// ❌ Assume default approval
if (!response) {
  execute(proposal)  // FORBIDDEN
}
```

---

## PHASE 1 GATEWAY

This phase acts as a **GOVERNOR**:

```
Intent arrives
     ↓
Prepare Proposal (reasoning only)
     ↓
Render Confirmation (locked format)
     ↓
Wait for Human YES/NO (strict)
     ↓
Log Decision (immutable)
     ↓
If YES: Signal ready for Phase 2 (do NOT execute)
If NO:  Archive proposal, halt
```

**Phase 1 never executes.**

---

## ROLLBACK MUST BE AVAILABLE (When Phase 2 Arrives)

If risk is HIGH and rollback is NOT available:

```
❌ DO NOT RECOMMEND "proceed"
✅ RECOMMEND "caution" or "do_not_proceed"
✅ REQUIRE explicit user override if necessary
```

---

## AUDIT TRAIL IS IMMUTABLE

Every Proposal + Response must be:

- Timestamped (system time)
- Logged (cannot be deleted)
- Attributed (who made the decision?)
- Reversible (can be undone in Phase 2)

---

## SILENCE IS NOT APPROVAL

```
"I didn't say no" ≠ "I approved"

Only explicit "YES" means approval.

Anything else (NO, silence, unclear response):
→ Treat as rejection
→ Halt proposal
→ Ask for clarification
```

---

## IF ANY CONSTRAINT IS BROKEN

**Immediate actions:**

1. Stop execution
2. Log violation
3. Alert governance
4. Do NOT proceed to Phase 2
5. Wait for explicit correction instruction

---

**THESE CONSTRAINTS ARE NOT NEGOTIABLE.**

They exist to ensure the Autonomous Partner never acts without explicit human consent.
