# Quantum-X-Builder System Integration Guide

**Version:** 1.0  
**Phase:** 5  
**Status:** Operational  
**Last Updated:** 2026-02-08  
**Authority:** Neo

## Executive Summary

This document describes how all components of the Quantum-X-Builder system identify, communicate, and work together as a cohesive enterprise platform. The system follows the Policy-Authority-Truth (PAT) governance model with enabled autonomy and active guardrails.

## System Identity

- **Repository:** InfinityXOneSystems/quantum-x-builder
- **System Name:** Quantum-X-Builder
- **Purpose:** Governed, AI-assisted system for orchestrating code, infrastructure, and validation pipelines
- **Architecture:** Microservices with centralized governance

## Component Architecture

### 1. Backend Service (vizual-x-backend)

**Location:** `./backend`  
**Runtime:** Node.js (Express)  
**Port:** 8787  
**Entry Point:** `src/index.js`

#### Identity
```json
{
  "name": "vizual-x-backend",
  "version": "0.1.0",
  "type": "module"
}
```

#### Key Features
- RESTful API server
- Google Calendar/Tasks integration
- Multi-provider AI routing (Ollama, Groq, Gemini, Vertex)
- WebSocket support for real-time updates
- PAT-based authentication
- NATS message broker integration

#### API Endpoints
- `/health` - Health check (no auth)
- `/api/chat` - Multi-modal chat interface
- `/api/fs` - File system operations
- `/api/templates` - Template management
- `/api/validate` - Validation services
- `/api/governor` - Governance controls
- `/api/qxb` - Quantum-X-Builder operations
- `/__ops` - Operations control plane
- `/__ops/admin` - Admin dashboard APIs
- `/api/ai-integration` - AI provider integrations

#### Configuration
Environment variables loaded from `./backend/.env`:
- `PORT` - Server port (default: 8787)
- `WORKSPACE_ROOT` - Root workspace path
- `API_TOKEN` - Authentication token
- `DATABASE_URL` - PostgreSQL connection
- Provider configs (Ollama, Groq, Gemini, Vertex)
- Google API credentials
- GitHub OAuth credentials

### 2. Frontend Application (@quantum-x-builder/frontend)

**Location:** `./frontend`  
**Runtime:** React + Vite  
**Port:** 3000  
**Entry Point:** `index.tsx`

#### Identity
```json
{
  "name": "@quantum-x-builder/frontend",
  "displayName": "Quantum X Builder - Frontend",
  "version": "1.0.0",
  "publisher": "InfinityXOneSystems"
}
```

#### Key Features
- Multi-modal chat interface
- Admin Control Plane
- Low-code workflow builder
- Code editor with live preview
- Template library
- Phase 3 operations monitoring
- VSCode extension integration

#### Backend Connection
```typescript
// Frontend connects to backend via environment variable
const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin
```

#### VSCode Extension Commands
- `vizualx.open` - Open VIZUAL X Studio (Ctrl+Shift+X / Cmd+Shift+X)
- `vizualx.showStatus` - Show Control Panel Status
- `vizualx.runSelfCheck` - Run Self-Check
- `vizualx.phase3Status` - Phase 3 Operations Status
- `vizualx.openLowCodePanel` - Open Low-Code Workflow Builder

### 3. Documentation Site (quantum-x-builder-docs)

**Location:** `./website`  
**Runtime:** Docusaurus v3  
**Build Port:** 3001  
**Entry Point:** `docusaurus.config.ts`

#### Deployment
- **Platform:** GitHub Pages
- **Base URL:** `/quantum-x-builder/`
- **Domains:** 
  - vizual-x.com
  - InfinityXAI.com
  - infinityxonesystems.com
  - infinityxoneintelligence.com

#### Build Commands
```bash
# From root
npm run docs:start    # Development server
npm run docs:build    # Production build
npm run docs:deploy   # Deploy to GitHub Pages
```

### 4. Message Broker (NATS JetStream)

**Container:** qxb-nats  
**Image:** nats:2.10-alpine  
**Ports:** 4222 (client), 8222 (monitoring)

#### Purpose
- Event streaming between components
- Command queue processing
- Real-time synchronization
- Pub/sub messaging

