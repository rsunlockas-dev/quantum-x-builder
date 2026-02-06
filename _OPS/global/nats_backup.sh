#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/_evidence/jetstream/$(date -u +"%Y%m%dT%H%M%SZ")"
NATS_URL_VALUE="${NATS_URL:-nats://localhost:4222}"

mkdir -p "$EVIDENCE_DIR"

nats --server "$NATS_URL_VALUE" stream backup QXB_STATE "$EVIDENCE_DIR/QXB_STATE"
nats --server "$NATS_URL_VALUE" stream backup QXB_EVIDENCE "$EVIDENCE_DIR/QXB_EVIDENCE"
nats --server "$NATS_URL_VALUE" stream backup QXB_TASKS "$EVIDENCE_DIR/QXB_TASKS"

printf '{"timestamp":"%s","nats_url":"%s","streams":["QXB_STATE","QXB_EVIDENCE","QXB_TASKS"]}\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$NATS_URL_VALUE" > "$EVIDENCE_DIR/backup_manifest.json"
