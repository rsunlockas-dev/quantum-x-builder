# Autonomous Multi-Agent System

This directory contains the autonomous agent system that maintains and improves the repository 24/7.

## Overview

The system consists of five intelligent agents working together:

1. **Autonomous Code Agent** - Runs every 30 minutes
2. **Validation Agent** - Runs hourly + on PR events  
3. **Healing Agent** - Runs every 2 hours
4. **Fix-All Agent** - Runs every 6 hours (comprehensive fixes)
5. **Evolution Agent** - Runs 4x daily (110% protocol optimization)

## Agents

### 1. Autonomous Code Agent
**File:** `autonomous-agent.js`  
**Schedule:** Every 30 minutes  
**Purpose:** Light maintenance and quick fixes

### 2. Validation Agent
**File:** `validator-agent.js`  
**Schedule:** Hourly + on PR events  
**Purpose:** Quality checks and validation

### 3. Healing Agent
**File:** `healing-agent.js`  
**Schedule:** Every 2 hours  
**Purpose:** Fix failing checks

### 4. Fix-All Agent
**File:** `fix-all-agent.js`  
**Schedule:** Every 6 hours  
**Purpose:** Comprehensive persistent fixes

**Features:**
- Fixes code quality (Prettier, ESLint)
- Fixes documentation (markdown)
- Fixes security issues (npm audit)
- Updates dependencies (safe)
- Validates tests
- Creates comprehensive PRs

**Documentation:** See `FIX_ALL_WORKFLOW_GUIDE.md` for complete guide

### 5. Evolution Agent (NEW - 110% Protocol)
**File:** `evolution-agent.js`  
**Schedule:** 4x daily (1, 7, 13, 19 UTC) - runs 1 hour after fix-all  
**Purpose:** Advanced optimization and system evolution

**Features:**
- 🚀 Advanced code optimization
- 🔄 Code consolidation (removes duplicates)
- ⚙️ Workflow optimization
- ⚡ Performance enhancement
- 🔒 Security hardening
- 📋 Best practices enforcement
- 🧬 Continuous system evolution

**Targets:**
- Code Quality: A+
- Performance: 110%
- Reliability: 99.99%
- Best Practices: Industry Standard

**Documentation:** See `EVOLUTION_AGENT_GUIDE.md` for complete guide

## Agent Workflow Sequence

```
Every 30 min → Autonomous Agent (quick fixes)
         ↓
  Hourly → Validation Agent (quality checks)
         ↓
Every 2h → Healing Agent (fix failures)
         ↓
Every 6h → Fix-All Agent (comprehensive fixes)
         ↓
  [1 hour delay]
         ↓
   4x daily → Evolution Agent (110% optimization)
```

## Rate Limit Protection

- Autonomous: Every 30 minutes (48 runs/day)
- Validation: Hourly (24 runs/day) + on-demand
- Healing: Every 2 hours (12 runs/day)
- Fix-All: Every 6 hours (4 runs/day)
- Evolution: 4 times daily (4 runs/day)
- Total: ~92 scheduled runs/day (well within free tier)

## Emergency Stop

Create `_OPS/SAFETY/KILL_SWITCH.json` with `{"active": true}` to stop all agents immediately.

All agents respect the kill switch and will halt immediately when activated.

## Configuration

Edit `config.json` to customize schedules, auto-merge policies, and thresholds.

See individual workflow files in `.github/workflows/` for detailed configuration options.

## Quick Reference

### Manual Triggers
```bash
# Fix-All Agent
gh workflow run fix-all-persistent.yml

# Evolution Agent
gh workflow run evolution-agent.yml

# Validation Agent
gh workflow run validation-agent.yml
```

### Monitoring
```bash
# View all workflow runs
gh run list --limit 10

# View specific agent logs
cat _OPS/AUDIT/evolution-agent.log
cat _OPS/AUDIT/fix-all-agent.log

# Check agent state
cat _OPS/AUDIT/evolution-agent-state.json
cat _OPS/AUDIT/fix-all-state.json
```

### Rollback
```bash
# List rollback points
git tag -l "evolution-*"
git tag -l "fix-all-*"

# Rollback to specific point
git reset --hard <tag-name>
```
