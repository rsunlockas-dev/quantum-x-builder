# Quantum-X-Builder – Copilot Instructions

Quantum-X-Builder is a governed, AI-assisted enterprise system for orchestrating code, infrastructure, and validation pipelines using GitHub Apps, self-hosted runners, and policy-enforced agents. The repository operates under Phase 5 autonomy with active guardrails and the 110% Protocol standards.

## Repository Overview

This is a monorepo containing:
- **Backend** - Express API server (Node.js with ES modules) on port 8787
- **Frontend** - React application with VSCode extension
- **Website** - Docusaurus v3 documentation site
- **Autonomous Agents** - Multi-agent system for maintenance and code quality
- **Operations** - `_OPS/` governance control plane with PAT (Policy-Authority-Truth) system

## Core Standards (110% Protocol)

All code must meet these standards:
- **Code Quality**: A+ grade
- **Performance**: 110% benchmark
- **Reliability**: 99.99% uptime
- **Best Practices**: Industry-standard
- **Failure Rate**: 0%
- **Security**: Zero vulnerabilities in new code

## Build, Test & Validate

### Quick Commands

```bash
# Formatting
npm run format              # Format with Prettier

# Linting
npm run lint               # Check ESLint (max-warnings=0)
npm run lint:fix           # Auto-fix ESLint issues

# Type Checking
npm run typecheck          # TypeScript type check (no emit)

# Testing
npm test                   # Run Vitest tests (vitest run)

# Full Validation
npm run analyze            # Run lint + typecheck + test
npm run validate           # Run typecheck + test
npm run ci                 # Full CI check (analyze + validate)

# Documentation
npm run docs:install       # Install website dependencies
npm run docs:start         # Start Docusaurus dev server
npm run docs:build         # Build documentation site
```

### Backend-Specific Commands

```bash
cd backend
npm run dev                # Start with hot-reload (--watch)
npm start                  # Start production server
```

### Frontend-Specific Commands

```bash
cd frontend
npm run dev                # Start Vite dev server
npm run build              # Build for production
npm run preview            # Preview production build
```

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Avoid `any` types (use `unknown` or proper types)
- Prefer explicit return types for public functions
- Use `_` prefix for intentionally unused variables

### JavaScript/Node.js
- **Backend uses ES modules** (`"type": "module"` in package.json)
- Use modern ES2022+ syntax
- Use `import/export` syntax (not `require`)
- Prefer `const` over `let`, never use `var`
- Allow console.log in Node.js tools and services

### Code Style
- Use Prettier for formatting (configuration in `.prettierrc`)
- Follow ESLint rules (configuration in `.eslintrc.cjs`)
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line structures

### Testing
- Use **Vitest** for testing (NOT Jest)
- Place tests in `tests/**/*.{test,spec}.{js,ts}`
- Use descriptive test names
- Follow existing test patterns in the repository
- Ensure tests are isolated and independent
- Aim for meaningful test coverage on new code

## Repository Structure

```
quantum-x-builder/
├── .github/              # GitHub configs, workflows, autonomous agents
│   ├── agents/          # Autonomous agent system
│   │   ├── autonomous-agent.js    (runs every 30 min)
│   │   ├── validation-agent.js    (runs hourly)
│   │   ├── healing-agent.js       (runs every 2 hours)
│   │   ├── fix-all-agent.js       (runs every 6 hours)
│   │   └── config.json            (agent configuration)
│   └── workflows/       # GitHub Actions workflows
├── _OPS/                # Operations & governance control plane
│   ├── POLICY/          # Governance policies (DO NOT MODIFY)
│   ├── SAFETY/          # Kill switch and safety controls
│   ├── COMMANDS/        # Autonomous command queue
│   ├── OUTPUT/          # Agent execution results
│   └── AUDIT/           # Audit logs and evidence
├── backend/             # Express API server (ES modules)
│   ├── src/            # Source code
│   └── package.json    # "type": "module"
├── frontend/            # React app with VSCode extension
│   ├── src/            # Source code
│   ├── App.tsx         # Main React component
│   └── vscode-extension/ # VSCode extension
├── website/             # Docusaurus documentation
├── docs/                # Documentation markdown files
├── tests/               # Vitest test files
└── tools/               # Development and maintenance tools
```

## Autonomous Agent System

The repository has **4 autonomous agents** that maintain code quality 24/7:

1. **Autonomous Agent** (every 30 min) - Quick fixes and maintenance
2. **Validation Agent** (hourly + on PRs) - Quality checks
3. **Healing Agent** (every 2 hours) - Fix failing checks
4. **Fix-All Agent** (every 6 hours) - Comprehensive fixes and PRs

**Key Points:**
- Agents run ~88 times/day (stays within GitHub free tier)
- All agents respect the kill switch at `_OPS/SAFETY/KILL_SWITCH.json`
- Agents create rollback tokens for easy revert
- Logs are stored in `_OPS/AUDIT/`
- Configuration in `.github/agents/config.json`

## Safety Guardrails & Policies

