#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="/workspaces/quantum-x-builder"
cd "$ROOT"

need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING_TOOL:$1" >&2; exit 127; }; }
need curl

BASE_URL="${VITE_BACKEND_URL:-http://127.0.0.1:8787}"
PAT_RECORD="${PAT_RECORD:-}"

if [[ -z "$PAT_RECORD" ]]; then
  echo "PAT_RECORD is required" >&2
  exit 2
fi

RUN_ID="run_$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="_evidence/$RUN_ID"
mkdir -p "$OUT_DIR"

fetch_json() {
  local path="$1"
  local output="$2"
  curl -fsS -H "X-PAT-RECORD: $PAT_RECORD" "$BASE_URL$path" -o "$output"
}

echo "-- admin capabilities --"
fetch_json "/__ops/admin/capabilities" "$OUT_DIR/ADMIN_CAPABILITIES.json"

echo "-- admin readiness --"
fetch_json "/__ops/admin/readiness" "$OUT_DIR/PHASE3_ADMIN_READINESS.json"

echo "-- admin gates --"
fetch_json "/__ops/admin/gates" "$OUT_DIR/PHASE3_ADMIN_GATES.json"

echo "-- nats varz --"
fetch_json "/__ops/admin/nats/varz" "$OUT_DIR/NATS_VARZ_SAMPLE.json"

echo "-- jetstream --"
fetch_json "/__ops/admin/nats/js" "$OUT_DIR/PHASE3_ADMIN_JETSTREAM.json"

echo "-- evidence packs --"
fetch_json "/__ops/admin/evidence" "$OUT_DIR/PHASE3_ADMIN_EVIDENCE.json"

echo "-- logs index --"
fetch_json "/__ops/admin/logs" "$OUT_DIR/PHASE3_ADMIN_LOGS.json"

echo "-- runtime --"
fetch_json "/__ops/admin/runtime" "$OUT_DIR/PHASE3_ADMIN_RUNTIME.json"

cat > "$OUT_DIR/PHASE3_ADMIN_PAGES.json" <<'JSON'
{
  "sections": [
    { "id": "capabilities", "label": "Capabilities", "endpoint": "/__ops/admin/capabilities" },
    { "id": "readiness", "label": "Readiness", "endpoint": "/__ops/admin/readiness" },
    { "id": "gates", "label": "Gates", "endpoint": "/__ops/admin/gates" },
    { "id": "varz", "label": "NATS Varz", "endpoint": "/__ops/admin/nats/varz" },
    { "id": "jetstream", "label": "JetStream", "endpoint": "/__ops/admin/nats/js" },
    { "id": "evidence", "label": "Evidence", "endpoint": "/__ops/admin/evidence" },
    { "id": "logs", "label": "Logs", "endpoint": "/__ops/admin/logs" },
    { "id": "runtime", "label": "Runtime", "endpoint": "/__ops/admin/runtime" }
  ]
}
JSON

echo "Phase 3 admin evidence captured in $OUT_DIR"
