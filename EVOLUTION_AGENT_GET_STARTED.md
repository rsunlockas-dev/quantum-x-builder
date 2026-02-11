# 🚀 Evolution Agent - Get Started in 5 Minutes

## What Is It?

The **Evolution Agent** is your autonomous code optimization system that runs at **110% protocol** to keep your codebase clean, optimized, and continuously evolving.

## Quick Facts

- 🤖 **Fully Autonomous** - No manual intervention needed
- ⏰ **Runs 4x Daily** - At 1:00, 7:00, 13:00, 19:00 UTC
- 🎯 **7 Optimization Stages** - From code cleaning to system evolution
- 🔒 **Safe** - Kill switch, rollback, audit trails
- 💰 **Free** - Runs within GitHub free tier limits

## What It Does For You

1. ✨ **Cleans Your Code** - Prettier + ESLint formatting
2. 🔄 **Removes Duplicates** - Finds and reports duplicate code
3. ⚙️ **Optimizes Workflows** - Updates and improves GitHub Actions
4. ⚡ **Boosts Performance** - Identifies and fixes bottlenecks
5. 🔒 **Hardens Security** - Automatically patches vulnerabilities
6. 📋 **Enforces Standards** - Industry best practices
7. 🧬 **Evolves System** - Continuous improvement recommendations

## How to Use

### Option 1: Let It Run (Recommended)

Just wait! The agent runs automatically 4 times per day. Check your PRs for updates.

### Option 2: Manual Trigger

```bash
# Run now
gh workflow run evolution-agent.yml

# Force run (skip prerequisites)
gh workflow run evolution-agent.yml -f force_run=true
```

## Monitoring

### Check Status
```bash
# View recent runs
gh run list --workflow=evolution-agent.yml --limit 5

# View logs
cat _OPS/AUDIT/evolution-agent.log | tail -50

# View latest report
ls -t _OPS/OUTPUT/evolution-report-*.json | head -1 | xargs cat | jq
```

### Success Indicators
- ✅ Pull requests labeled `evolution` and `110-protocol`
- ✅ Reports in `_OPS/OUTPUT/`
- ✅ Clean audit logs (no errors)
- ✅ Metrics showing improvements

## Safety Features

### Emergency Stop
```bash
# Stop the agent
echo '{"kill_switch":"ARMED","active":true}' > _OPS/SAFETY/KILL_SWITCH.json
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Emergency: Stop evolution agent"
git push

# Resume
echo '{"kill_switch":"DISARMED","active":false}' > _OPS/SAFETY/KILL_SWITCH.json
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Resume evolution agent"
git push
```

### Rollback Changes
```bash
# Find rollback point
git tag -l "evolution-*"

# Rollback
git reset --hard evolution-20260211-070000
# or
git revert <commit-hash>
```

## Understanding Results

### Evolution Report
```json
{
  "protocol": "110%",
  "metrics": {
    "filesOptimized": 42,      // Files cleaned/formatted
    "codeConsolidated": 8,     // Duplicates found
    "workflowsUpdated": 22,    // Workflows analyzed
    "performanceImproved": 5   // Improvements found
  },
  "recommendations": [
    "Implement code consolidation opportunities",
    "Apply workflow improvements"
  ]
}
```

### What Each Metric Means

- **Files Optimized** - Number of files cleaned by Prettier/ESLint
- **Code Consolidated** - Duplicate dependencies or code patterns found
- **Workflows Updated** - GitHub Actions workflows analyzed
- **Performance Improved** - Optimization opportunities identified

## Integration with Other Agents

The Evolution Agent works with your existing agent ecosystem:

```
┌─────────────────────────────────────────┐
│ Every 30 min → Autonomous Agent         │ Quick fixes
├─────────────────────────────────────────┤
│ Hourly → Validation Agent               │ Quality checks
├─────────────────────────────────────────┤
│ Every 2h → Healing Agent                │ Fix failures
├─────────────────────────────────────────┤
│ Every 6h → Fix-All Agent                │ Deep fixes
├─────────────────────────────────────────┤
│      [1 hour delay]                     │
├─────────────────────────────────────────┤
│ 4x daily → Evolution Agent ← YOU ARE HERE│ 110% optimization
└─────────────────────────────────────────┘
```

## Common Questions

### Q: Do I need to do anything?
**A:** Nope! Just review and merge the PRs it creates.

### Q: What if something breaks?
**A:** Use the rollback commands above or activate the kill switch.

### Q: Can I customize it?
**A:** Yes! Edit `.github/agents/config.json` to adjust settings.

### Q: How much does it cost?
**A:** Free! Runs within GitHub's free tier limits.

### Q: Is it safe?
**A:** Yes! It includes kill switch, rollback, and only makes safe changes.

## Next Steps

1. ✅ **Wait for first run** - Happens automatically at 1, 7, 13, or 19 UTC
2. ✅ **Review the PR** - Check what changes it made
3. ✅ **Merge if good** - Your code is now optimized!
4. ✅ **Check reports** - See what it found in `_OPS/OUTPUT/`

## Need Help?

- 📖 **Full Guide:** `EVOLUTION_AGENT_GUIDE.md`
- 📋 **Quick Ref:** `EVOLUTION_AGENT_QUICK_REF.md`
- 📊 **Implementation:** `EVOLUTION_AGENT_IMPLEMENTATION.md`
- 🔧 **Config:** `.github/agents/config.json`

## Pro Tips

💡 **Let it run for a week** - See patterns in the reports
💡 **Review consolidation opportunities** - Save time by merging duplicates
💡 **Check workflow suggestions** - Often finds easy performance wins
💡 **Monitor audit logs** - Great for debugging issues
💡 **Use force_run for testing** - Skip prerequisites when experimenting

---

**That's it!** You're now running at **110% protocol**. 🎉

**Questions?** Check the full guide or review the audit logs.

**Version:** 1.0.0 | **Protocol:** 110% | **Status:** ✅ Operational
