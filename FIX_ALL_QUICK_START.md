# Fix-All Workflow - Quick Start Guide

## 🚀 Quick Start

### Run It Now

**Option 1: GitHub UI**
1. Go to [Actions](../../actions) tab
2. Click **Fix-All Persistent Workflow**
3. Click **Run workflow** → **Run workflow**
4. Wait for completion (~10 minutes)
5. Review the PR created

**Option 2: GitHub CLI**
```bash
gh workflow run fix-all-persistent.yml
```

**Option 3: Manual Trigger via API**
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/InfinityXOneSystems/quantum-x-builder/actions/workflows/fix-all-persistent.yml/dispatches \
  -d '{"ref":"main"}'
```

## 📋 What It Does

The workflow automatically fixes:

✅ **Code Quality**
- Prettier formatting
- ESLint auto-fixes
- TypeScript errors (reports)

✅ **Documentation**
- Markdown formatting
- YAML/JSON formatting

✅ **Security**
- npm audit fixes (safe)
- Vulnerability patches

✅ **Dependencies**
- package-lock.json updates
- Dependency sync

✅ **Tests**
- Test validation

## 🔄 Automatic Execution

The workflow runs automatically:
- **Schedule:** Every 6 hours
- **Trigger:** No action required
- **Result:** PR created with all fixes

## 🛑 Emergency Stop

To stop immediately:

```bash
cat > _OPS/SAFETY/KILL_SWITCH.json << 'EOF'
{
  "kill_switch": "ARMED",
  "active": true,
  "reason": "Emergency stop"
}
EOF
git add _OPS/SAFETY/KILL_SWITCH.json
git commit -m "Emergency: Activate kill switch"
git push
```

## 📊 Monitor Progress

**Check recent runs:**
```bash
gh run list --workflow=fix-all-persistent.yml --limit 5
```

**View specific run:**
```bash
gh run view <run-id>
```

**Check created PRs:**
```bash
gh pr list --label "fix-all"
```

**View audit log:**
```bash
tail -f _OPS/AUDIT/fix-all-agent.log
```

## 🔧 Configuration

### Change Schedule

Edit `.github/workflows/fix-all-persistent.yml`:

```yaml
schedule:
  - cron: '0 */12 * * *'  # Every 12 hours
```

### Disable Auto-PR

Run with flag:
```bash
gh workflow run fix-all-persistent.yml -f create_pr=false
```

### Adjust Max Iterations

Run with custom limit:
```bash
gh workflow run fix-all-persistent.yml -f max_iterations=20
```

## ❓ Common Questions

**Q: Is it safe?**
A: Yes. Only applies non-breaking changes. All changes go through PR review.

**Q: Will it cost money?**
A: No. Designed to stay within GitHub's free tier.

**Q: Can I customize what gets fixed?**
A: Yes. Edit `.github/agents/fix-all-agent.js`.

**Q: How do I disable it?**
A: Activate kill switch or disable workflow in Actions settings.

## 📚 Full Documentation

See [FIX_ALL_WORKFLOW_GUIDE.md](./FIX_ALL_WORKFLOW_GUIDE.md) for complete documentation.

## 🆘 Need Help?

1. Check logs: `gh run view <run-id> --log`
2. Test locally: `node .github/agents/fix-all-agent.js`
3. Review guide: [FIX_ALL_WORKFLOW_GUIDE.md](./FIX_ALL_WORKFLOW_GUIDE.md)
4. Open issue: `gh issue create`

---

**🤖 Powered by Quantum-X-Builder Autonomous System**
