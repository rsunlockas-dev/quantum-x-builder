# Merge to Main - Quick Start Guide

## 🎯 Goal

Safely merge your changes to the main branch with zero chaos.

## ⚡ Quick Steps

### Before Creating a PR

```bash
# 1. Run the merge gate locally
./merge-gate.sh

# 2. If any issues, fix them:
npm run lint:fix              # Fix linting errors
npm run typecheck            # Check type errors
npm test                     # Run tests

# 3. Commit your fixes
git add .
git commit -m "Fix issues from merge gate"

# 4. Re-run merge gate until it passes
./merge-gate.sh

# 5. Push your branch
git push origin your-branch-name
```

### Creating the PR

1. Go to GitHub: https://github.com/InfinityXOneSystems/quantum-x-builder
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template with:
   - **Title**: Clear, descriptive title
   - **Description**: What changed and why
   - **Testing**: How you validated the changes
5. Create the PR

### After Creating the PR

1. **Wait for Automated Checks** ✅
   - Pre-merge validation will run automatically
   - All checks must be green before merging
   - Check the "Checks" tab on your PR

2. **If Checks Fail** ❌
   - Review the failed check logs
   - Fix issues in your branch
   - Push fixes (checks re-run automatically)
   - Repeat until all green

3. **When All Green** ✅
   - Request review (if needed)
   - Click "Squash and merge" or "Merge pull request"
   - Delete your branch after merge

## 🛡️ Safety Features

The system has multiple safety gates:

### Automated (No Action Required)
- ✅ Kill switch check
- ✅ Manifest validation
- ✅ Lint & type checks
- ✅ Test suite
- ✅ Component validation
- ✅ Integration validation
- ✅ Security audit

### Manual (You Control)
- 🔍 Local merge gate (`./merge-gate.sh`)
- 🔍 Smoke tests (`./smoke-test.sh`)
- 🔍 Integration validation (`./validate-integration.sh`)

## 📋 Pre-Merge Checklist

Use this checklist for every merge:

```markdown
- [ ] Ran ./merge-gate.sh and all gates passed
- [ ] Tested changes locally
- [ ] All automated checks are green on PR
- [ ] No merge conflicts
- [ ] Documentation updated (if needed)
- [ ] Ready to monitor post-merge for 30 minutes
```

## 🚨 Troubleshooting

### Issue: Merge gate fails locally

**Solution:**
```bash
# Check which gate failed and fix it
npm run lint:fix          # For lint errors
npm run typecheck        # For type errors
npm test                 # For test failures
npm install              # For dependency issues
```

### Issue: PR checks fail but local passes

**Solution:**
1. Make sure you pushed latest changes
2. Check Node.js version (should be 20)
3. Review CI logs for specific errors
4. Ensure package-lock.json is committed

### Issue: Merge conflicts

**Solution:**
```bash
# Update your branch from main
git checkout your-branch
git fetch origin
git merge origin/main

# Resolve conflicts in your editor
# Test after resolving
./merge-gate.sh

# Commit and push
git add .
git commit -m "Resolve merge conflicts"
git push origin your-branch
```

### Issue: Tests pass locally but fail in CI

**Solution:**
1. Check Node.js version matches (20)
2. Ensure all dependencies are in package.json
3. Check for environment-specific code
4. Review CI logs for the specific error

## 🎬 Complete Example

Here's a complete example workflow:

```bash
# 1. Create feature branch
git checkout -b feature/my-awesome-feature

# 2. Make your changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "Add awesome feature"

# 4. Run merge gate
./merge-gate.sh

# 5. Fix any issues
npm run lint:fix
git add .
git commit -m "Fix lint issues"

# 6. Re-run merge gate
./merge-gate.sh
# ✓ ALL GATES PASSED

# 7. Push branch
git push origin feature/my-awesome-feature

# 8. Create PR on GitHub
# - Go to repo
# - Click "New Pull Request"
# - Select your branch
# - Fill in description
# - Create PR

# 9. Wait for checks
# ✓ Pre-merge validation: PASSED
# ✓ All checks green

# 10. Merge!
# Click "Squash and merge" on GitHub

# 11. Monitor (watch for 30 min)
# Check CI on main branch
# Check for any errors

# 12. Done! 🎉
```

## 🔄 Post-Merge Monitoring

After merging, monitor for 30 minutes:

```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Run smoke tests
./smoke-test.sh

# 3. Check CI status
gh run list --branch main --limit 1

# 4. Watch for issues
# - Check GitHub Actions
# - Review _OPS/AUDIT/ logs
# - Monitor error logs

# If issues detected → See rollback procedure in SAFE_MERGE_STRATEGY.md
```

## 📚 Related Documentation

- **Full Strategy**: [SAFE_MERGE_STRATEGY.md](./SAFE_MERGE_STRATEGY.md) - Complete merge strategy guide
- **Integration**: [validate-integration.sh](./validate-integration.sh) - Integration validation script
- **Smoke Tests**: [smoke-test.sh](./smoke-test.sh) - Quick system health checks
- **Merge Gate**: [merge-gate.sh](./merge-gate.sh) - Local pre-merge validation

## 🆘 Need Help?

1. **Check Documentation**: Read SAFE_MERGE_STRATEGY.md
2. **Run Validation**: `./validate-integration.sh`
3. **Check Logs**: Review `_OPS/AUDIT/` and `_OPS/OUTPUT/`
4. **Rollback if Needed**: Follow Phase 6 in SAFE_MERGE_STRATEGY.md
5. **Activate Kill Switch**: If critical issues occur

## 💡 Tips

- ✅ **Run merge-gate.sh before every PR** - Catches issues early
- ✅ **Small, focused PRs** - Easier to review and merge
- ✅ **Test locally first** - Don't rely only on CI
- ✅ **Monitor after merge** - Catch issues quickly
- ✅ **Document changes** - Clear PR descriptions help reviewers
- ❌ **Don't merge red PRs** - All checks must be green
- ❌ **Don't rush** - Take time to validate properly
- ❌ **Don't force push to main** - Destroys history

## 🏆 Success Criteria

Your merge is successful when:

- ✅ All pre-merge validation checks passed
- ✅ PR merged without conflicts
- ✅ CI passes on main branch
- ✅ Smoke tests pass
- ✅ No errors in first 30 minutes
- ✅ System operates normally

---

**Remember**: It's better to delay a merge and validate properly than to rush and break the system. **Safety first, always.**

**Last Updated**: 2026-02-12
**Version**: 1.0
