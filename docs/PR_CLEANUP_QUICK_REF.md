# PR Cleanup - Quick Reference

## 📊 Status Overview
- **Total PRs:** 17
- **Safe to merge immediately:** 11
- **Needs testing:** 4  
- **Should close:** 2

---

## ✅ Phase 1: Execute Immediately (11 PRs)

### Close Draft
```bash
gh pr close 20 --comment "Closing draft PR"
```

### Merge GitHub Actions (6 PRs)
```bash
# Safe workflow updates - no code impact
gh pr merge 9 --squash  # actions/checkout 4→6
gh pr merge 8 --squash  # setup-gcloud 2→3
gh pr merge 7 --squash  # upload-artifact 4→6
gh pr merge 6 --squash  # upload-pages-artifact 3→4
gh pr merge 5 --squash  # configure-pages 4→5
gh pr merge 4 --squash  # auth 2→3
```

### Merge Safe Dependencies (5 PRs)
```bash
# TypeScript, types, and small updates
gh pr merge 17 --squash  # typescript 5.8→5.9 (frontend)
gh pr merge 11 --squash  # typescript 5.6→5.9 (website)
gh pr merge 19 --squash  # @types/node 22→25
gh pr merge 18 --squash  # dotenv 16→17
gh pr merge 14 --squash  # node-cron 3→4
```

---

## 🧪 Phase 2: Test Then Merge (4 PRs)

### Run Tests
```bash
./scripts/test-major-updates.sh
```

### If Tests Pass
```bash
gh pr merge 12 --squash  # express 4→5 (CRITICAL)
gh pr merge 15 --squash  # vite 6→7
gh pr merge 10 --squash  # chokidar 3→5
gh pr merge 16 --squash  # googleapis 128→171
```

---

## ❌ Phase 3: Close with Explanation (1 PR)

```bash
# UUID requires ESM migration - use v10 instead
gh pr close 13 --comment "Deferring ESM migration. Using uuid@10.x for CommonJS compatibility."

cd backend
npm install uuid@10.0.0
git add package.json package-lock.json
git commit -m "chore(deps): bump uuid to 10.0.0 (CommonJS compatible)"
git push origin main
```

---

## 📋 Execution Checklist

- [ ] Close PR #20 (draft)
- [ ] Merge PRs #4-9 (GitHub Actions)
- [ ] Merge PRs #11, #14, #17-19 (safe deps)
- [ ] Run `./scripts/test-major-updates.sh`
- [ ] Merge PRs #10, #12, #15, #16 (if tests pass)
- [ ] Close PR #13 and install uuid@10
- [ ] Verify: `gh pr list --state open` → should be empty
- [ ] Run post-cleanup verification

---

## 🔍 Post-Cleanup Verification

```bash
# Check all PRs are closed/merged
gh pr list --state open

# Verify builds
cd backend && npm install && npm test
cd ../frontend && npm install && npm run build  
cd ../website && npm install && npm run build

# Check CI/CD status
gh run list --limit 5
```

---

## 🚨 If Something Breaks

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or use project rollback system
bash docs/auto-ops/rollback.sh <token>
```

---

## ⏱️ Time Estimates
- Phase 1: ~30 minutes
- Phase 2: ~2-3 hours (with testing)
- Total: ~3-4 hours

---

## 📚 Detailed Guide
See `docs/PR_CLEANUP_GUIDE.md` for full documentation.

---

**Last Updated:** 2026-02-09
