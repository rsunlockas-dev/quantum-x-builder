#!/bin/bash
# Auto-merge and PR cleanup script
# This script merges all PRs and closes them automatically

set -e

echo "========================================="
echo "Auto-Merge and PR Cleanup Script"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

print_status "GitHub CLI is authenticated"

# Get repository info
REPO_OWNER="InfinityXOneSystems"
REPO_NAME="quantum-x-builder"
REPO_FULL="${REPO_OWNER}/${REPO_NAME}"

echo ""
echo "Repository: ${REPO_FULL}"
echo ""

# List all open PRs
print_info "Fetching open pull requests..."
PR_LIST=$(gh pr list --repo "${REPO_FULL}" --limit 100 --json number,title,headRefName --state open)
PR_COUNT=$(echo "$PR_LIST" | jq length)

if [ "$PR_COUNT" -eq 0 ]; then
    print_status "No open PRs found!"
    exit 0
fi

echo "Found ${PR_COUNT} open PRs"
echo ""

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
print_info "Current branch: ${CURRENT_BRANCH}"

# Process PR #66 (this PR) specially - merge it
THIS_PR=66
print_info "Processing PR #${THIS_PR} (current PR with all fixes)..."

if gh pr view ${THIS_PR} --repo "${REPO_FULL}" &> /dev/null; then
    echo ""
    echo "Merging PR #${THIS_PR}..."
    if gh pr merge ${THIS_PR} --repo "${REPO_FULL}" --squash --delete-branch --auto; then
        print_status "PR #${THIS_PR} set to auto-merge"
    else
        print_warning "Could not auto-merge PR #${THIS_PR} - will try manual merge"
        if gh pr merge ${THIS_PR} --repo "${REPO_FULL}" --squash --delete-branch; then
            print_status "PR #${THIS_PR} merged successfully"
        else
            print_error "Failed to merge PR #${THIS_PR}"
            print_info "You may need to merge it manually via GitHub UI"
        fi
    fi
fi

echo ""
print_info "Waiting 5 seconds for merge to complete..."
sleep 5

# Close all other PRs
echo ""
print_info "Closing all other PRs..."
echo ""

# PR #65 - Superseded by #66
if gh pr view 65 --repo "${REPO_FULL}" &> /dev/null; then
    print_info "Closing PR #65 (superseded by #66)"
    gh pr close 65 --repo "${REPO_FULL}" --comment "Superseded by PR #66 which includes all fixes and security improvements" || print_warning "Already closed or cannot close PR #65"
fi

# PRs #61, #60, #59, #58 - Duplicate codemod fixes
for PR_NUM in 61 60 59 58; do
    if gh pr view ${PR_NUM} --repo "${REPO_FULL}" &> /dev/null; then
        print_info "Closing PR #${PR_NUM} (duplicate codemod fix)"
        gh pr close ${PR_NUM} --repo "${REPO_FULL}" --comment "Duplicate - codemod integration already addressed in main branch" || print_warning "Already closed or cannot close PR #${PR_NUM}"
    fi
done

# PR #56 - Security fixes already applied
if gh pr view 56 --repo "${REPO_FULL}" &> /dev/null; then
    print_info "Closing PR #56 (security fixes already applied)"
    gh pr close 56 --repo "${REPO_FULL}" --comment "Security issues addressed in PR #66 using different approach. Files mentioned in this PR don't exist in current codebase." || print_warning "Already closed or cannot close PR #56"
fi

# PR #54 - Cannot merge (unrelated history)
if gh pr view 54 --repo "${REPO_FULL}" &> /dev/null; then
    print_info "Closing PR #54 (unmergeable - unrelated history)"
    gh pr close 54 --repo "${REPO_FULL}" --comment "Cannot merge due to unrelated Git history. Spark-inspired UI already integrated in current frontend." || print_warning "Already closed or cannot close PR #54"
fi

# PRs #53, #52 - Duplicate NL control implementations
for PR_NUM in 53 52; do
    if gh pr view ${PR_NUM} --repo "${REPO_FULL}" &> /dev/null; then
        print_info "Closing PR #${PR_NUM} (duplicate NL control)"
        gh pr close ${PR_NUM} --repo "${REPO_FULL}" --comment "Duplicate natural language control implementation" || print_warning "Already closed or cannot close PR #${PR_NUM}"
    fi
done

echo ""
print_status "PR cleanup complete!"
echo ""

# Verify no open PRs remain
REMAINING_PRS=$(gh pr list --repo "${REPO_FULL}" --limit 100 --state open | wc -l)
if [ "$REMAINING_PRS" -eq 0 ]; then
    print_status "All PRs have been closed or merged!"
else
    print_warning "${REMAINING_PRS} PRs still open (may need manual attention)"
    gh pr list --repo "${REPO_FULL}" --state open
fi

echo ""
print_info "Checking branch cleanup..."

# List branches
BRANCHES=$(git branch -r | grep -v 'HEAD' | grep -v 'main' | sed 's/origin\///' | tr -d ' ')

if [ -z "$BRANCHES" ]; then
    print_status "No remote branches to clean up"
else
    echo "Remote branches that can be deleted:"
    echo "$BRANCHES" | while read -r branch; do
        echo "  - $branch"
    done
    echo ""
    print_info "To delete these branches, run:"
    echo "  git push origin --delete <branch-name>"
    echo ""
    echo "Or delete all at once (be careful!):"
    echo "$BRANCHES" | while read -r branch; do
        echo "  git push origin --delete $branch"
    done
fi

echo ""
echo "========================================="
print_status "Script completed!"
echo "========================================="
echo ""
print_info "Next steps:"
echo "1. Verify PRs are closed: gh pr list --repo ${REPO_FULL}"
echo "2. Verify main branch is updated: git checkout main && git pull"
echo "3. Delete stale branches if needed"
echo "4. Check GitHub Pages deployment"
echo ""
