#!/bin/bash
##############################################################################
# Bulk PR Closure Script
# Closes all open pull requests in the repository
# Repository: InfinityXOneSystems/quantum-x-builder
##############################################################################

set -e

REPO="InfinityXOneSystems/quantum-x-builder"
COMMENT="Bulk PR cleanup - closing unused pull requests"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            🧹 Bulk PR Closure Script                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Repository: $REPO"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Alternative: Use the GitHub web interface"
    echo "URL: https://github.com/$REPO/pulls"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

echo "🔍 Fetching open PRs from $REPO..."
echo ""

# Get all open PR numbers
PR_NUMBERS=$(gh pr list --repo "$REPO" --state open --json number --jq '.[].number' 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Error fetching PRs: $PR_NUMBERS"
    echo ""
    echo "You may not have access to this repository."
    echo "Try closing PRs via: https://github.com/$REPO/pulls"
    exit 1
fi

if [ -z "$PR_NUMBERS" ]; then
    echo "✅ No open PRs found!"
    echo ""
    echo "All PRs are already closed."
    exit 0
fi

# Show PRs to be closed
echo "📋 Open Pull Requests:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
gh pr list --repo "$REPO" --state open --json number,title,author --jq '.[] | "PR #\(.number): \(.title) (@\(.author.login))"'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count PRs
PR_COUNT=$(echo "$PR_NUMBERS" | wc -l)
echo "Found: $PR_COUNT open PR(s)"
echo ""

# Confirm action
read -p "⚠️  Close all $PR_COUNT PRs? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Cancelled. No PRs were closed."
    exit 0
fi

echo ""
echo "🚀 Starting bulk closure..."
echo ""

# Close each PR
COUNTER=0
SUCCESS=0
FAILED=0

while read -r PR_NUM; do
    COUNTER=$((COUNTER + 1))
    echo "[$COUNTER/$PR_COUNT] Closing PR #$PR_NUM..."
    
    if gh pr close "$PR_NUM" --repo "$REPO" --comment "$COMMENT" 2>&1; then
        echo "  ✅ PR #$PR_NUM closed successfully"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Failed to close PR #$PR_NUM"
        FAILED=$((FAILED + 1))
    fi
    
    # Rate limiting - be nice to GitHub API
    if [ $COUNTER -lt $PR_COUNT ]; then
        sleep 1
    fi
done <<< "$PR_NUMBERS"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Closure Complete                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  Total PRs processed: $COUNTER"
echo "  Successfully closed: $SUCCESS"
echo "  Failed to close:     $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All PRs closed successfully!"
else
    echo "⚠️  Some PRs failed to close. Check errors above."
fi

echo ""
echo "🔗 View closed PRs: https://github.com/$REPO/pulls?q=is%3Apr+is%3Aclosed"
echo ""

# Ask about branch cleanup
read -p "🧹 Delete branches from closed PRs? (yes/no): " CLEANUP

if [ "$CLEANUP" = "yes" ]; then
    echo ""
    echo "🗑️  Deleting branches from closed PRs..."
    echo ""
    
    gh pr list --repo "$REPO" --state closed --limit 50 --json number,headRefName --jq '.[] | "\(.number) \(.headRefName)"' | \
    while read pr branch; do
        if [ -n "$branch" ] && [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
            echo "  Deleting branch: $branch (from PR #$pr)"
            git push origin --delete "$branch" 2>/dev/null || echo "    ⚠️  Could not delete branch (may be already deleted or protected)"
        fi
    done
    
    echo ""
    echo "✅ Branch cleanup complete"
fi

echo ""
echo "✨ Done!"
