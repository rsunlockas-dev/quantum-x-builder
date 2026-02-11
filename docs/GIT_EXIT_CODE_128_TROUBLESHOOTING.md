# Git Exit Code 128 Troubleshooting Guide

## Quick Reference

**Error Message:**
```
The process '/usr/bin/git' failed with exit code 128
```

**Workflow:** `require-rehydrate.yml` (Enforce Rehydrate Before Implementation)

## Understanding the Error

Git exit code 128 is a generic error indicating a git command failed. In the context of the `require-rehydrate.yml` workflow, it typically means:

1. A git tag or commit reference cannot be found
2. Git repository is in an inconsistent state
3. Shallow clone doesn't have the required history

## Root Cause for quantum-x-builder

### The Issue

The workflow validates that the baseline tag `qxb-phase5-lock-2026-02-06` exists and points to the correct commit:

```bash
TAG_NAME="qxb-phase5-lock-2026-02-06"
EXPECTED_COMMIT="5c74904882ef8989c76754e34d52ccf71e34db85"

if ! git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
  echo "❌ ERROR: Tag $TAG_NAME does not exist"
  exit 1
fi
```

### Why It Happens

The workflow can fail with exit code 128 if:

**Scenario 1: Shallow Clone**
- Default GitHub Actions checkout uses `fetch-depth: 1` (shallow clone)
- Shallow clones don't fetch tags or full history
- The tag cannot be resolved → exit code 128

**Scenario 2: Tag Not Fetched**
- Tags are not automatically fetched with commits
- Even with `fetch-depth: 0`, tags may need explicit fetch
- The tag exists on remote but not locally → exit code 128

**Scenario 3: Grafted Repository**
- The repo was grafted, cutting off old history
- Tag points to a commit that's before the graft point
- Commit is not accessible → exit code 128 (though the tag itself exists)

## Current Solution

The workflow is configured with `fetch-depth: 0` to fetch full history:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Fetch all history and tags
    token: ${{ secrets.GIT_PAT || github.token }}
```

### Verification

The tag should now be accessible:

```bash
# Check if tag exists locally
git tag -l "qxb-phase5-lock-2026-02-06"

# Check if tag exists on remote
git ls-remote --tags origin | grep qxb-phase5-lock-2026-02-06

# Dereference the tag to get the commit
git rev-parse qxb-phase5-lock-2026-02-06^{}

# Expected output:
# 5c74904882ef8989c76754e34d52ccf71e34db85
```

## Tag Details

**Tag Information:**
- **Name**: `qxb-phase5-lock-2026-02-06`
- **Type**: Annotated tag
- **Target Commit**: `5c74904882ef8989c76754e34d52ccf71e34db85`
- **Message**: "Phase 5 Lock - Authoritative baseline for Phase 5 post-lock work (2026-02-06)"
- **Purpose**: Stable baseline for Phase 5 autonomous operations and rollback reference

**Tag Structure:**
```
Tag Object:     bd3ff016932406a5726d99c5d996b2f2a66415ec
Target Commit:  5c74904882ef8989c76754e34d52ccf71e34db85
```

## Manual Verification Steps

### Step 1: Verify Tag Exists on Remote

```bash
git ls-remote --tags origin qxb-phase5-lock-2026-02-06
# Expected output:
# bd3ff016932406a5726d99c5d996b2f2a66415ec  refs/tags/qxb-phase5-lock-2026-02-06
# 5c74904882ef8989c76754e34d52ccf71e34db85  refs/tags/qxb-phase5-lock-2026-02-06^{}
```

### Step 2: Fetch All Tags

```bash
git fetch origin --tags
```

### Step 3: Verify Tag Locally

```bash
git tag -l "qxb-phase5-lock-2026-02-06"
# Expected output: qxb-phase5-lock-2026-02-06
```

### Step 4: Check Target Commit

```bash
git rev-parse qxb-phase5-lock-2026-02-06^{}
# Expected output: 5c74904882ef8989c76754e34d52ccf71e34db85
```

### Step 5: Verify Commit Exists in History

```bash
git log --oneline --graph --all | grep 5c74904
# Should show the commit in the graph
```

## Workflow Behavior

### Success Case

When the workflow runs successfully:

```
✅ Tag qxb-phase5-lock-2026-02-06 exists
   Points to commit: 5c74904882ef8989c76754e34d52ccf71e34db85
✅ Rehydration snapshot present
```

### Warning Case (Different Commit)

If the tag points to a different commit than expected:

```
✅ Tag qxb-phase5-lock-2026-02-06 exists
   Points to commit: <actual-commit>
