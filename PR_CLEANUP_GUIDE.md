# PR Cleanup Execution Guide

## Quick Summary
**Total Open PRs:** 17  
**Recommended Actions:**
- Close: 1 PR
- Merge safely: 11 PRs  
- Test then merge: 5 PRs

---

## Phase 1: Immediate Actions (Safe to Execute Now)

### Step 1.1: Close Draft PR
```bash
# PR #20 has no code changes, just description update
gh pr close 20 --comment "Closing draft PR - no code changes needed"
```

### Step 1.2: Merge GitHub Actions Updates (6 PRs)
These are safe workflow updates with no breaking changes:

```bash
# Merge in sequence (newest to oldest to avoid conflicts)
gh pr merge 9 --auto --squash --subject "chore(deps): bump actions/checkout from 4 to 6"
gh pr merge 8 --auto --squash --subject "chore(deps): bump google-github-actions/setup-gcloud from 2 to 3"
gh pr merge 7 --auto --squash --subject "chore(deps): bump actions/upload-artifact from 4 to 6"
gh pr merge 6 --auto --squash --subject "chore(deps): bump actions/upload-pages-artifact from 3 to 4"
gh pr merge 5 --auto --squash --subject "chore(deps): bump actions/configure-pages from 4 to 5"
gh pr merge 4 --auto --squash --subject "chore(deps): bump google-github-actions/auth from 2 to 3"
```

### Step 1.3: Merge Safe Dependency Updates (5 PRs)

```bash
# TypeScript updates (minor versions, safe)
gh pr merge 17 --auto --squash --subject "chore(deps-dev): bump typescript from 5.8.3 to 5.9.3 in /frontend"
gh pr merge 11 --auto --squash --subject "chore(deps-dev): bump typescript from 5.6.3 to 5.9.3 in /website"

# Types update (dev dependency, safe)
gh pr merge 19 --auto --squash --subject "chore(deps-dev): bump @types/node from 22.19.8 to 25.2.2 in /frontend"

# Dotenv update (environment variable loader, backward compatible)
gh pr merge 18 --auto --squash --subject "chore(deps): bump dotenv from 16.6.1 to 17.2.4 in /backend"

# Node-cron update (scheduler, likely backward compatible)
gh pr merge 14 --auto --squash --subject "chore(deps): bump node-cron from 3.0.3 to 4.2.1 in /backend"
```

**Progress after Phase 1:** 12 of 17 PRs cleared ✅

---

## Phase 2: Breaking Changes - Requires Testing

### ⚠️ PR #12: Express 4→5 (CRITICAL)

**Breaking Changes:**
- `res.send()` now sends proper content-type headers
- `req.query` no longer supports extended parser by default
- `app.router` removed (use `app` directly)
- `res.json()` and `res.jsonp()` behavior changes

