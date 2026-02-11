# Autonomous Multi-Agent System Documentation

## Overview

This repository includes a complete autonomous multi-agent system designed to maintain code quality 24/7 while respecting GitHub API rate limits and minimizing costs.

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│          GitHub Actions Scheduler                        │
│   (Rate-limit optimized: 84 runs/day max)               │
└────┬───────────────┬──────────────────┬──────────────────┘
     │               │                  │
     ▼               ▼                  ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│ Autonomous  │ │  Validation  │ │   Healing    │
│   Agent     │ │    Agent     │ │    Agent     │
│ (30 min)    │ │  (1 hour)    │ │  (2 hours)   │
└─────────────┘ └──────────────┘ └──────────────┘
```

## Agents

### 1. Autonomous Code Agent
**Schedule:** Every 30 minutes  
**File:** `.github/workflows/autonomous-code-agent.yml`  
**Script:** `.github/agents/autonomous-agent.js`

**Actions:**
- Code formatting (Prettier)
- Lint auto-fixes (ESLint)
- Minor cleanup operations
- Creates PRs when changes are made

**Safety:**
- Only non-breaking changes
- Respects emergency stop
- Creates audit logs

### 2. Validation Agent
**Schedule:** Every hour + on PR events  
**File:** `.github/workflows/validation-agent.yml`  
**Script:** `.github/agents/validator-agent.js`

**Checks:**
- ESLint validation
- Prettier formatting
- TypeScript compilation
- Security vulnerabilities

**Output:**
- Validation report JSON
- PR comments with results
- Pass/fail status

### 3. Healing Agent
**Schedule:** Every 2 hours  
**File:** `.github/workflows/healing-agent.yml`  
**Script:** `.github/agents/healing-agent.js`

**Actions:**
- Reads validation reports
- Applies fixes automatically
- Identifies auto-merge candidates
- Cleans up after successful merges

## Rate Limit Protection

### Schedule Optimization
- **Before:** Every minute = 1,440 runs/day
- **After:** Optimized schedules = 84 runs/day
- **Savings:** 94% reduction in API calls

### Smart Execution
1. **Conditional Execution:** Agents skip when no work is needed
2. **Change Detection:** Only acts when changes are detected
3. **Emergency Stop:** Respects _OPS/SAFETY/KILL_SWITCH.json
4. **Fail-Safe:** Auto-disables after 5 consecutive failures

### Cost Analysis
**GitHub Free Tier:**
- 2,000 Actions minutes/month included
- Each agent run: ~2-5 minutes
- Maximum monthly usage: ~420 minutes (21% of free tier)
- Actual usage: Lower due to conditional execution

**Result:** ✅ Completely free on GitHub Free tier

## Configuration

### config.json
Location: `.github/agents/config.json`

```json
{
  "schedules": {
    "autonomous_agent": "*/30 * * * *",
    "validation_agent": "0 * * * *",
    "healing_agent": "0 */2 * * *"
  },
  "auto_merge": {
    "enabled": true,
    "safe_categories": [
      "format",
      "lint-autofix",
      "dependency-patch"
    ]
  }
}
```

### Adjusting Schedules

To reduce frequency further:

```yaml
# Every 2 hours instead of 30 minutes
- cron: '0 */2 * * *'

# Twice daily (6 AM and 6 PM UTC)
- cron: '0 6,18 * * *'

# Once daily at midnight UTC
- cron: '0 0 * * *'
```

## Emergency Procedures

### Method 1: Emergency Stop File
Create or update `_OPS/SAFETY/KILL_SWITCH.json`:

```json
{
  "active": true,
  "reason": "Emergency maintenance",
  "timestamp": "2026-02-11T04:45:00Z"
}
```

All agents check this file before execution and will exit immediately.

### Method 2: Disable Workflows
1. Go to repository **Settings** → **Actions** → **General**
2. Select "Disable actions"
3. Or disable individual workflows in the **Actions** tab

### Method 3: Edit Configuration
Set `enabled: false` in `config.json`:

```json
{
  "healing": {
    "enabled": false
  }
}
```

## Monitoring

### View Agent Activity
```bash
# List recent autonomous agent runs
gh run list --workflow=autonomous-code-agent.yml --limit 10