⚠️  WARNING: Tag points to different commit than expected
   Expected: 5c74904882ef8989c76754e34d52ccf71e34db85
   Actual:   <actual-commit>
   Please verify the baseline commit is correct for rollback operations.
```

### Failure Case (Tag Missing)

If the tag doesn't exist:

```
❌ ERROR: Tag qxb-phase5-lock-2026-02-06 does not exist
   This tag is required for Phase 5 rollback operations.
   Expected commit: 5c74904882ef8989c76754e34d52ccf71e34db85
   
   To create the tag manually:
   git tag -a qxb-phase5-lock-2026-02-06 5c74904882ef8989c76754e34d52ccf71e34db85 -m 'Phase 5 Lock'
   git push origin qxb-phase5-lock-2026-02-06
```

## Common Issues and Solutions

### Issue 1: "fatal: ambiguous argument"

**Error:**
```
fatal: ambiguous argument 'qxb-phase5-lock-2026-02-06': unknown revision or path not in the working tree.
```

**Solution:**
```bash
# Fetch tags explicitly
git fetch origin --tags

# Verify fetch-depth in workflow
# Make sure it's set to 0, not 1
```

### Issue 2: "bad object"

**Error:**
```
fatal: bad object 5c74904882ef8989c76754e34d52ccf71e34db85
```

**Cause:** The commit exists as a tag target but is not in the repository's grafted history.

**Solution:** This is expected due to grafting. The tag exists and is valid; the error can be ignored as long as `git rev-parse <tag>^{}` works.

### Issue 3: Shallow Clone

**Error:**
```
fatal: reference is not a tree: qxb-phase5-lock-2026-02-06
```

**Solution:**
Ensure `fetch-depth: 0` is set in the workflow checkout:
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

## Related Files

- **Workflow**: `.github/workflows/require-rehydrate.yml`
- **Status File**: `_OPS/_STATE/PHASE5_STATUS.json`
- **Documentation**: `docs/fixes/GIT_EXIT_CODE_128_FIX.md`
- **Rollback Plan**: `_OPS/ROLLBACK/ROLLBACK_PLAN.json`
- **Phase 5 Summary**: `PHASE5_IMPLEMENTATION_SUMMARY.md`

## Governance Context

This tag is part of Phase 5 governance:

**Purpose:**
- Establishes an authoritative baseline for Phase 5
- Enables safe rollback if autonomous operations fail
- Provides a known-good state for recovery

**Security:**
- Workflow uses read-only permissions (`contents: read`)
- Cannot auto-create or modify tags during PR checks
- Requires manual intervention if tag is missing

**Immutability:**
- Tag should never be moved or deleted
- Rollback operations depend on its stability
- Changes require human authorization (Neo)

## FAQ

### Q: Can the workflow auto-create the tag if missing?

**A:** No. The workflow uses read-only permissions and validates the tag exists. This is intentional for security and governance. Tags must be created manually with proper authorization.

### Q: What if the tag points to the wrong commit?

**A:** The workflow will show a warning but won't fail. Human review is required to determine if the tag needs to be recreated. Contact Neo for authorization.

### Q: Why does the commit hash differ from historical references?

**A:** The repository was grafted, removing old history. The commit `5c74904` is the grafted base. Historical references like `bf78a9e` from before grafting are no longer accessible but are documented for audit purposes.

### Q: How do I test the workflow locally?

**A:**
```bash
# Simulate the workflow check
TAG_NAME="qxb-phase5-lock-2026-02-06"
EXPECTED_COMMIT="5c74904882ef8989c76754e34d52ccf71e34db85"

if ! git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
  echo "❌ ERROR: Tag $TAG_NAME does not exist"
  exit 1
fi

ACTUAL_COMMIT=$(git rev-parse "$TAG_NAME^{}")
echo "✅ Tag $TAG_NAME exists"
echo "   Points to commit: $ACTUAL_COMMIT"

if [ "$ACTUAL_COMMIT" != "$EXPECTED_COMMIT" ]; then
  echo "⚠️  WARNING: Tag points to different commit than expected"
fi
```

## Monitoring

### Check Workflow Status

```bash
# Using GitHub CLI
gh run list --workflow=require-rehydrate.yml --limit 5

# Check specific run
gh run view <run-id>

# Download logs
gh run download <run-id>
```

### Check Tag Status Programmatically

```bash
# List all qxb tags
git tag -l "qxb-*"

# Show tag details
git show qxb-phase5-lock-2026-02-06

# Verify tag signature (if signed)
git tag -v qxb-phase5-lock-2026-02-06
```

---

**Last Updated**: 2026-02-11  
**Status**: Tag exists and workflow operational  
**Baseline Commit**: `5c74904882ef8989c76754e34d52ccf71e34db85`