### Kill Switch
- Located at `_OPS/SAFETY/KILL_SWITCH.json`
- When `{"active": true}`, all agents halt immediately
- Authority: Neo (human oversight)
- Removal: HUMAN_ONLY

### Forbidden Actions (HARD STOP)
- **DO NOT** modify `_OPS/POLICY/` directory
- **DO NOT** remove guardrails or kill-switch
- **DO NOT** rewrite Git tags
- **DO NOT** deploy to production without approval
- **DO NOT** change autonomy state
- **DO NOT** modify `.github/agents/` without explicit permission

### PAT Governance (Policy-Authority-Truth)
- All write actions must be PAT-gated
- Evidence is mandatory for changes
- Autonomy is opt-in and revocable
- No destructive automation without safeguards

## Development Workflow

### Repository-Scoped Changes Policy

When proposing changes to repository files (including CI, tooling, or repository instruction files), the Copilot agent MUST:

1. Create a new feature branch in this repository (naming convention: `copilot/automerge/<short-description>`).
2. Commit the proposed changes to that branch.
3. Push the branch to the repository remote.
4. Open a pull request against the repository default branch with a clear, descriptive title and body describing:
   - What changed
   - Why it changed
   - How to test and validate
   - Any non-obvious safety constraints (e.g., non-destructive by default)
5. Mark the PR as WIP/ready according to the repository norms, and include any requested labels used for automation.

**Important Notes:**
- The agent SHOULD NOT instruct maintainers to apply patches locally or perform manual git apply steps as the primary workflow; the PR-based flow is the canonical path.
- If the agent needs additional input (secrets, elevated permissions, or decisions altering policy), it must ask explicitly in the PR or the conversation before pushing.
- The agent must follow existing repository CONTRIBUTING.md or governance files — this instruction augments them only where the repo lacks explicit guidance.

**Safety Requirements:**
- The Copilot agent must ensure proposed code or automation changes are non-destructive by default. If a change could modify many files, the agent must document the risk clearly in the PR description and keep modifications disabled by default (e.g., codemod transformations commented out).
- The agent must avoid making policy changes that remove human review requirements without explicit human approval.

### Making Changes
1. Create a feature branch from `main`
2. Make minimal, focused changes
3. Run `npm run format` before committing
4. Run `npm run lint:fix` to fix linting issues
5. Run `npm run typecheck` to check types
6. Run `npm test` to verify tests pass
7. Run `npm run ci` for full validation before PR
8. Include rollback notes in commit messages
9. Update documentation in `docs/` if applicable

### Code Review Standards
- All PRs require review before merge
- Automated agents may auto-fix safe categories:
  - Formatting (Prettier)
  - Lint auto-fixes (ESLint --fix)
  - Patch-level dependency updates
- Breaking changes require manual review
- Security issues require manual review

### Documentation
- Documentation files are in `docs/` directory
- Use Markdown format
- Follow existing documentation structure
- Update relevant docs when changing features
- Run `npm run docs:start` to preview changes

## Security

- Run `npm audit` before adding dependencies
- Zero tolerance for high/critical vulnerabilities in new code
- Use `npm audit fix` (without `--force`) for safe fixes
- Security issues are logged to `_OPS/AUDIT/`
- CodeQL scanning runs on all PRs

## Emergency Procedures

If something goes wrong:
1. Check `_OPS/SAFETY/KILL_SWITCH.json` - activate if needed
2. Review logs in `_OPS/AUDIT/`
3. Use rollback tokens from audit logs
4. See `docs/auto-ops/rollback.sh` for rollback procedures
5. Contact Neo (human authority) for policy changes

## Dependencies

- **Package Manager**: npm (with lock files)
- Root `package-lock.json` required for CI caching
- Backend has separate `package-lock.json`
- Frontend has separate `package-lock.json`
- Website has separate `package-lock.json`

## Monorepo Notes

- Root package.json manages global dev dependencies
- Each component (backend, frontend, website) has own package.json
- Shared TypeScript config at root level
- Component-specific configs inherit from root

## Key Principles

1. **Minimal Changes**: Make the smallest possible changes to achieve the goal
2. **Evidence-Based**: All changes must have audit trails
3. **Safety First**: Respect guardrails and policies
4. **Quality Standards**: Meet 110% Protocol benchmarks
5. **Autonomous-Friendly**: Support the multi-agent system
6. **Rollback-Ready**: Include rollback information in all changes
7. **Test-Driven**: Validate changes with tests

## Additional Resources

- [README.md](../README.md) - Repository overview
- [AUTONOMOUS_AGENTS.md](../AUTONOMOUS_AGENTS.md) - Agent system guide
- [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
- [docs/RUNBOOK.md](../docs/RUNBOOK.md) - Operational procedures
- [FIX_ALL_WORKFLOW_GUIDE.md](../FIX_ALL_WORKFLOW_GUIDE.md) - Fix-All agent guide
- `.github/agents/README.md` - Agent documentation

## Questions?

If any ambiguity exists: **STOP and WAIT** for clarification. Human authority (Neo) has final say on all policy and governance decisions.
