#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="/workspaces/quantum-x-builder"
cd "$ROOT"

need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING_TOOL:$1" >&2; exit 127; }; }
have() { command -v "$1" >/dev/null 2>&1; }

echo "== toolchain =="
need node
need npm
node -v
npm -v

echo "== optional docker visibility (skip if unavailable) =="
if have docker; then
	echo "-- docker --"
	docker version || true
	if docker compose version >/dev/null 2>&1; then
		docker compose version || true
	fi
	docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | sed 's/[[:space:]]\+$//' || true
else
	echo "DOCKER:UNAVAILABLE (expected in many Codespaces containers)"
fi

echo "== required network probes =="
need curl

echo "-- nats health (8222/varz) --"
NATS_VARZ_URL="${NATS_VARZ_URL:-http://nats:8222/varz}"
curl -fsS "$NATS_VARZ_URL" >/dev/null && echo "NATS:OK" || { echo "NATS:FAIL ($NATS_VARZ_URL)" >&2; exit 2; }

echo "-- backend health (8787) --"
# Try common health routes; tolerate 404 but require TCP listener via curl connect.
if curl -fsS "http://127.0.0.1:8787/health" >/dev/null; then
	echo "BACKEND:HEALTH_OK (/health)"
elif curl -fsS "http://127.0.0.1:8787/healthz" >/dev/null; then
	echo "BACKEND:HEALTH_OK (/healthz)"
else
	# At minimum require connect + any HTTP response
	code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://127.0.0.1:8787/" || true)"
	if [[ "$code" =~ ^[0-9]{3}$ ]] && [ "$code" != "000" ]; then
		echo "BACKEND:LISTENING (HTTP $code)"
	else
		echo "BACKEND:NOT_REACHABLE" >&2
		exit 2
	fi
fi

echo "-- phase3 admin status (PAT) --"
PAT=$(node -e "console.log(JSON.stringify({policy:{allowed:['admin:phase3:read'],denied:[]},authority:{actor:'ops',scope:['admin'],permissions:['admin:phase3:read'],approvals_required:false},truth:{verdict:'PASS',evidence:['PHASE3_FLAGS.json'],hashes:['HASHES.sha256']},evidence_paths:['EVIDENCE_MANIFEST.json'],hashes:['HASHES.sha256'],response_state:'ALLOW: proceed'}))")
curl -fsS -H "X-PAT-RECORD: $PAT" "http://127.0.0.1:8787/api/admin/phase3/status" >/dev/null \
	&& echo "PHASE3:OK" \
	|| { echo "PHASE3:FAIL" >&2; exit 2; }

echo "== done =="
