# Quantum-X-Builder

**Status:** Private / Internal  
**Governance:** PAT (Policy-Authority-Truth)  
**Autonomy:** Enabled (Phase 5 - with active guardrails)  
**Integration:** ✓ Complete (all components identified)

Quantum-X-Builder is a governed, AI-assisted system for orchestrating
code, infrastructure, and validation pipelines using GitHub Apps,
self-hosted runners, and policy-enforced agents.

## Core Guarantees
- No destructive automation
- All write actions are PAT-gated
- Evidence is mandatory
- Autonomy is opt-in and revocable

## Phases
- Phase 3b: Locked (stable)
- Phase 4: Shadow-mode only
- Phase 5: Autonomous implementation (enabled with guardrails)

## System Integration

All components are fully integrated and identify with the system perfectly:

- ✓ **Backend** (vizual-x-backend) - Express API on port 8787
- ✓ **Frontend** (@quantum-x-builder/frontend) - React app with VSCode extension
- ✓ **Documentation** - Docusaurus v3 site
- ✓ **Messaging** - NATS JetStream broker
- ✓ **Operations** - _OPS governance control plane
- ✓ **Integrations** - Google Calendar, Google Tasks, GitHub, VSCode

### Quick Validation
```bash
./validate-integration.sh
```

### Documentation
- **Integration Guide:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Complete system integration documentation
- **System Manifest:** [SYSTEM_INTEGRATION_MANIFEST.json](SYSTEM_INTEGRATION_MANIFEST.json) - Component registry
- **Architecture:** [docs/SYSTEM_INTEGRATION_ARCHITECTURE.md](docs/SYSTEM_INTEGRATION_ARCHITECTURE.md)
- **Runbook:** [docs/RUNBOOK.md](docs/RUNBOOK.md) - Operational flow
