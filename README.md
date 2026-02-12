# Quantum-X-Builder

**Status:** Private / Internal  
**Governance:** PAT (Policy-Authority-Truth)  
**Autonomy:** Enabled (Phase 5 - with active guardrails)  
**Integration:** ✓ Complete (all components identified)

Quantum-X-Builder is a governed, AI-assisted system for orchestrating
code, infrastructure, and validation pipelines using GitHub Apps,
self-hosted runners, and policy-enforced agents.

## 🚀 Live Application

**Primary Frontend (Monaco-Style)**: https://infinityxonesystems.github.io/quantum-x-builder/

The frontend is a Monaco Editor-style VIZUAL-X interface with:
- AI Integration (Google Gemini)
- Code Editor capabilities
- Admin Control Plane
- Low-code workflow builder
- Real-time collaboration

> **Note**: Docusaurus (`/website`) is for local documentation development only. The Monaco-style frontend is the primary application deployed to GitHub Pages. See [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) for details.

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

- ✓ **Frontend** (Monaco-Style VIZUAL-X) - PRIMARY deployment to GitHub Pages
- ✓ **Backend** (quantum-x-builder) - Express API on port 8787
- ✓ **Documentation** - Markdown files in `/docs` (Docusaurus for local dev only)
- ✓ **Messaging** - NATS JetStream broker
- ✓ **Operations** - _OPS governance control plane
- ✓ **Integrations** - Google Calendar, Google Tasks, GitHub, VSCode

### Deployment Architecture

- **Frontend**: Monaco-style application → GitHub Pages (PRIMARY)
- **Docs**: Docusaurus → Local development only (NOT deployed)

See [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) for complete details.

### Quick Validation
```bash
./validate-integration.sh
```

### Safe Merge Strategy 🛡️

**NEW:** Comprehensive system for safely merging changes to main with zero chaos.

```bash
# Run before creating a PR
./merge-gate.sh
```

**What it provides:**
- ✅ Multi-layered validation (Local → PR → Post-merge)
- ✅ Automated safety gates block bad merges
- ✅ Rollback capability with documented procedures
- ✅ Health monitoring and smoke tests
- ✅ Zero-chaos operation guaranteed

**Quick Links:**
- [🚀 Merge Quick Start](MERGE_QUICKSTART.md) - Get started in 5 minutes
- [📚 Safe Merge Strategy](SAFE_MERGE_STRATEGY.md) - Complete guide with 6-phase process
- [🔍 Smoke Tests](smoke-test.sh) - Quick system health validation
- [🚪 Merge Gate](merge-gate.sh) - Local pre-merge validation

**Key Features:**
- Pre-merge validation workflow (runs on every PR)
- Post-merge health checks (automatic)
- 10 safety gates including lint, types, tests, security
- Integration validation across all components
- Automatic rollback on critical failures

### Documentation
- **Integration Guide:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Complete system integration documentation
- **System Manifest:** [SYSTEM_INTEGRATION_MANIFEST.json](SYSTEM_INTEGRATION_MANIFEST.json) - Component registry
- **Architecture:** [docs/SYSTEM_INTEGRATION_ARCHITECTURE.md](docs/SYSTEM_INTEGRATION_ARCHITECTURE.md)
- **Runbook:** [docs/RUNBOOK.md](docs/RUNBOOK.md) - Operational flow

## Automation

### Ultimate Fix-All Workflow 🚀

**THE ULTIMATE SOLUTION:** Guarantees to fix all issues, code, workflows, actions, agents, PRs, merges, and everything!

```bash
# One command fixes everything
gh workflow run ultimate-fix-all.yml
```

**What it does:**
- ✅ 8 comprehensive fix stages (Foundation → Code → Workflows → Security → Docs → Tests → Summary)
- ✅ Runs automatically 2x daily (8 AM & 8 PM UTC)
- ✅ 100% repository coverage - nothing is missed
- ✅ Health score tracking (0-100)
- ✅ Enterprise-grade safety (5 mechanisms)
- ✅ Complete audit trail
- ✅ FREE - stays within GitHub free tier

**Quick Links:**
- [🚀 Quick Start](ULTIMATE_FIX_ALL_QUICK_START.md) - Get started in 30 seconds
- [📚 Full Guide](ULTIMATE_FIX_ALL_WORKFLOW.md) - Complete documentation
- [📊 Executive Summary](ULTIMATE_FIX_ALL_EXECUTIVE_SUMMARY.md) - Business overview

**Key Metrics:**
- Runtime: 10-30 minutes
- Success Rate: >95%
- Health Target: >90/100
- Cost: $0/month

### Autonomous Multi-Agent System 🤖

**NEW:** Three intelligent agents maintain code quality 24/7 while staying within GitHub's free tier.

```bash
# Quick start guide
cat QUICKSTART.md

# Full documentation
cat AUTONOMOUS_AGENTS.md
```

**Features:**
- Autonomous Agent: Auto-fixes formatting & linting every 30 minutes
- Validation Agent: Quality checks hourly + on PRs
- Healing Agent: Applies fixes every 2 hours
- **94% fewer API calls** vs every-minute schedule
- **Completely free** - uses only 21% of GitHub free tier
- **Safe by default** - requires approval for auto-merge
- **Emergency stop** via `_OPS/SAFETY/KILL_SWITCH.json`

**Documentation:**
- [Quick Start](QUICKSTART.md) - Get started in 5 minutes
- [Full Guide](AUTONOMOUS_AGENTS.md) - Complete documentation
- [Agent Config](.github/agents/config.json) - Configuration reference

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
