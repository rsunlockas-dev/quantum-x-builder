# System Runbook

## Mandatory Validation Gate

Every change must pass validation before moving to the next step. This gate is non-optional.

### Required Checks

1. Backend readiness
   - `node -e "import('./backend/src/utils/systemChecks.js').then(m=>m.runSystemChecks()).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exit(1);})"`
   - `GET /__ops/readiness` (PAT-gated)

2. Dependency audit
   - `cd backend && npm audit --omit=dev`

3. Frontend build
   - `cd vizual-x && npm run build`

### Gate Rules

- Any failed check blocks progression.
- Missing env keys must be documented in the readiness report; no secret values in logs.
- Evidence bundle entries must include audit ledger ID where available.

## Notes

- Use `ENV_PROFILE=boxed` and `STUB_MODE=true` to boot with zero external provider keys while keeping readiness unblocked.
- Use `ENV_PROFILE=dev` for local stub readiness when external services are not configured.
