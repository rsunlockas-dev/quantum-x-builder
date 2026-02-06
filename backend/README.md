# Vizual-X Backend

Node.js backend that routes chat requests across Ollama (primary), Groq, Gemini, and Vertex AI with filesystem edit endpoints for autonomous workflows.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Boxed profile (no external provider keys):

```bash
cp .env.boxed .env
npm install
npm run dev
```

## Endpoints

- `GET /api/health`
- `POST /api/chat` body: `{ messages, config, theme, providerOrder? }`
- `POST /api/fs/list` body: `{ path }`
- `POST /api/fs/read` body: `{ path }`
- `POST /api/fs/write` body: `{ path, content, pat }`
- `GET /api/templates`
- `GET /api/templates/:name`
- `POST /api/validate/spec`
- `POST /api/validate/system`
- `POST /api/validate/pat`
- `POST /api/governor/jobs` body: `{ type, payload, pat }`
- `PATCH /api/governor/jobs/:id` body: `{ status, payload, pat }`
- `POST /api/governor/audit` body: `{ event, data, pat }`
- `GET /api/connectors/status`
- `POST /api/connectors/github/start`
- `POST /api/connectors/google/start`
- `POST /api/connectors/vscode/link`
- `POST /api/connectors/gcp/link`
- `GET /api/telephony/status`
- `POST /api/telephony/call`
- `POST /api/telephony/webhook`
- `GET /api/rag/status`
- `POST /api/rag/query`
- `POST /api/rag/ingest`
- `GET /api/browser/status`
- `POST /api/browser/run`
- `GET /api/automl/status`
- `POST /api/automl/train`
- `POST /api/automl/predict`
- `GET /api/qxb/connectors`
- `POST /api/qxb/connectors`
- `GET /api/qxb/autonomy`
- `POST /api/qxb/autonomy`
- `POST /api/qxb/runs`
- `GET /api/qxb/runs/:id`
- `GET /api/admin/providers/locker`
- `GET /api/admin/phase3/status`
- `GET /api/admin/phase3/catalog`
- `GET /api/admin/phase3/todos`
- `GET /api/admin/phase3/memory`
- `GET /api/admin/phase3/backplane`

## Health Probes

- `GET /startupz`
- `GET /healthz`
- `GET /readyz`

## Ops Readiness

- `GET /__ops/readiness` (PAT-gated)
- `GET /__ops/gates/v2/admin-readiness` (PAT-gated)
- `GET /__ops/gates/v3/integrity` (PAT-gated)

## Ops Admin (Phase 3)

- `GET /__ops/admin/capabilities` (PAT + phase3 flag)
- `GET /__ops/admin/readiness` (PAT + phase3 flag)
- `GET /__ops/admin/phase3/status` (PAT + phase3 flag)
- `GET /__ops/admin/gates` (PAT + phase3 flag)
- `GET /__ops/admin/nats/varz` (PAT + phase3 flag)
- `GET /__ops/admin/nats/js` (PAT + phase3 flag)
- `GET /__ops/admin/evidence` (PAT + phase3 flag)
- `GET /__ops/admin/logs` (PAT + phase3 flag)
- `GET /__ops/admin/logs/:name` (PAT + phase3 flag)
- `GET /__ops/admin/runtime` (PAT + phase3 flag)

## Env Key Catalog

Canonical env keys are listed in [ENV_KEYS.md](../ENV_KEYS.md). Readiness checks reference this file.

## Runbook

Mandatory validation gate is defined in [docs/RUNBOOK.md](../docs/RUNBOOK.md).

## QXB Pub/Sub Services (NATS)

- NATS JetStream runs on `localhost:4222` (see docker-compose.yml)
- QXB chat gateway: `http://localhost:8090`
- QXB narrator: background service (NATS consumer)
- QXB presence: `http://localhost:8092`

## Auth

If `API_TOKEN` is set, include `Authorization: Bearer <token>`.

## PAT enforcement

Write endpoints require a PAT record in the request body as `pat`, or as an `X-PAT-RECORD` JSON header.

Minimal example:

```json
{
	"pat": {
		"policy": { "allowed": ["fs:write"], "denied": [] },
		"authority": { "actor": "Agent", "scope": ["workspace"], "permissions": ["fs:write"], "approvals_required": false },
		"truth": { "verdict": "PASS", "evidence": ["RUN_LOG.ndjson"], "hashes": ["HASHES.sha256"] },
		"evidence_paths": ["EVIDENCE_MANIFEST.json"],
		"hashes": ["HASHES.sha256"]
	}
}
```

