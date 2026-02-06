#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./_OPS/global/nats_restore.sh /path/to/backup"
  exit 1
fi

BACKUP_DIR="$1"
NATS_URL_VALUE="${NATS_URL:-nats://localhost:4222}"

nats --server "$NATS_URL_VALUE" stream restore QXB_STATE "$BACKUP_DIR/QXB_STATE" --overwrite
nats --server "$NATS_URL_VALUE" stream restore QXB_EVIDENCE "$BACKUP_DIR/QXB_EVIDENCE" --overwrite
nats --server "$NATS_URL_VALUE" stream restore QXB_TASKS "$BACKUP_DIR/QXB_TASKS" --overwrite
