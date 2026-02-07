# Ingestion Execution Plan (Shadow)

Mode: Manual / Operator-triggered

Scheduling:
- No cron
- No background loops

Controls:
- Rate limits per source
- Trust tiers
- Re-validation cadence

Failure Handling:
- Fail-loud
- No retries without approval
