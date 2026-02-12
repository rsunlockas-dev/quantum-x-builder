# Safe Merge Strategy - Quick Reference Card

## 🎯 ONE-PAGE GUIDE

### Before Creating a PR

```bash
./merge-gate.sh
```
✅ All 10 gates must pass before creating PR

### Creating the PR

1. Push your branch: `git push origin your-branch`
2. Create PR on GitHub
3. Wait for automated validation (13 checks)
4. All green → Ready to merge

### Merging to Main

1. All PR checks must be ✅ GREEN
2. Click "Squash and merge" (recommended) or "Merge pull request"
3. Delete your branch after merge

### After Merging

```bash
# Pull latest main
git checkout main
git pull origin main

# Run smoke tests
./smoke-test.sh

# Monitor for 30 minutes
# Watch for any errors
```

---

## 🚨 EMERGENCY ROLLBACK

If critical issues after merge:

```bash
# 1. Activate kill switch
echo '{"kill_switch":"ON","reason":"Rollback in progress"}' > _OPS/SAFETY/KILL_SWITCH.json

# 2. Get rollback tag
ROLLBACK_TAG=$(cat _OPS/ROLLBACK/latest.txt | grep "Rollback tag:" | cut -d' ' -f3)

# 3. Rollback
git reset --hard "$ROLLBACK_TAG"
git push -f origin main

# 4. Verify
./validate-integration.sh
```

---

## 📋 MERGE CHECKLIST

**Pre-Merge:**
- [ ] `./merge-gate.sh` passes
- [ ] Changes tested locally
- [ ] PR created with clear description
- [ ] All CI checks green

**Post-Merge:**
- [ ] CI passes on main
- [ ] `./smoke-test.sh` passes
- [ ] No errors in logs (30 min)
- [ ] System operating normally

---

## 🛠️ QUICK FIXES

### Lint Errors
```bash
npm run lint:fix
```

### Type Errors
```bash
npm run typecheck
# Review and fix errors
```

### Test Failures
```bash
npm test
# Fix failing tests
```

### Dependencies Issues
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 📚 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [MERGE_QUICKSTART.md](MERGE_QUICKSTART.md) | 5-minute quick start |
| [SAFE_MERGE_STRATEGY.md](SAFE_MERGE_STRATEGY.md) | Complete guide |
| [SAFE_MERGE_IMPLEMENTATION_SUMMARY.md](SAFE_MERGE_IMPLEMENTATION_SUMMARY.md) | Overview |

---

## 🔍 VALIDATION COMMANDS

```bash
# Local merge gate (before PR)
./merge-gate.sh

# Smoke tests (quick health check)
./smoke-test.sh

# Full integration validation
./validate-integration.sh

# Check CI status
gh run list --branch main --limit 1
```

---

## 🚪 SAFETY GATES

**Local (10 gates)**:
1. Kill Switch
2. Git Status
3. Dependencies
4. Lint
5. Type Check
6. Tests
7. System Manifest
8. Integration
9. Security Audit
10. Smoke Test

**CI (13 checks)**:
1. Kill Switch
2. System Manifest
3. Critical Files
4. Dependencies
5. Lint
6. Type Check
7. Tests
8. Backend
9. Frontend
10. Documentation
11. Integration
12. Security
13. Reports

---

## 💡 TIPS

✅ **DO:**
- Run `./merge-gate.sh` before every PR
- Test locally first
- Use feature branches
- Document changes
- Monitor after merge

❌ **DON'T:**
- Merge red PRs
- Skip validation
- Force push to main
- Ignore warnings
- Rush merges

---

## 📊 KEY METRICS

| Metric | Target |
|--------|--------|
| Pre-merge Pass Rate | >80% |
| Merge Success Rate | 100% |
| Time to Validation | <5 min |
| Rollback Frequency | 0/month |

---

## 🆘 COMMON ISSUES

**Issue**: Merge gate fails
**Fix**: Review output, fix issues, re-run

**Issue**: PR checks fail
**Fix**: Check CI logs, fix issues, push

**Issue**: Merge conflicts
**Fix**: `git merge origin/main`, resolve, test

**Issue**: Post-merge issues
**Fix**: Check health report, rollback if critical

---

## 🎯 SUCCESS CRITERIA

Your merge is successful when:
- ✅ All pre-merge checks passed
- ✅ PR merged without conflicts
- ✅ CI passes on main
- ✅ Smoke tests pass
- ✅ No errors in 30 minutes
- ✅ System operates normally

---

**Remember**: Safety first, always. Better to delay than break the system.

**Last Updated**: 2026-02-12 | **Version**: 1.0
