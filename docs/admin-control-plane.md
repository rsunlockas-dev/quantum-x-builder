# Admin Control Plane - Design & API Specification

## Overview

The Admin Control Plane provides a centralized interface for managing the autonomous CI/CD and governance system. This document describes the design, API endpoints, and environment variables for the control plane.

**Status**: Design stub - Implementation pending  
**Version**: Phase 6 - Modular Autonomy

## Architecture

### Components

1. **Admin UI** (`frontend/src/admin/AdminControlPanel.tsx`)
   - React + Tailwind CSS
   - Toggles for autonomy control
   - Audit ledger viewer
   - Rollback token search
   - Rehydration trigger
   - Agent allowlist management

2. **Control Plane API** (To be implemented)
   - RESTful API for autonomy control
   - Authentication via JWT or GitHub OAuth
   - Rate limiting and audit logging

3. **Configuration Store**
   - Environment variables
   - GitHub repository secrets
   - Optional: External config service (e.g., Firebase, Supabase)

## Environment Variables

### Core Configuration

```bash
# Autonomy Control
QXB_AUTONOMY_ENABLED=true|false          # Master autonomy toggle
QXB_KILL_SWITCH_PATH=_OPS/SAFETY/KILL_SWITCH.json
QXB_AUDIT_LOG_PATH=_OPS/AUDIT/audit.log

# Authentication
QXB_ADMIN_API_KEY=<secret-key>           # API key for admin endpoints
QXB_GITHUB_APP_ID=<app-id>               # GitHub App ID (optional)
QXB_GITHUB_APP_SECRET=<secret>           # GitHub App secret

# Rehydration
QXB_REHYDRATE_TAG=qxb-phase5-lock-2026-02-06
QXB_REHYDRATE_REQUIRED=true|false

# Agent Allowlist
QXB_ALLOWED_AGENTS=copilot,github-actions[bot],qxb-bot
```

### Deployment Configuration

```bash
# GCP Configuration
GCP_PROJECT_ID=quantum-x-builder
GCP_REGION=us-central1
ARTIFACT_REGISTRY=us-central1-docker.pkg.dev
ARTIFACT_REPO=quantum-x-builder

# Service Ports
FRONTEND_PORT=5173
BACKEND_PORT=3000
```

## API Endpoints (Stub Design)

Base URL: `https://api.quantum-x-builder.com/admin/v1` (or internal endpoint)

### Authentication

All endpoints require authentication via:
- Bearer token: `Authorization: Bearer <QXB_ADMIN_API_KEY>`
- GitHub OAuth token

### Endpoints

#### 1. Get Autonomy Status

```http
GET /autonomy/status
```

**Response**:
```json
{
  "enabled": true,
  "killswitch": {
    "active": false,
    "path": "_OPS/SAFETY/KILL_SWITCH.json"
  },
  "rehydrate": {
    "tag": "qxb-phase5-lock-2026-02-06",
    "hash": "abc123...",
    "required": true
  },
  "last_updated": "2026-02-08T21:00:00Z"
}
```

#### 2. Enable/Disable Autonomy

```http
POST /autonomy/toggle
Content-Type: application/json

{
  "enabled": true|false,
  "reason": "Manual override for maintenance"
}
```

**Response**:
```json
{
  "success": true,
  "status": "enabled",
  "timestamp": "2026-02-08T21:00:00Z",
  "rollback_token": "qxb-rollback-20260208T210000Z"
}
```

#### 3. Get Audit Ledger

```http
GET /audit/ledger?limit=50&offset=0&type=validation|deployment
```

**Response**:
```json
{
  "total": 150,
  "entries": [
    {
      "timestamp": "2026-02-08T20:30:00Z",
      "type": "validation",
      "rollback_token": "qxb-rollback-20260208T203000Z",
      "pr_number": 123,
      "commit_sha": "abc123...",
      "status": "success"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### 4. Search Rollback Tokens

```http
GET /rollback/search?token=qxb-rollback-20260208T203000Z
GET /rollback/search?date=20260208
```

**Response**:
```json
{
  "matches": [
    {
      "token": "qxb-rollback-20260208T203000Z",
      "commit_sha": "abc123...",
      "branch": "main",
      "message": "auto-fix: apply automated fixes",
      "timestamp": "2026-02-08T20:30:00Z",
      "files_changed": ["file1.ts", "file2.ts"]
    }
  ]
}
```

#### 5. Trigger Rehydration

```http
POST /rehydrate/trigger
Content-Type: application/json

