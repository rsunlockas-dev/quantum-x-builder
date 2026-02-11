# Autonomous Multi-Agent System

This directory contains the autonomous agent system that maintains and improves the repository 24/7.

## Overview

The system consists of four intelligent agents working together:

1. **Autonomous Code Agent** - Runs every 30 minutes
2. **Validation Agent** - Runs hourly + on PR events  
3. **Healing Agent** - Runs every 2 hours
4. **Fix-All Agent** - Runs every 6 hours (comprehensive fixes)

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

### 4. Fix-All Agent (NEW)
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

## Rate Limit Protection

- Autonomous: Every 30 minutes (48 runs/day)
- Validation: Hourly (24 runs/day) + on-demand
- Healing: Every 2 hours (12 runs/day)
- Fix-All: Every 6 hours (4 runs/day)
- Total: ~88 scheduled runs/day (well within free tier)

## Emergency Stop

Create `_OPS/SAFETY/KILL_SWITCH.json` with `{"active": true}` to stop all agents immediately.

All agents respect the kill switch and will halt immediately when activated.

## Configuration

Edit `config.json` to customize schedules, auto-merge policies, and thresholds.

See individual workflow files in `.github/workflows/` for detailed configuration options.