#### Topics
- `qxb.events` - System events
- `qxb.commands` - Command queue
- `qxb.sync` - Data synchronization

### 5. Operations Control Plane (_OPS)

**Location:** `./_OPS`  
**Type:** Governance System  
**Authority:** Neo

#### Directory Structure
```
_OPS/
├── COMMANDS/          # Command queue (JSON files)
├── POLICY/            # Governance policies
├── SAFETY/            # Safety controls (kill switch)
├── AUDIT/             # Audit logs
├── OUTPUT/            # Execution results
├── AUTONOMY/          # Autonomy configurations
├── ROLLBACK/          # Rollback artifacts
├── TODO/              # Task management
├── EVOLVING_DOCUMENTS/# Dynamic documentation
├── EVOLVING_INDEX/    # System indices
└── EVOLVING_TAXONOMY/ # System taxonomy
```

#### Key Files
- `POLICY/AUTONOMY_ON.json` - Autonomy configuration
- `SAFETY/KILL_SWITCH.json` - Emergency stop control
- `COMMANDS/*.json` - Command queue files
- `OUTPUT/validation_report_*.json` - Validation reports

## Integration Flows

### Flow 1: Frontend → Backend → Google Calendar

```
User Action (Frontend)
    ↓ HTTP POST /api/ai-integration/calendar
Backend receives request
    ↓ Validates PAT token
    ↓ Loads Google OAuth credentials
    ↓ Calls google-calendar.js module
Google Calendar API
    ↓ Creates/updates event
    ↓ Returns event details
Backend logs to _OPS/AUDIT
    ↓ Returns response
Frontend updates UI
```

### Flow 2: Command Queue Processing

```
JSON file created in _OPS/COMMANDS/
    ↓ File watcher detects
Backend processes command
    ↓ Validates against POLICY
    ↓ Checks SAFETY/KILL_SWITCH
    ↓ Executes if allowed
    ↓ Logs to _OPS/AUDIT
    ↓ Writes output to _OPS/OUTPUT
    ↓ Creates rollback plan in _OPS/ROLLBACK
```

### Flow 3: Real-time Frontend Updates

```
Backend event occurs
    ↓ Publishes to NATS (qxb.events)
Frontend WebSocket connection
    ↓ Receives message
    ↓ Updates UI state
    ↓ Shows notification (if applicable)
```

## Docker Compose Integration

The `docker-compose.yml` orchestrates all services:

```yaml
services:
  backend:
    port: 8787
    environment:
      - WORKSPACE_ROOT=/workspace
    networks: vizualx
    
  frontend:
    port: 3000
    environment:
      - VITE_API_URL=http://backend:8787
    depends_on: backend
    networks: vizualx
    
  nats:
    ports: [4222, 8222]
    networks: vizualx
```

### Starting the System
```bash
docker-compose up -d
```

### Service URLs
- Backend: http://localhost:8787
- Frontend: http://localhost:3000
- NATS Monitoring: http://localhost:8222

## Authentication & Security

### PAT Token Authentication
```http
POST /api/endpoint HTTP/1.1
Host: localhost:8787
X-PAT-RECORD: <token>
Content-Type: application/json
```

### Kill Switch Control
Location: `_OPS/SAFETY/KILL_SWITCH.json`

```json
{
  "removal": "HUMAN_ONLY",
  "authority": "Neo",
  "kill_switch": "ARMED",
  "behavior": "IMMEDIATE_HALT"
}
```

**Effect:** When triggered, immediately stops all autonomous operations.

### Autonomy Constraints
Location: `_OPS/POLICY/AUTONOMY_ON.json`

**Forbidden Actions:**
- Policy mutation
- Guardrail removal
- Tag deletion
- Silent execution

## Component Identification

Each component identifies itself through:

1. **Package Manifests**
   - `backend/package.json` - Backend identity
   - `frontend/package.json` - Frontend identity
   - `website/package.json` - Docs identity

2. **System Manifest**
   - `SYSTEM_INTEGRATION_MANIFEST.json` - Master registry

3. **Docker Labels**
   - Container names (vizualx-backend, vizualx-frontend, qxb-nats)
   - Network name (vizualx)

