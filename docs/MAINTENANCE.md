# Automated Maintenance Guide

This guide explains the automated maintenance, analysis, diagnostics, fixes, validation, optimization, and enhancement tooling for the quantum-x-builder repository.

## Overview

The maintenance system provides automated tooling to:
- **Analyze** code with linting and type checking
- **Diagnose** issues and generate reports
- **Fix** common code quality issues automatically
- **Validate** changes with tests and type checking
- **Optimize** bundle sizes and performance
- **Secure** the codebase with security scanning

## Quick Start

### Running Tools Locally

```bash
# Install dependencies first
npm install

# Run analysis (lint + typecheck + tests)
npm run analyze

# Generate diagnostic report
npm run diagnose

# Apply automated fixes
npm run fix

# Validate changes (typecheck + tests)
npm run validate

# Check bundle sizes
npm run optimize

# Run full CI pipeline
npm run ci
```

### Individual Commands

```bash
# Linting
npm run lint              # Check for lint errors
npm run lint:fix          # Auto-fix lint errors

# Formatting
npm run format            # Format all files with Prettier

# Type Checking
npm run typecheck         # Check TypeScript types

# Testing
npm run test              # Run tests with Vitest
```

## CI Workflows

### Auto-Maintenance Workflow

The `.github/workflows/auto-maintain.yml` workflow runs automatically:
- **Weekly**: Every Monday at 2 AM UTC
- **On push**: To `auto-maintenance/**` branches
- **Manual trigger**: Via GitHub Actions UI

#### Workflow Jobs

1. **Analyze**: Runs linting and type checking
2. **Diagnose**: Generates diagnostic reports
3. **Fix**: Applies automated fixes and creates PR
4. **Validate**: Runs tests and type checking
5. **Optimize**: Checks bundle sizes
6. **Security**: Runs npm audit and CodeQL

#### The Fix Job

When the fix job detects issues it can auto-fix:
1. Creates a new branch `auto-maintenance/fixes/YYYYMMDD-HHMMSS`
2. Applies ESLint auto-fixes
3. Applies Prettier formatting
4. Runs any codemods in `tools/codemods/`
5. Opens a PR with changes
6. Enables auto-merge (if configured) when checks pass

### CodeQL Security Analysis

The `.github/workflows/codeql-analysis.yml` workflow:
- Runs on push to main and PRs
- Scheduled weekly on Tuesdays
- Scans for security vulnerabilities
- Reports findings in Security tab

## Tools

### Diagnose Tool (`tools/diagnose.js`)

Collects diagnostic information:
- Lint results
- Type check results
- Test results
- Git status

Outputs: `.maintenance/diagnose-report.json`

```bash
npm run diagnose
```

### Apply Fixes Tool (`tools/apply-fixes.js`)

Applies automated fixes:
- ESLint auto-fixes
- Prettier formatting
- Custom codemods

Outputs: `.maintenance/apply-fixes-report.json`

```bash
npm run fix
```

### Optimize Tool (`tools/optimize.js`)

Analyzes bundle sizes:
- Measures build output sizes
- Compares against baseline
- Fails if size increases > 10%

Outputs: `.maintenance/optimize-report.json`

```bash
npm run optimize
```

## Configuration Files

### TypeScript (`tsconfig.json`)

Root-level TypeScript configuration with strict mode enabled:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- All recommended strict options

### ESLint (`.eslintrc.cjs`)

ESLint configuration with:
- TypeScript support
- Recommended rules
- Prettier integration
- Auto-fixable rules enabled

### Prettier (`.prettierrc`)

Prettier configuration for consistent formatting:
- Single quotes
- 2-space indentation
- 100-character line width
- Trailing commas (ES5)

### Auto-Maintenance Config (`.github/auto-maintenance.yml`)

Controls workflow behavior:
- Enable/disable specific jobs
- Auto-merge settings
- Fix PR configuration

## Opt-Out and Customization

### Disable Entire Workflow

Edit `.github/auto-maintenance.yml`:

```yaml
enabled: false
```

### Disable Specific Jobs

```yaml
jobs:
  analyze: true
  diagnose: true
  fix: false        # Disable auto-fix
  validate: true
  optimize: false   # Disable optimization
  security: true
```

### Disable Auto-Merge

```yaml
auto_merge:
  enabled: false
```

### Ignore Files

Add patterns to `.prettierignore` or `.eslintrc.cjs` `ignorePatterns`.

## Codemods

Custom codemods can be added to `tools/codemods/`:

```javascript
// tools/codemods/my-codemod.js
const { Project } = require('ts-morph');

async function runCodemod() {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
  });
  
  // Your transformation logic
  const sourceFiles = project.getSourceFiles('src/**/*.ts');
  for (const sourceFile of sourceFiles) {
    // Transform code
    sourceFile.saveSync();
  }
}

runCodemod().catch(console.error);
```

Codemods run automatically during the fix job.

## Reviewing Auto-Fix PRs

When the workflow creates a fix PR:

1. **Check the PR description** for details about changes
2. **Review the diff** to ensure all changes are safe
3. **Verify tests pass** in CI
4. **Approve or request changes** as needed
5. **Merge or close** the PR

Auto-merge will merge automatically when:
- All required checks pass
- Auto-merge is enabled in config
- Branch protections allow it

## Reverting Automation

If an auto-fix causes issues:

```bash
# Revert the PR merge commit
git revert <merge-commit-sha>

# Or reset to before the merge
git reset --hard HEAD~1

# Disable auto-fix to prevent recurrence
# Edit .github/auto-maintenance.yml:
# jobs:
#   fix: false
```

## Testing Infrastructure

Tests use **Vitest** for fast, modern testing:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test -- --ui

# Run tests with coverage
npm test -- --coverage
```

### Adding Tests

Create test files in `tests/`:

```typescript
// tests/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

## Troubleshooting

### Workflow Not Running

Check:
- Workflow is enabled in repository settings
- `.github/auto-maintenance.yml` has `enabled: true`
- Branch protections don't block workflow

### Fix Job Not Creating PR

Check:
- Workflow has `contents: write` and `pull-requests: write` permissions
- `GITHUB_TOKEN` has necessary permissions
- There are actual changes to commit

### Auto-Merge Not Working

Check:
- Auto-merge is enabled in config
- All required status checks pass
- Branch protections allow auto-merge
- Repository settings allow auto-merge

### Tests Failing

```bash
# Run tests locally to debug
npm test

# Check test output for errors
npm test -- --reporter=verbose

# Run specific test file
npm test tests/my-test.test.ts
```

## Best Practices

1. **Review all auto-fixes**: Don't blindly merge fix PRs
2. **Keep codemods simple**: Complex transformations should be manual
3. **Monitor bundle sizes**: Set up baselines and track changes
4. **Run tools locally**: Test before committing
5. **Use opt-out wisely**: Disable features that don't fit your workflow

## Support

For issues or questions:
- Check workflow logs in Actions tab
- Review `.maintenance/` directory for reports
- Open an issue in the repository
- Consult this documentation

## Additional Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
