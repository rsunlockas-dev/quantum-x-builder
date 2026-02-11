# Autonomous Multi-Agent System - Quick Start

## What You Get

Three intelligent agents running 24/7:
- Autonomous Agent: Fixes code every 30 minutes
- Validation Agent: Checks quality hourly + on PRs
- Healing Agent: Applies fixes every 2 hours

## Key Benefits

- 94% fewer API calls than every-minute schedule
- Completely free (21% of GitHub free tier)
- Safe by default (requires approval)
- Emergency stop available
- Full audit trail

## Quick Actions

View agent activity:
```bash
gh run list --workflow=autonomous-code-agent.yml --limit 5
```

Check rate limits:
```bash
gh api rate_limit
```

Emergency stop - create this file:
`_OPS/SAFETY/KILL_SWITCH.json` with `{"active":true}`

## Documentation

- Full docs: `AUTONOMOUS_AGENTS.md`
- Agent config: `.github/agents/config.json`
- Agent scripts: `.github/agents/*.js`

## What to Monitor

1. Actions tab - workflow runs
2. PRs with label `autonomous-agent`
3. Billing - Actions minutes
4. Audit logs in `_OPS/AUDIT/`