4. **API Headers**
   ```http
   X-Service-Name: vizual-x-backend
   X-Service-Version: 0.1.0
   X-System: quantum-x-builder
   ```

## Health Checks

### Backend Health
```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "vizual-x-backend",
  "uptime": "<seconds>"
}
```

### System-Wide Validation
```bash
./validate-integration.sh
```

Checks:
- ✓ All directories present
- ✓ Configuration files valid
- ✓ Governance policies intact
- ✓ Integration modules present
- ✓ Git repository state

## Data Synchronization

### Google Calendar Sync
- **Accounts:** ai@infinityxonesystems.com, info@infinityxonesystems.com
- **Direction:** Bidirectional (TODO ↔ Calendar)
- **Frequency:** Real-time + daily reconciliation
- **Conflict Resolution:** Last-write-wins with audit trail

### TODO System Integration
- **Source:** `_OPS/TODO/todo.yaml`
- **Links:** Folder tree, index, taxonomy
- **Sync:** Calendar events, Google Tasks

## Troubleshooting

### Backend Not Starting
1. Check environment: `backend/.env` exists
2. Verify port: `PORT=8787` not in use
3. Check logs: `docker logs vizualx-backend`

### Frontend Can't Connect
1. Verify backend is running: `curl http://localhost:8787/health`
2. Check CORS settings in `backend/src/index.js`
3. Confirm `VITE_API_URL` environment variable

### NATS Connection Issues
1. Check container: `docker ps | grep nats`
2. Verify port: `nc -zv localhost 4222`
3. Check monitoring: http://localhost:8222

### Autonomy Not Working
1. Check policy: `_OPS/POLICY/AUTONOMY_ON.json`
2. Verify kill switch: `_OPS/SAFETY/KILL_SWITCH.json`
3. Review audit logs: `_OPS/AUDIT/`

## Rollback Procedures

Every operation includes rollback documentation:
- Location: `_OPS/ROLLBACK/`
- Format: Step-by-step reversal instructions
- Includes: File checksums, state snapshots

To rollback:
1. Locate rollback file in `_OPS/ROLLBACK/`
2. Follow numbered steps in reverse
3. Verify state with `./validate-integration.sh`
4. Log rollback in `_OPS/AUDIT/`

## Maintenance

### Daily Tasks
- Review `_OPS/AUDIT/` logs
- Check `_OPS/OUTPUT/` reports
- Monitor NATS queue depth
- Verify Google API quota

### Weekly Tasks
- Run `./validate-integration.sh`
- Review autonomy actions
- Update TODO sync status
- Backup `_OPS/` directory

### Monthly Tasks
- Rotate audit logs
- Review and update policies
- Check dependency versions
- Update documentation

## Validation Checklist

Before considering the system "fully integrated":

- [x] All components have valid package.json
- [x] System manifest exists and is valid JSON
- [x] Docker Compose configuration present
- [x] Backend API routes registered
- [x] Frontend can identify backend
- [x] NATS messaging operational
- [x] Google integrations configured
- [x] Operations governance intact
- [x] Safety controls active (kill switch)
- [x] Autonomy policy defined
- [x] Validation script executable
- [x] Git repository correctly identified
- [x] Documentation site buildable
- [x] VSCode extension commands defined
- [x] All required directories present

## References

- System Manifest: `SYSTEM_INTEGRATION_MANIFEST.json`
- Validation Script: `validate-integration.sh`
- Architecture Docs: `docs/SYSTEM_INTEGRATION_ARCHITECTURE.md`
- Implementation Guide: `docs/SYSTEM_INTEGRATION_README.md`
- Docker Compose: `docker-compose.yml`
- Backend Config: `backend/src/config.js`
- Frontend App: `frontend/App.tsx`

## Support

For integration issues or questions:
1. Run validation: `./validate-integration.sh`
2. Review logs in `_OPS/OUTPUT/`
3. Check audit trail in `_OPS/AUDIT/`
4. Consult architecture docs in `docs/`

---

**Document Status:** Complete  
**Validation Status:** ✓ EXCELLENT (30/30 checks passed)  
**Authority:** Neo  
**Phase:** 5
