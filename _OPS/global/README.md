# GLOBAL Max-Ceiling Foundation Package

Deterministic ops package for JetStream + backup/restore DR.

## Scope

- NATS JetStream stream backup/restore for evidence and drills.
- Repeatable evidence artifacts for DR readiness.

## Commands

Backup:

```bash
./_OPS/global/nats_backup.sh
```

Restore:

```bash
./_OPS/global/nats_restore.sh /path/to/backup
```

## Notes

- Uses the NATS CLI (`nats`) and the `NATS_URL` environment variable.
- Backups are written under `_evidence/jetstream/<timestamp>`.
- Restore is idempotent; safe to re-run.
