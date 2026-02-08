# Documentation Style Guide

This style guide ensures consistency and quality across all Quantum X Builder documentation.

## General Principles

1. **Clarity**: Write clearly and concisely
2. **Consistency**: Follow established patterns
3. **Completeness**: Provide all necessary information
4. **Accuracy**: Ensure technical accuracy
5. **Accessibility**: Make content accessible to all readers

## Document Structure

### Frontmatter

All documentation files must include frontmatter:

```yaml
---
sidebar_position: 1
title: Optional Custom Title
---
```

- Use `sidebar_position` to control ordering
- Title defaults to the h1 heading if not specified

### Headings

- **H1** (`#`): Page title (one per page)
- **H2** (`##`): Major sections
- **H3** (`###`): Subsections
- **H4-H6**: Use sparingly for deep hierarchy

```markdown
# Page Title

## Major Section

### Subsection

#### Minor Point
```

**Rules**:
- Don't skip heading levels
- Use sentence case for headings
- Keep headings concise

### Table of Contents

Docusaurus automatically generates ToC from H2 and H3 headings. Structure your headings accordingly.

## Writing Style

### Voice and Tone

- **Active voice**: "The system processes requests" not "Requests are processed by the system"
- **Present tense**: "The function returns" not "The function will return"
- **Direct**: Address the reader as "you"
- **Professional but approachable**: Explain complex topics clearly

### Formatting

#### Emphasis

- **Bold** (`**text**`): Important terms, UI elements
- *Italic* (`*text*`): Slight emphasis, first use of terms
- `Code` (`` `text` ``): Code, commands, file names

#### Lists

**Unordered lists** for items without sequence:
```markdown
- First item
- Second item
- Third item
```

**Ordered lists** for sequential steps:
```markdown
1. First step
2. Second step
3. Third step
```

#### Links

- Use descriptive link text: `[Contributing Guide](./contributing.md)`
- Not: `[Click here](./contributing.md)`
- For external links, consider adding an indicator

#### Code Blocks

Always specify the language:

````markdown
```typescript
const config: Config = {
  title: 'Quantum X Builder',
};
```
````

Common languages:
- `typescript`, `javascript`, `jsx`, `tsx`
- `bash`, `shell`
- `json`, `yaml`
- `python`, `go`, `rust`
- `markdown`

#### Tables

Use tables for structured data:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

- Keep tables simple
- Use headers for all columns
- Align text logically

## Content Types

### Tutorials

Structure:
1. **Introduction**: What will be learned
2. **Prerequisites**: What's needed
3. **Steps**: Numbered sequential steps
4. **Verification**: How to confirm success
5. **Next Steps**: What to do next

### Guides

Structure:
1. **Overview**: What this guide covers
2. **Sections**: Organized by topic
3. **Examples**: Practical examples
4. **Best Practices**: Recommendations

### Reference

Structure:
1. **Description**: What it is/does
2. **Parameters/Properties**: Detailed specifications
3. **Return Values**: What it returns
4. **Examples**: Usage examples
5. **Related**: Links to related content

### API Documentation

Include:
- **Endpoint**: URL and HTTP method
- **Description**: What it does
- **Parameters**: Request parameters
- **Request Body**: Schema and examples
- **Response**: Response schema and examples
- **Error Codes**: Possible errors
- **Examples**: Complete examples

## Special Elements

### Admonitions

Use Docusaurus admonitions for special content:

```markdown
:::note
This is a note
:::

:::tip
This is a helpful tip
:::

:::info
This is informational
:::

:::caution
This is a caution
:::

:::danger
This is a warning
:::
```

### Code Examples

- Provide complete, runnable examples
- Include comments for clarity
- Show expected output
- Highlight important lines if needed

### Screenshots

- Use high-quality images
- Include alt text: `![Alt description](image.png)`
- Store in `static/img/` directory
- Annotate important elements

## Technical Writing

### Terminology

- **Consistent**: Use the same term for the same concept
- **Standard**: Use industry-standard terms
- **Defined**: Define technical terms on first use
- **Glossary**: Link to glossary for complex terms

### Examples

- **Realistic**: Use real-world scenarios
- **Complete**: Include all necessary code
- **Tested**: Verify examples work
- **Explained**: Add explanatory comments

### Code Conventions

Follow project code style:
- TypeScript for new code
- ESLint rules
- Prettier formatting
- JSDoc comments

## File Organization

### Naming

- Use lowercase with hyphens: `getting-started.md`
- Be descriptive: `deployment-guide.md` not `deploy.md`
- Match content: File name should reflect content

### Directory Structure

```
docs/
├── intro.md
├── 110-protocol/
│   ├── overview.md
│   └── roadmap.md
├── architecture/
│   ├── overview.md
│   └── ...
├── adr/
│   ├── 0001-record-architecture-decisions.md
│   └── ...
└── ...
```

### Sidebar Organization

Configure in `sidebars.ts`:
- Group related content
- Use clear category names
- Order logically (basics → advanced)

## Review Checklist

Before submitting documentation:

- [ ] Frontmatter is complete
- [ ] Headings are properly structured
- [ ] Links work correctly
- [ ] Code examples are tested
- [ ] Images have alt text
- [ ] Spelling and grammar are correct
- [ ] Style guide is followed
- [ ] Content is technically accurate
- [ ] Examples are complete
- [ ] Admonitions are used appropriately

## Common Mistakes to Avoid

1. **Skipping heading levels**: H1 → H3 (bad)
2. **Vague link text**: "Click here" (bad)
3. **Missing language in code blocks**: ` ``` ` without language (bad)
4. **Inconsistent terminology**: Using different terms for same concept (bad)
5. **Untested examples**: Code that doesn't work (bad)
6. **Missing frontmatter**: No sidebar_position (bad)
7. **Broken links**: Links to non-existent pages (bad)
8. **Wall of text**: No paragraphs or structure (bad)

## Best Practices

1. **Start with Why**: Explain why before how
2. **Show and Tell**: Combine explanations with examples
3. **Progressive Disclosure**: Start simple, add complexity gradually
4. **Cross-Reference**: Link to related content
5. **Update Regularly**: Keep content current
6. **Get Feedback**: Have others review
7. **Test Everything**: Verify all instructions work
8. **Be Specific**: Provide exact commands and paths

## Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/welcome/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)

## Questions?

If you have questions about documentation style, please:

1. Check this guide
2. Look at existing documentation for examples
3. Ask in a GitHub issue or discussion

---

**Maintained by**: Documentation team
**Last updated**: February 2026
