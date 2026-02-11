# Fix-All Persistent Workflow Guide

## Overview

The **Fix-All Persistent Workflow** is a comprehensive autonomous system that continuously fixes all issues in the repository until everything is resolved. It runs persistently using existing GitHub credentials and app integrations.

## Features

### 🔄 Persistent Execution
- Runs automatically every 6 hours
- Can be triggered manually anytime
- Continues until all issues are fixed
- Creates PRs with all fixes applied

### 🛠️ Comprehensive Fixes

The workflow fixes:
1. **Code Quality**
   - ✅ Prettier formatting (all file types)
   - ✅ ESLint auto-fixes
   - ✅ TypeScript compilation errors (detection)

2. **Documentation**
   - ✅ Markdown formatting
   - ✅ Documentation consistency
   - ✅ YAML/JSON formatting

3. **Security**
   - ✅ npm audit fixes (non-breaking)
   - ✅ Security vulnerability patches
   - ✅ Safe dependency updates

4. **Dependencies**
   - ✅ package-lock.json updates
   - ✅ Dependency synchronization
   - ✅ Legacy peer dependency resolution

5. **Testing**
   - ✅ Test suite validation
   - ✅ Test result reporting

### 🔒 Safety Mechanisms

1. **Kill Switch**
   - Respects `_OPS/SAFETY/KILL_SWITCH.json`
   - Immediate halt when activated
   - No partial commits

2. **Rate Limiting**
   - Runs every 6 hours (4 times per day)
   - Respects GitHub API rate limits
   - Free tier compatible

3. **Rollback Support**
   - Every PR includes rollback instructions
   - Git history preserved
   - Audit trail maintained

4. **Audit Logging**
   - All actions logged to `_OPS/AUDIT/fix-all-agent.log`
   - State saved to `_OPS/AUDIT/fix-all-state.json`
   - Full transparency

## Usage

### Automatic Execution

The workflow runs automatically every 6 hours. No action required.

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Manual Execution

#### Via GitHub UI
1. Go to **Actions** tab
2. Select **Fix-All Persistent Workflow**
3. Click **Run workflow**
4. Configure options:
   - **max_iterations**: Maximum iterations (default: 10)
   - **create_pr**: Create PR with fixes (default: true)
5. Click **Run workflow**

#### Via GitHub CLI
```bash
# Run with defaults
gh workflow run fix-all-persistent.yml

# Run with custom iterations
gh workflow run fix-all-persistent.yml -f max_iterations=20

# Run without creating PR
gh workflow run fix-all-persistent.yml -f create_pr=false
```

#### Via API
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/fix-all-persistent.yml/dispatches \
  -d '{"ref":"main","inputs":{"max_iterations":"10"}}'
```

## Workflow Jobs

### Job 1: Preflight Checks
**Purpose:** Verify it's safe to run

**Checks:**
- ✅ Kill switch status
- ✅ Repository state
- ✅ Prerequisites

**Outputs:**
- `should_run`: Whether to proceed
- `kill_switch_active`: Kill switch status

### Job 2: Fix-All
**Purpose:** Apply comprehensive fixes

**Steps:**
1. Checkout repository
2. Install dependencies (root, backend, frontend, website)
3. Run fix-all agent
4. Check for changes
5. Create PR if changes exist
6. Comment on existing issues

**Outputs:**
- `has_changes`: Whether changes were made
- `files_changed`: Number of files modified

### Job 3: Validate
**Purpose:** Verify fixes are correct

**Checks:**
- ✅ Prettier formatting
- ✅ ESLint compliance
- ✅ TypeScript compilation
- ✅ Test results

**Outputs:**
- Validation report artifact

### Job 4: Summary
**Purpose:** Generate execution summary

**Provides:**
- Execution status
- Statistics
- Next steps
- Links to artifacts

## Configuration

### Adjusting Schedule

Edit `.github/workflows/fix-all-persistent.yml`:

```yaml
schedule:
  # Every 12 hours (less frequent)
  - cron: '0 */12 * * *'
  
  # Twice daily at specific times
  - cron: '0 6,18 * * *'  # 6 AM and 6 PM UTC
  
  # Once daily
  - cron: '0 2 * * *'  # 2 AM UTC daily
  
  # Once weekly
  - cron: '0 2 * * 1'  # 2 AM UTC every Monday
```

### Adjusting Max Iterations

Default: 10 iterations per run

**Option 1: In workflow file**
```yaml
env:
  MAX_ITERATIONS: 20
```

**Option 2: At runtime**
```bash
gh workflow run fix-all-persistent.yml -f max_iterations=20
```

### Disabling Auto-PR Creation

**Option 1: In workflow file**
```yaml
inputs:
  create_pr:
    default: 'false'
