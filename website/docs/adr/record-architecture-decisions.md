# 1. Record architecture decisions

Date: 2026-02-08

## Status

Accepted

## Context

We need to record the architectural decisions made on this project to provide context for future team members and to maintain a clear history of why certain technical choices were made.

Architecture Decision Records (ADRs) are lightweight documents that capture important architectural decisions along with their context and consequences.

## Decision

We will use Architecture Decision Records (ADRs) to document significant architectural decisions in this project.

An ADR should be written whenever we make a significant decision that affects the structure, functionality, or operation of the system.

### ADR Format

Each ADR will follow this structure:

1. **Title**: Short noun phrase describing the decision
2. **Date**: When the decision was made
3. **Status**: Proposed, Accepted, Deprecated, or Superseded
4. **Context**: The issue motivating this decision and any context
5. **Decision**: The change that we're proposing or have agreed to
6. **Consequences**: What becomes easier or more difficult as a result

### ADR Naming

ADRs will be numbered sequentially and stored in the `docs/adr/` directory:

```
docs/adr/
├── 0001-record-architecture-decisions.md
├── 0002-use-docusaurus-for-documentation.md
├── 0003-implement-110-protocol-engine.md
└── ...
```

### ADR Lifecycle

1. **Proposed**: Draft ADR is created and discussed
2. **Accepted**: Decision is made and ADR is accepted
3. **Implemented**: Decision is implemented in the system
4. **Deprecated**: Decision is no longer recommended
5. **Superseded**: Replaced by a newer ADR (reference the new one)

## Consequences

### Positive

- **Transparency**: All team members can see why decisions were made
- **Onboarding**: New team members can understand the system's evolution
- **Context**: Future changes can be made with full context
- **Learning**: Team learns from past decisions
- **Communication**: Facilitates discussion about architectural choices

### Negative

- **Overhead**: Requires time to document decisions
- **Maintenance**: ADRs need to be kept up to date
- **Discipline**: Team must commit to writing ADRs consistently

### Neutral

- ADRs are stored in the documentation repository for easy access
- ADRs are written in Markdown for simplicity
- ADRs are reviewed as part of the PR process

## References

- [Documenting Architecture Decisions by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [Architecture Decision Records by ThoughtWorks](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records)

## Examples

See `docs/adr/use-docusaurus-for-documentation.md` for an example of how to document a technical decision.

---

## Template for New ADRs

When creating a new ADR, use this template:

```markdown
# [NUMBER]. [TITLE]

Date: [YYYY-MM-DD]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- List positive consequences

### Negative

- List negative consequences

### Neutral

- List neutral consequences

## References

- Links to relevant documentation, discussions, or resources
```
