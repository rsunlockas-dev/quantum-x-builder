# Autonomous Multi-Agent System

This directory contains the autonomous agent system that maintains and improves the repository 24/7.

## Overview

The system consists of three intelligent agents working together:

1. **Autonomous Code Agent** - Runs every 30 minutes
2. **Validation Agent** - Runs hourly + on PR events  
3. **Healing Agent** - Runs every 2 hours

## Rate Limit Protection

- Autonomous: Every 30 minutes (48 runs/day)
- Validation: Hourly (24 runs/day) + on-demand
- Healing: Every 2 hours (12 runs/day)
- Total: ~84 scheduled runs/day (well within free tier)

## Emergency Stop

Create `_OPS/SAFETY/KILL_SWITCH.json` with `{"active": true}` to stop all agents immediately.

## Configuration

Edit `config.json` to customize schedules, auto-merge policies, and thresholds.
