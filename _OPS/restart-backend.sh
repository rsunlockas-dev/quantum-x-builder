#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="/workspaces/quantum-x-builder"
cd "$ROOT"

echo "Killing existing backend node processes (best-effort)..."
pkill -f "node.*backend" || true
pkill -f "npm.*(run )?dev" || true

echo "Starting backend in background..."
mkdir -p "$ROOT/_OPS/_LOGS"
(
  cd "$ROOT/backend"
  nohup npm run dev > "$ROOT/_OPS/_LOGS/backend-dev.log" 2>&1 &
) >/dev/null 2>&1

sleep 1
echo "Restart issued. Tail logs: tail -n 200 -f $ROOT/_OPS/_LOGS/backend-dev.log"
