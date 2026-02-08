#!/bin/bash

##############################################################################
# Auto-Fix and Push Script
# Runs linters/formatters with --fix, prevents changes to forbidden paths,
# commits with rollback token if changes detected, and pushes back to PR branch.
##############################################################################

set -e

echo "🔧 Starting auto-fix process..."

# Forbidden paths that should never be modified
FORBIDDEN_PATHS=(
  "_OPS/POLICY"
  "_OPS/SAFETY/KILL_SWITCH"
  "_OPS/SAFETY/KILL_SWITCH.json"
)

# Function to check if any forbidden paths would be modified
check_forbidden_paths() {
  for path in "${FORBIDDEN_PATHS[@]}"; do
    if git diff --name-only | grep -q "^${path}"; then
      echo "❌ ERROR: Forbidden path would be modified: ${path}"
      echo "Reverting changes to forbidden paths..."
      git checkout HEAD -- "${path}"
    fi
  done
}

# Configure git bot identity
git config user.name "qxb-bot"
git config user.email "bot@infinityxonesystems.com"

# Store initial state
INITIAL_HASH=$(git rev-parse HEAD)
echo "Initial commit: $INITIAL_HASH"

# Run ESLint fix if available
if [ -f "package.json" ] && grep -q '"eslint"' package.json; then
  echo "Running ESLint with --fix..."
  npm run lint -- --fix 2>&1 || echo "ESLint not configured or errors found"
fi

# Run Prettier if available
if [ -f "package.json" ] && grep -q '"prettier"' package.json; then
  echo "Running Prettier with --write..."
  npx prettier --write . 2>&1 || echo "Prettier not configured"
fi

# Check subdirectories for linting
for dir in frontend backend website; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "Checking $dir for linters..."
    
    cd "$dir"
    
    # ESLint in subdirectory
    if grep -q '"eslint"' package.json; then
      echo "Running ESLint in $dir..."
      npm run lint -- --fix 2>&1 || echo "ESLint errors in $dir"
    fi
    
    # Prettier in subdirectory
    if grep -q '"prettier"' package.json; then
      echo "Running Prettier in $dir..."
      npx prettier --write . 2>&1 || echo "Prettier not available in $dir"
    fi
    
    cd ..
  fi
done

# Check for forbidden path modifications
check_forbidden_paths

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet; then
  echo "✅ No changes detected after auto-fix"
  exit 0
fi

# Generate rollback token
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
ROLLBACK_TOKEN="qxb-rollback-${TIMESTAMP}"

echo "📝 Changes detected, preparing commit..."

# Stage changes (excluding forbidden paths)
git add -A

# Double-check forbidden paths are not staged
for path in "${FORBIDDEN_PATHS[@]}"; do
  if git diff --cached --name-only | grep -q "^${path}"; then
    echo "⚠️ Unstaging forbidden path: ${path}"
    git reset HEAD -- "${path}"
  fi
done

# Commit with rollback token
git commit -m "auto-fix: apply automated fixes ${ROLLBACK_TOKEN}"

# Push changes back to branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing to branch: $CURRENT_BRANCH"

if git push origin "$CURRENT_BRANCH"; then
  echo "✅ Auto-fixes pushed successfully"
  echo "Rollback token: $ROLLBACK_TOKEN"
  
  # Write rollback info to audit
  mkdir -p _OPS/OUTPUT
  cat > "_OPS/OUTPUT/autofix-${TIMESTAMP}.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "rollback_token": "$ROLLBACK_TOKEN",
  "branch": "$CURRENT_BRANCH",
  "initial_commit": "$INITIAL_HASH",
  "final_commit": "$(git rev-parse HEAD)",
  "files_changed": $(git diff-tree --no-commit-id --name-only -r HEAD | jq -R . | jq -s .)
}
EOF
  
  echo "📋 Rollback info written to _OPS/OUTPUT/autofix-${TIMESTAMP}.json"
else
  echo "❌ Failed to push changes"
  exit 1
fi

exit 0