# View specific run details
gh run view <run-id> --log

# Check for agent-created PRs
gh pr list --label autonomous-agent
```

### Check API Rate Limits
```bash
# Current rate limit status
gh api rate_limit

# View remaining API calls
gh api rate_limit --jq '.rate.remaining'
```

### Audit Logs
Agent actions are logged to `_OPS/AUDIT/`:
- `autonomous-agent-<timestamp>.json`
- Contains: timestamp, actions taken, changes made

## Best Practices

### Initial Rollout
1. **Week 1:** Monitor daily, review all agent PRs
2. **Week 2:** Enable auto-merge for formatting only
3. **Week 3:** Expand auto-merge to lint fixes
4. **Week 4:** Full automation with healing enabled

### Maintenance
- Review agent PRs weekly
- Check Actions usage monthly (Settings → Billing)
- Update agent scripts as needed
- Tune config.json based on activity

### Security
- Never auto-merge security vulnerabilities
- Always review dependency updates
- Keep emergency stop documented
- Regular audit of agent actions

## Troubleshooting

### Agents Not Running
**Symptoms:** Scheduled workflows not executing

**Solutions:**
1. Check if workflows are enabled (Actions tab)
2. Verify cron schedule is valid
3. Check for emergency stop active
4. Review workflow permissions

### Too Many API Calls
**Symptoms:** Rate limit warnings in logs

**Solutions:**
1. Increase schedule intervals in config.json
2. Enable `skip_if_no_changes: true`
3. Reduce `max_api_calls_per_run`
4. Cache more aggressively

### Agent Failures
**Symptoms:** Red X in Actions tab

**Solutions:**
1. Check workflow logs for errors
2. Verify Node.js and npm versions
3. Test scripts locally: `node .github/agents/autonomous-agent.js`
4. Check dependencies are installed

## Customization

### Add Custom Checks
Edit `validator-agent.js`:

```javascript
function customCheck() {
  console.log('Running custom validation...');
  // Your validation logic
  return { passed: true, message: 'Custom check passed' };
}
```

### Add Custom Fixes
Edit `autonomous-agent.js`:

```javascript
function customFix() {
  console.log('Applying custom fix...');
  // Your fix logic
  execSync('your-custom-command', { stdio: 'inherit' });
}
```

### Extend Workflows
Add new jobs or steps to workflow files in `.github/workflows/`

## Security Considerations

### Permissions
Agents use minimal required permissions:
- **Read:** Most operations
- **Write:** Only for creating PRs and commits
- **Never:** Admin or sensitive operations

### Safety Checks
- Emergency stop mechanism
- Auto-disable on repeated failures
- Audit logging of all actions
- Never modifies `.github/workflows` or `_OPS/POLICY`

### Rollback
Every agent action can be reverted:

```bash
# Find the commit
git log --grep="autonomous agent"

# Revert the commit
git revert <commit-sha>
git push origin main
```

## Performance Metrics

### Expected Activity
- **Low activity repo:** 10-20 runs/day active
- **Medium activity:** 30-50 runs/day active
- **High activity:** 60-84 runs/day active

### Resource Usage
- **CPU:** <1 minute per run
- **Memory:** <512 MB per run
- **Network:** <50 API calls per run
- **Storage:** <100 KB audit logs per day

## FAQ

**Q: Will this cost me money?**  
A: No, it's designed to stay within GitHub's free tier (2,000 minutes/month).

**Q: Can I run it more frequently?**  
A: Yes, but monitor your rate limits and Actions usage carefully.

**Q: What if I need to stop it immediately?**  
A: Create `_OPS/SAFETY/KILL_SWITCH.json` with `{"active": true}`.

**Q: Can it break my code?**  
A: No, it only makes non-breaking changes (formatting, lint fixes) and creates PRs for review.

**Q: How do I disable just one agent?**  
A: Edit the workflow file and comment out the schedule, or set `enabled: false` in config.json.

## Support

For issues or questions:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Test scripts locally
4. Open an issue if needed

## Version History

- **v1.0.0** (2026-02-11)
  - Initial release
  - Rate-limit optimized schedules
  - Three-agent architecture
  - Emergency stop mechanism
  - Free-tier compatible

## License

Same as repository license (see LICENSE file).
