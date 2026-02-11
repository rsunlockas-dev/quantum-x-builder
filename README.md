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

- ✓ **Backend** (quantum-x-builder) - Express API on port 8787
- ✓ **Frontend** (@qvizual-x/frontend) - React app with VSCode extension
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

## Automation

### Bulk Dependabot PR Processing

Efficiently process multiple Dependabot PRs (18+ pending PRs):

```bash
# Quick start - merge safe PRs automatically
./scripts/bulk-pr-processor.sh --safe-only
```

**Or via GitHub Actions:**
1. Go to **Actions** → **Bulk Dependabot PR Processor**
2. Click **Run workflow** (set `dry_run: false`, `safe_only: true`)

**Documentation:**
- [Complete Guide](docs/BULK_PR_PROCESSING.md) - Full documentation
- [Quick Reference](docs/BULK_PR_PROCESSING_QUICK_REF.md) - TL;DR cheat sheet
- [Scripts README](scripts/README.md) - All automation scripts

**Features:**
- Auto-merges safe PRs (GitHub Actions, patch/minor updates)
- Labels risky PRs (major version updates) for manual review
- Full audit trails with rollback tokens
- Respects kill-switch and safety guardrails
- Scheduled weekly runs (Mondays 9 AM UTC)

## Automated Maintenance & Code Quality

This repository includes automated tooling for analysis, diagnostics, fixes, validation, optimization, and security scanning.

### Quick Commands

```bash
# Install dependencies
npm install

# Analysis & Diagnostics
npm run analyze          # Run lint + typecheck + tests
npm run diagnose         # Generate diagnostic report

# Automated Fixes
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run fix              # Apply all automated fixes

# Validation
npm run typecheck        # TypeScript type checking
npm run test             # Run tests
npm run validate         # Run typecheck + tests

# Optimization & CI
npm run optimize         # Check bundle sizes
npm run ci               # Full CI pipeline locally
```

### CI Workflows

- **Auto-Maintenance** (`.github/workflows/auto-maintain.yml`)
  - Runs weekly analysis, diagnostics, and security scans
  - Creates fix PRs automatically when issues are found
  - Auto-merges PRs when checks pass (configurable)
  
- **CodeQL Security** (`.github/workflows/codeql-analysis.yml`)
  - Weekly security scanning for vulnerabilities
  - Integrated with GitHub Security tab

### Configuration

Automation can be controlled via `.github/auto-maintenance.yml`:

```yaml
enabled: true          # Master switch
jobs:
  analyze: true       # Code analysis
  diagnose: true      # Diagnostics
  fix: true           # Auto-fix PRs
  validate: true      # Validation
  optimize: true      # Bundle size checks
  security: true      # Security scans
auto_merge:
  enabled: true       # Auto-merge fix PRs
  method: squash      # Merge method
```

**Full Documentation:** [docs/MAINTENANCE.md](docs/MAINTENANCE.md)
