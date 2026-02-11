# Ultimate Fix-All - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Run via GitHub UI

1. Go to **Actions** tab
2. Click **Ultimate Fix-All Orchestrator**
3. Click **Run workflow** button
4. Click **Run workflow** (accept defaults)
5. ✅ Done! Watch it fix everything

### Run via CLI

```bash
# Simple - use defaults
gh workflow run ultimate-fix-all.yml

# Advanced - custom options
gh workflow run ultimate-fix-all.yml \
  -f max_cycles=10 \
  -f force_full_run=true
```

## 📊 What It Does

The Ultimate Fix-All Orchestrator runs **8 comprehensive stages**:

| # | Stage | Fixes |
|---|-------|-------|
| 0 | **Preflight** | Kill switch, git integrity, health check |
| 1 | **Foundation** | Git config, package.json, .gitignore |
| 2 | **Code Quality** | Prettier, ESLint, TypeScript |
| 3 | **Workflows** | Actions, permissions, agents |
| 4 | **Security** | Vulnerabilities, dependencies |
| 5 | **Documentation** | Markdown, YAML, index |
| 6 | **Testing** | Test suite, build validation |
| 7 | **Summary** | Health score, audit log, PR |

## ⏱️ How Long?

- **Minimum:** ~10 minutes (no issues found)
- **Typical:** ~15-20 minutes (normal fixes)
- **Maximum:** ~30 minutes (comprehensive cleanup)

## 🎯 When to Use

### ✅ Use It When:

- Repository health score < 80
- After major changes/refactoring
- Before important releases
- Mysterious issues appearing
- Need comprehensive cleanup

### ⏭️ Skip It When:

- Quick fix needed (use agents instead)
- Currently developing/testing
- Kill switch is active
- Only one file needs fixing

## 📈 Check Results

### During Execution

1. Go to **Actions** tab
2. Click on the running workflow
3. Watch stages complete in real-time
4. Check logs for details

### After Completion

1. View summary at bottom of workflow
2. Check `_OPS/AUDIT/ultimate-fix-all-*.md`
3. Review health score
4. Check for created PR

## 🔒 Safety Features

- ✅ **Kill Switch** - Stops immediately if activated
- ✅ **Continue-on-Error** - One failure doesn't stop others
- ✅ **Audit Logging** - Full transparency
- ✅ **Rate Limited** - Only 2x per day automatically
- ✅ **Rollback Ready** - Git history preserved

## ⚙️ Configuration Options

### `max_cycles`
- **Default:** 5
- **Range:** 1-20
- **Purpose:** How many times to retry if issues remain
- **Recommendation:** Use default unless you have persistent issues

### `force_full_run`
- **Default:** false
- **Options:** true/false
- **Purpose:** Run all stages even if no issues detected
- **Recommendation:** Use `true` for comprehensive cleanup, `false` for efficiency

### `skip_validation`
- **Default:** false
- **Options:** true/false
- **Purpose:** Skip testing stage for faster execution
- **Recommendation:** Use `false` (safer), only use `true` if time-critical

### `create_summary_pr`
- **Default:** true
- **Options:** true/false
- **Purpose:** Create PR with all fixes at the end
- **Recommendation:** Use `true` for visibility, `false` for automated merge

## 🎨 Examples

### Basic Usage

```bash
# Run with all defaults (recommended for most cases)
gh workflow run ultimate-fix-all.yml
```

### Major Cleanup

```bash
# Force full run with extra cycles
gh workflow run ultimate-fix-all.yml \
  -f max_cycles=10 \
  -f force_full_run=true
```

### Quick Validation

```bash
# Fast run without validation (not recommended for production)
gh workflow run ultimate-fix-all.yml \
  -f skip_validation=true \
  -f max_cycles=1
```

### Silent Fixes

```bash
# Fix everything without creating PR
gh workflow run ultimate-fix-all.yml \
  -f create_summary_pr=false
```

## 🔍 Troubleshooting

### "Workflow not running"

```bash
# Check kill switch
cat _OPS/SAFETY/KILL_SWITCH.json

# If active, deactivate:
echo '{"active": false}' > _OPS/SAFETY/KILL_SWITCH.json
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Deactivate kill switch"
git push
```

### "Some stages failing"

**Normal!** The workflow uses `continue-on-error`, so:
- ✅ Failures don't stop other stages
- ✅ Maximum fixes are applied
- ✅ Issues are logged for review

**Check logs:**
1. Go to Actions tab
2. Click failed workflow
3. Expand failed stage
4. Read error messages

### "Health score not improving"

Try:
```bash
# Force comprehensive cleanup
gh workflow run ultimate-fix-all.yml \
  -f force_full_run=true \
  -f max_cycles=10
```

Then check:
- Are there manual changes interfering?
- Are dependencies outdated?
- Are there test failures?

## 📊 Health Score Guide

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | ✅ Excellent | Maintain |
| 70-89 | 🟢 Good | Monitor |
| 50-69 | 🟡 Fair | Run ultimate fix-all |
| 30-49 | 🟠 Poor | Force full run |
| 0-29 | 🔴 Critical | Manual investigation + full run |

## 🔗 Quick Links

- [Full Documentation](./ULTIMATE_FIX_ALL_WORKFLOW.md)
- [Other Fix Systems](./FIX_ALL_WORKFLOW_GUIDE.md)
- [Autonomous Agents](./AUTONOMOUS_AGENTS.md)
- [Kill Switch Guide](./_OPS/SAFETY/README.md)

## 💡 Pro Tips

1. **Schedule Wisely** - Runs at 8 AM & 8 PM UTC by default
2. **Monitor Health** - Set alerts for score < 70
3. **Trust the System** - Most issues auto-resolve
4. **Manual Last** - Let automation run first
5. **Check Audit Logs** - Full history in `_OPS/AUDIT/`

## 🎓 Learn More

**New to this system?**
1. Read the [Quick Start](#🚀-get-started-in-30-seconds) (you're here!)
2. Run it once with defaults
3. Check the results
4. Read [Full Documentation](./ULTIMATE_FIX_ALL_WORKFLOW.md)
5. Customize as needed

**Advanced user?**
- Customize schedule in workflow file
- Add custom fix stages
- Integrate with monitoring
- Set up alerts

---

**Need Help?** Check [Troubleshooting](#🔍-troubleshooting) or read the [Full Guide](./ULTIMATE_FIX_ALL_WORKFLOW.md)