```

**Option 2: At runtime**
```bash
gh workflow run fix-all-persistent.yml -f create_pr=false
```

## Emergency Procedures

### Method 1: Kill Switch (Recommended)

**Activate:**
```bash
# Update kill switch file
cat > _OPS/SAFETY/KILL_SWITCH.json << 'EOF'
{
  "removal": "HUMAN_ONLY",
  "authority": "Neo",
  "kill_switch": "ARMED",
  "behavior": "IMMEDIATE_HALT",
  "reason": "Emergency stop requested",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Commit and push
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Emergency: Activate kill switch"
git push
```

**Deactivate:**
```bash
# Update kill switch file
cat > _OPS/SAFETY/KILL_SWITCH.json << 'EOF'
{
  "removal": "HUMAN_ONLY",
  "authority": "Neo",
  "kill_switch": "DISARMED",
  "behavior": "NORMAL",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Commit and push
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Resume: Deactivate kill switch"
git push
```

### Method 2: Disable Workflow

**Via GitHub UI:**
1. Go to **Settings** → **Actions** → **General**
2. Select **Disable actions** or **Allow select actions**
3. Save

**Via GitHub CLI:**
```bash
gh workflow disable fix-all-persistent.yml
```

**Via API:**
```bash
curl -X PUT \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/fix-all-persistent.yml/disable
```

### Method 3: Delete Workflow File

```bash
git rm .github/workflows/fix-all-persistent.yml
git commit -m "Remove fix-all workflow"
git push
```

## Monitoring

### View Recent Runs

```bash
# List last 10 runs
gh run list --workflow=fix-all-persistent.yml --limit 10

# View specific run
gh run view <run-id>

# View logs for specific run
gh run view <run-id> --log
```

### Check Fix-All State

```bash
# View current state
cat _OPS/AUDIT/fix-all-state.json | jq .

# View audit log
tail -f _OPS/AUDIT/fix-all-agent.log

# Count total fixes applied
grep "✅" _OPS/AUDIT/fix-all-agent.log | wc -l
```

### Check Created PRs

```bash
# List PRs created by workflow
gh pr list --label "fix-all"

# View specific PR
gh pr view <pr-number>

# Check PR status
gh pr checks <pr-number>
```

### Check API Rate Limits

```bash
# Current rate limit status
gh api rate_limit

# Remaining API calls
gh api rate_limit --jq '.rate.remaining'

# Rate limit reset time
gh api rate_limit --jq '.rate.reset' | xargs -I {} date -d @{}
```

## Troubleshooting

### Workflow Not Running

**Symptoms:**
- No scheduled runs in Actions tab
- Workflow not appearing in list

**Solutions:**
1. Check if workflows are enabled:
   ```bash
   gh api repos/:owner/:repo/actions/permissions
   ```

2. Verify workflow file syntax:
   ```bash
   yamllint .github/workflows/fix-all-persistent.yml
   ```

3. Check for kill switch:
   ```bash
   cat _OPS/SAFETY/KILL_SWITCH.json
   ```

### No Changes Detected

**Symptoms:**
- Workflow runs but no PR created
- "No changes detected" in logs

**Possible Reasons:**
1. Repository is already clean
2. Fixes were already applied
3. No fixable issues exist

**Verification:**
```bash
# Run agent locally
node .github/agents/fix-all-agent.js

# Check git status
git status
```

### Workflow Failures

**Symptoms:**
- Red X in Actions tab
- Error messages in logs

**Common Issues:**

1. **Dependency Installation Failed**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete package-lock.json
   rm package-lock.json
   
   # Reinstall
   npm install
   ```

2. **ESLint Errors**
   ```bash
   # Check ESLint configuration
   npx eslint --print-config .
   
   # Test ESLint locally
   npx eslint . --ext .js,.jsx,.ts,.tsx
   ```

3. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --showConfig
   
   # Test compilation
   npx tsc --noEmit
   ```

### Rate Limit Exceeded

**Symptoms:**
- "API rate limit exceeded" errors
- Workflow fails with 403 errors

**Solutions:**
1. Reduce schedule frequency
2. Check current rate limit:
   ```bash
   gh api rate_limit
   ```
3. Wait for rate limit reset
4. Use GitHub App token (higher limits)

### Merge Conflicts

**Symptoms:**
- PR cannot be merged
- Conflicts with main branch

**Solutions:**
1. **Automatic:**
   - Workflow creates new PR with updated fixes
   - Close old conflicting PR

2. **Manual:**
   ```bash
   # Checkout PR branch
   gh pr checkout <pr-number>
   
   # Merge main
   git merge main
   
   # Resolve conflicts
   # ... resolve conflicts ...
   
   # Commit and push
   git commit
   git push
   ```

## Best Practices

### Initial Rollout

**Week 1: Monitoring**
- Run manually daily
- Review all PRs before merging
- Monitor logs closely
- Verify fixes are correct

**Week 2: Semi-Automatic**
- Enable scheduled runs (every 12 hours)
- Continue reviewing PRs
- Merge safe PRs (formatting, linting)

**Week 3: Automatic**
- Switch to 6-hour schedule
- Enable auto-merge for safe categories
- Spot-check PRs

**Week 4: Full Automation**
- Trust the system
- Weekly reviews only
- Focus on edge cases

### Regular Maintenance

**Daily:**
- Check for new PRs
- Monitor workflow status
- Review audit logs

**Weekly:**
- Review all merged PRs
- Check rate limit usage
- Update agent configuration if needed

**Monthly:**
- Review audit logs for patterns
- Optimize workflow schedule
- Update documentation

### Security

**DO:**
- ✅ Review security fixes manually
- ✅ Keep kill switch documented
- ✅ Monitor audit logs
- ✅ Test locally before deploying
- ✅ Use branch protection rules

**DON'T:**
- ❌ Auto-merge security PRs without review
- ❌ Disable audit logging
- ❌ Run with elevated permissions
- ❌ Skip testing after major changes
- ❌ Ignore workflow failures

## Cost Analysis

### GitHub Actions Minutes

**Free Tier:**
- 2,000 minutes/month included
- Additional minutes: $0.008/minute

**Fix-All Workflow Usage:**
- Runs: 4 times/day × 30 days = 120 runs/month
- Duration: ~10 minutes per run (average)
- Total: 120 × 10 = 1,200 minutes/month

**Result:** ✅ Fits within free tier (60% usage)

### GitHub API Calls

**Free Tier:**
- 5,000 requests/hour for authenticated requests
- 60 requests/minute

**Fix-All Workflow Usage:**
- API calls per run: ~50
- Runs per hour: 0.17 (4 per day)
- API calls per hour: ~8.5

**Result:** ✅ Well within limits (0.17% usage)

## Integration with Existing Agents

The Fix-All Workflow complements existing agents:

| Agent | Schedule | Purpose | Relationship |
|-------|----------|---------|--------------|
| **Autonomous** | Every 30 min | Light fixes | Fix-All is more comprehensive |
| **Validation** | Every hour | Check quality | Fix-All applies fixes |
| **Healing** | Every 2 hours | Fix failures | Fix-All prevents failures |
| **Fix-All** | Every 6 hours | Comprehensive fixes | Catches everything |

### Coordination

All agents:
- Respect the same kill switch
- Use the same audit system
- Create compatible PRs
- Share configuration

## Advanced Usage

### Custom Fix Stages

Edit `.github/agents/fix-all-agent.js`:

```javascript
/**
 * Stage 8: Custom Fixes
 */
function fixCustom() {
  log('\n🔧 Stage 8: Custom Fixes');
  
  const results = [];
  
  // Your custom fix logic here
  const customResult = execCommand(
    'your-custom-command',
    'Running custom fixes'
  );
  results.push({ name: 'custom', ...customResult });
  
  return results;
}
```

Then add to stages array:

```javascript
const stages = [
  // ... existing stages ...
  { name: 'custom', fn: fixCustom }
];
```

### Environment-Specific Configuration

```yaml
# .github/workflows/fix-all-persistent.yml
env:
  NODE_ENV: production
  FIX_ALL_MODE: comprehensive
  CUSTOM_SETTING: value
```

### Conditional Execution

```yaml
# Only run on specific branches
on:
  push:
    branches:
      - main
      - develop
```

```yaml
# Only run on specific events
on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, synchronize]
```

### Multi-Repository Setup

Deploy to multiple repositories:

```bash
# Copy workflow to other repos
for repo in repo1 repo2 repo3; do
  gh repo clone $org/$repo
  cd $repo
  cp ~/fix-all-persistent.yml .github/workflows/
  git add .github/workflows/fix-all-persistent.yml
  git commit -m "Add fix-all workflow"
  git push
  cd ..
done
```

## Support

### Getting Help

1. **Check Logs:**
   ```bash
   gh run view <run-id> --log
   ```

2. **Review Documentation:**
   - This guide
   - `AUTONOMOUS_AGENTS.md`
   - `.github/agents/README.md`

3. **Test Locally:**
   ```bash
   node .github/agents/fix-all-agent.js
   ```

4. **Open Issue:**
   ```bash
   gh issue create --title "Fix-All Workflow Issue" --body "Description"
   ```

### Common Questions

**Q: Will this break my code?**
A: No. It only applies safe, non-breaking fixes. All changes go through PR review.

**Q: Can I customize what gets fixed?**
A: Yes. Edit `.github/agents/fix-all-agent.js` to add/remove fix stages.

**Q: How do I stop it immediately?**
A: Activate the kill switch in `_OPS/SAFETY/KILL_SWITCH.json`.

**Q: Does it work with branch protection?**
A: Yes. It creates PRs that must pass all required checks.

**Q: Can I run it more frequently?**
A: Yes, but monitor rate limits and Actions minutes usage.

## Version History

### v1.0.0 (2026-02-11)
- Initial release
- Comprehensive fix stages
- Persistent execution
- Kill switch integration
- Audit logging
- PR automation

## License

Same as repository license (see LICENSE file).

---

**🤖 Automated by Quantum-X-Builder** | [Report Issues](https://github.com/InfinityXOneSystems/quantum-x-builder/issues)