**Migration Steps:**
1. Review [Express 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
2. Check all middleware and route handlers
3. Test authentication flows
4. Test API endpoints

**Testing Required:**
```bash
# Before merging, test locally:
cd backend
npm install express@5.2.1
npm test  # Run your test suite
npm start # Manual verification
```

**Decision:**
- ✅ MERGE if all tests pass
- ❌ DEFER if issues found - document in issue

```bash
# Only if tests pass:
gh pr merge 12 --auto --squash --subject "chore(deps): bump express from 4.22.1 to 5.2.1 in /backend"
```

---

### ⚠️ PR #13: UUID 9→13 (ESM Breaking Change)

**Breaking Changes:**
- Package is now ESM-only (no CommonJS)
- Requires `import { v4 as uuidv4 } from 'uuid'` syntax
- May need to update `package.json` to include `"type": "module"`

**Code Changes Required:**
```javascript
// Old (CommonJS):
const { v4: uuidv4 } = require('uuid');

// New (ESM):
import { v4 as uuidv4 } from 'uuid';
```

**Search for uuid usage:**
```bash
grep -r "require.*uuid" backend/
grep -r "from.*uuid" backend/
```

**Decision:**
- ⚠️ DEFER - Requires code refactoring
- Create issue: "Migrate to ESM for uuid package"
- Consider using uuid@10.x (supports both) as intermediate step

```bash
# Recommended: Close this PR and use uuid@10.x instead
gh pr close 13 --comment "Deferring ESM migration. Using uuid@10.x for CommonJS compatibility."

# Then manually update:
cd backend
npm install uuid@10.0.0
```

---

### ⚠️ PR #15: Vite 6→7

**Breaking Changes:**
- Configuration file updates
- Plugin API changes
- Build output structure modifications

**Testing Required:**
```bash
cd frontend
npm install vite@7.3.1
npm run build  # Check for build errors
npm run dev    # Check dev server
```

**Decision:**
- ✅ MERGE if build and dev server work
- ❌ DEFER if breaking changes affect build

```bash
# Only if tests pass:
gh pr merge 15 --auto --squash --subject "chore(deps-dev): bump vite from 6.4.1 to 7.3.1 in /frontend"
```

---

### ⚠️ PR #10: Chokidar 3→5

**Breaking Changes:**
- Node.js 14+ required
- Some event handling changes
- Performance improvements

**Testing Required:**
```bash
cd backend
npm install chokidar@5.0.0
# Test file watching functionality
npm test
```

**Decision:**
- ✅ MERGE if file watching tests pass
- ❌ DEFER if issues with file watch events

```bash
# Only if tests pass:
gh pr merge 10 --auto --squash --subject "chore(deps): bump chokidar from 3.6.0 to 5.0.0 in /backend"
```

---

### ⚠️ PR #16: googleapis 128→171

**Breaking Changes:**
- API changes across many Google services
- Authentication flow updates possible
- Method signature changes

**Testing Required:**
```bash
cd backend
npm install googleapis@171.4.0
# Test Google Calendar integration
npm test -- google-calendar
```

**Decision:**
- ✅ MERGE if Google integrations still work
- ❌ DEFER and test thoroughly - create issue for proper testing

```bash
# Only if Google Calendar and other integrations work:
gh pr merge 16 --auto --squash --subject "chore(deps): bump googleapis from 128.0.0 to 171.4.0 in /backend"
```

---

## Execution Summary

### Recommended Order:

1. **Execute Now (Zero Risk):**
   ```bash
   gh pr close 20
   ```

2. **Execute Now (Low Risk) - 11 PRs:**
   ```bash
   # GitHub Actions (6 PRs)
   gh pr merge 9 8 7 6 5 4 --auto --squash
   
   # Safe Dependencies (5 PRs)
   gh pr merge 17 11 19 18 14 --auto --squash
   ```

3. **Test Locally Then Merge (High Risk) - 5 PRs:**
   - Test Express 5 migration (#12)
   - Test Vite 7 build (#15)
   - Test Chokidar 5 file watching (#10)
   - Test googleapis integration (#16)
   - **DEFER uuid ESM migration** (#13) - use intermediate version

### Final Status Projection:
- **Closed:** 2 PRs (#20, #13)
- **Merged:** 15 PRs (after testing)
- **Total Cleared:** 17 of 17 ✅

---

## Rollback Plan

If any merge causes issues:

```bash
# Identify the problematic commit
git log --oneline -20

# Revert specific PR merge
git revert <commit-hash>
git push origin main

# Or use the project's rollback system
bash docs/auto-ops/rollback.sh <rollback-token>
```

---

## Post-Cleanup Verification

After all merges:

```bash
# Verify builds
cd backend && npm install && npm test
cd frontend && npm install && npm run build
cd website && npm install && npm run build

# Check CI/CD
gh run list --limit 5

# Verify no new issues
gh issue list --state open
```

---

## Notes

- All Dependabot PRs were created on 2026-02-08
- PRs are blocking further Dependabot updates
- Clearing these enables future automatic security updates
- Consider enabling auto-merge for Dependabot in the future

---

**Created:** 2026-02-09  
**Status:** Ready for execution  
**Estimated Time:** 30 minutes (Phase 1) + 2-3 hours (Phase 2 testing)
