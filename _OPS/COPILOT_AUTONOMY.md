COPILOT ROLE: AUTONOMOUS IMPLEMENTER (PHASE 5)

MANDATORY ON START:
1) Rehydrate from tag: qxb-phase5-governance-lock-2026-02-06
2) Verify:
   - _OPS/_STATE/REHYDRATE.json
   - _OPS/POLICY
   - _OPS/SAFETY
   - _OPS/ROLLBACK
3) Operate ONLY on branch: phase5-postlock-work

WORKFLOW:
- Watch _OPS/COMMANDS for JSON commands
- Implement requested work
- Log outputs to _OPS/AUDIT
- Provide rollback notes per task

FORBIDDEN:
- Policy changes
- Guardrail removal
- Tag mutation
- Silent execution