{
  "tag": "qxb-phase5-lock-2026-02-06",
  "force": false
}
```

**Response**:
```json
{
  "success": true,
  "tag": "qxb-phase5-lock-2026-02-06",
  "hash": "abc123...",
  "timestamp": "2026-02-08T21:00:00Z"
}
```

#### 6. Get/Update Agent Allowlist

```http
GET /agents/allowlist
```

**Response**:
```json
{
  "agents": [
    "copilot",
    "github-actions[bot]",
    "qxb-bot"
  ]
}
```

```http
PUT /agents/allowlist
Content-Type: application/json

{
  "agents": ["copilot", "github-actions[bot]", "qxb-bot", "dependabot[bot]"]
}
```

#### 7. Initiate Rollback

```http
POST /rollback/initiate
Content-Type: application/json

{
  "rollback_token": "qxb-rollback-20260208T203000Z",
  "create_pr": true,
  "pr_title": "Rollback: revert automated changes"
}
```

**Response**:
```json
{
  "success": true,
  "rollback_token": "qxb-rollback-20260208T203000Z",
  "revert_commit": "def456...",
  "pr_url": "https://github.com/.../pull/124",
  "requires_review": true
}
```

## Admin UI Features

### Dashboard

- **Autonomy Status Card**: Current status with enable/disable toggle
- **Recent Activity**: Last 10 operations with timestamps
- **Active Workflows**: Currently running workflows
- **Quick Stats**: Total PRs validated, deployments, rollbacks

### Audit Ledger View

- **Filterable Table**: Filter by type, date, status
- **Search**: Search by rollback token, PR number, commit SHA
- **Export**: Download audit log as JSON or CSV
- **Details Modal**: View full audit entry details

### Rollback Management

- **Token Search**: Search for commits by rollback token or date
- **Rollback Preview**: Show commit details before rollback
- **Create Rollback PR**: One-click rollback PR creation
- **Rollback History**: View past rollbacks

### Rehydration Control

- **Current Tag Display**: Show current rehydrate tag and hash
- **Trigger Rehydration**: Button to trigger rehydrate workflow
- **Rehydration History**: View past rehydration events

### Agent Allowlist

- **Agent List**: View allowed agents
- **Add/Remove Agents**: Manage allowlist
- **Agent Activity**: View recent activity by agent

## Implementation Notes

### Security

- All admin endpoints require authentication
- Rate limiting: 100 requests/minute per user
- Audit all admin actions
- Use HTTPS only
- Implement CORS restrictions

### Data Storage

**Option 1: File-based** (Current)
- Read from `_OPS/AUDIT/audit.log` and `_OPS/OUTPUT/*.json`
- Modify `_OPS/SAFETY/KILL_SWITCH.json`
- Simple, no external dependencies

**Option 2: Database** (Future)
- PostgreSQL or MongoDB for structured storage
- Better query performance
- Easier scaling

**Option 3: Hybrid**
- Keep audit logs file-based (immutable)
- Use database for UI state and caching

### Frontend Tech Stack

- **React 18+**: UI framework
- **Tailwind CSS**: Styling
- **React Query**: Data fetching and caching
- **Zustand or Context**: State management
- **React Router**: Routing
- **Date-fns**: Date formatting
- **Recharts**: Charts for analytics (optional)

### Backend Implementation Options

**Option 1: GitHub Actions + Functions**
- Use workflow_dispatch for admin actions
- GitHub API for data access
- Minimal infrastructure

**Option 2: Cloud Function/Lambda**
- Deploy as serverless function
- Connects to GitHub API
- Lightweight and scalable

**Option 3: Dedicated Service**
- Express.js or Fastify backend
- Deployed to Cloud Run
- More control and features

## Next Steps

1. **Phase 1**: Implement read-only admin UI
   - Display current status
   - View audit ledger
   - Search rollback tokens

2. **Phase 2**: Add control features
   - Enable/disable autonomy
   - Trigger rehydration
   - Manage agent allowlist

3. **Phase 3**: Implement rollback workflow
   - Automated PR creation for rollbacks
   - Rollback preview
   - Rollback history tracking

4. **Phase 4**: Advanced features
   - Analytics dashboard
   - Alerting and notifications
   - Integration with external monitoring

## Testing

- Unit tests for API endpoints
- Integration tests for GitHub API interactions
- E2E tests for admin UI workflows
- Security testing for authentication and authorization

## Monitoring

- Track API endpoint usage
- Monitor autonomy toggle events
- Alert on repeated rollbacks
- Dashboard uptime monitoring

---

**Status**: Stub implementation  
**Owner**: To be assigned  
**Priority**: Medium  
**Estimated Effort**: 2-4 weeks

See `frontend/src/admin/AdminControlPanel.tsx` for UI stub implementation.
