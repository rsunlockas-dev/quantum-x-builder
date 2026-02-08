#!/bin/bash

##############################################################################
# Rollback Helper Script
# Finds commits with rollback tokens and provides guidance for creating
# revert branches and PRs. All rollbacks require human review before merge.
##############################################################################

set -e

echo "🔄 QXB Rollback Helper"
echo "===================="
echo ""

# Function to display usage
usage() {
  cat <<USAGE
Usage: $0 [options]

Options:
  -t TOKEN    Find specific rollback token (e.g., qxb-rollback-20260208T143022Z)
  -d DATE     Find rollback tokens by date (e.g., 20260208)
  -l LIMIT    Limit number of results (default: 10)
  -h          Show this help message

Examples:
  $0 -t qxb-rollback-20260208T143022Z
  $0 -d 20260208
  $0 -l 20
USAGE
  exit 1
}

# Parse arguments
TOKEN=""
DATE=""
LIMIT=10

while getopts "t:d:l:h" opt; do
  case $opt in
    t) TOKEN="$OPTARG" ;;
    d) DATE="$OPTARG" ;;
    l) LIMIT="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

# Build search query
if [ -n "$TOKEN" ]; then
  SEARCH_PATTERN="$TOKEN"
  echo "🔍 Searching for rollback token: $TOKEN"
elif [ -n "$DATE" ]; then
  SEARCH_PATTERN="qxb-rollback-$DATE"
  echo "🔍 Searching for rollback tokens on date: $DATE"
else
  SEARCH_PATTERN="qxb-rollback-"
  echo "🔍 Searching for all rollback tokens (limit: $LIMIT)"
fi

echo ""

# Find commits with rollback tokens
COMMITS=$(git log --all --grep="$SEARCH_PATTERN" --oneline --max-count="$LIMIT")

if [ -z "$COMMITS" ]; then
  echo "❌ No commits found matching pattern: $SEARCH_PATTERN"
  exit 1
fi

echo "📋 Found commits with rollback tokens:"
echo "$COMMITS"
echo ""

# If specific token, provide detailed rollback instructions
if [ -n "$TOKEN" ]; then
  COMMIT_SHA=$(echo "$COMMITS" | head -1 | awk '{print $1}')
  
  echo "📝 Rollback Instructions for $TOKEN"
  echo "======================================"
  echo ""
  echo "1. Review the commit details:"
  echo "   git show $COMMIT_SHA"
  echo ""
  echo "2. Create a revert commit:"
  echo "   git revert $COMMIT_SHA"
  echo ""
  echo "3. Create a new branch for the rollback:"
  echo "   BRANCH_NAME=rollback/revert-$TOKEN"
  echo "   git checkout -b \$BRANCH_NAME"
  echo ""
  echo "4. Push the rollback branch:"
  echo "   git push origin \$BRANCH_NAME"
  echo ""
  echo "5. Create a PR for human review:"
  echo "   gh pr create --title \"Rollback: revert $TOKEN\" \\"
  echo "     --body \"Reverting automated changes from rollback token $TOKEN. Requires human review.\""
  echo ""
  echo "⚠️  IMPORTANT: Do NOT merge without human review!"
  echo ""
  
  # Show commit details
  echo "📄 Commit Details:"
  git show --stat "$COMMIT_SHA"
else
  echo "💡 To get detailed rollback instructions for a specific commit, run:"
  echo "   $0 -t <rollback-token>"
  echo ""
  echo "Example:"
  FIRST_COMMIT=$(echo "$COMMITS" | head -1)
  FIRST_SHA=$(echo "$FIRST_COMMIT" | awk '{print $1}')
  FIRST_MSG=$(echo "$FIRST_COMMIT" | cut -d' ' -f2-)
  
  # Extract token from commit message
  EXAMPLE_TOKEN=$(echo "$FIRST_MSG" | grep -oP 'qxb-rollback-\d{8}T\d{6}Z' | head -1)
  
  if [ -n "$EXAMPLE_TOKEN" ]; then
    echo "   $0 -t $EXAMPLE_TOKEN"
  fi
fi

echo ""
echo "✅ Rollback helper completed"

exit 0
