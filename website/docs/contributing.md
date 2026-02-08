---
sidebar_position: 97
---

# Contributing to Quantum X Builder

Thank you for your interest in contributing to Quantum X Builder! This document provides guidelines for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with a clear title and description
3. **Include reproduction steps** for bugs
4. **Add relevant labels** to help categorize the issue

### Submitting Changes

1. **Fork the repository** to your GitHub account
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit with clear messages** following conventional commits:
   ```bash
   git commit -m "feat: add new feature description"
   git commit -m "fix: resolve issue with component"
   git commit -m "docs: update documentation"
   ```
6. **Push to your fork** and **create a pull request**

### Pull Request Guidelines

- **Clear description**: Explain what changes you made and why
- **Link related issues**: Reference any related issues with `#issue-number`
- **Keep it focused**: One feature/fix per PR
- **Update documentation**: Include relevant docs updates
- **Add tests**: Include tests for new features or bug fixes
- **Follow code style**: Match the existing code style
- **Sign commits**: Use verified commits when possible

## Development Setup

### Prerequisites

- Node.js 20.0 or higher
- npm 8.0 or higher
- Git

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/InfinityXOneSystems/quantum-x-builder.git
   cd quantum-x-builder
   ```

2. Install dependencies:
   ```bash
   cd website
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. View the site at `http://localhost:3000`

### Building for Production

```bash
cd website
npm run build
```

The static files will be generated in `website/build/`.

## Documentation Contributions

### Writing Documentation

1. **Follow the style guide**: See [Documentation Style Guide](./STYLEGUIDE.md)
2. **Use proper formatting**: Markdown/MDX with frontmatter
3. **Add examples**: Include code examples where appropriate
4. **Test rendering**: Preview locally before submitting
5. **Update navigation**: Add to sidebars if creating new sections

### Documentation Structure

```
website/
├── docs/                    # Documentation content
│   ├── intro.md            # Landing page
│   ├── 110-protocol/       # 110% Protocol docs
│   ├── architecture/       # Architecture docs
│   ├── adr/               # Architecture Decision Records
│   ├── contributing.md     # This file
│   └── ...
├── blog/                   # Blog posts
├── src/                    # React components
└── static/                 # Static assets
```

### Adding New Documentation

1. Create a new `.md` or `.mdx` file in the appropriate directory
2. Add frontmatter:
   ```yaml
   ---
   sidebar_position: 1
   title: Your Page Title
   ---
   ```
3. Write content following the style guide
4. Test locally
5. Submit a pull request

## Code Style

### JavaScript/TypeScript

- Use TypeScript for new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write JSDoc comments for functions

### Markdown/MDX

- Use proper heading hierarchy (h1 → h2 → h3)
- Include code blocks with language tags
- Use tables for structured data
- Add alt text for images

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Review Process

1. **Automated checks**: CI runs tests and linters
2. **Code review**: Maintainers review the changes
3. **Feedback**: Address any requested changes
4. **Approval**: At least one maintainer approval required
5. **Merge**: Maintainers will merge approved PRs

## Community

### Getting Help

- **Issues**: Use GitHub issues for questions
- **Discussions**: Use GitHub Discussions for general topics
- **Documentation**: Check the docs first

### Recognition

Contributors are recognized in:

- Git commit history
- Release notes
- Contributors file (when applicable)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

If you have questions about contributing, please:

1. Check this guide thoroughly
2. Search existing issues and discussions
3. Create a new issue with the `question` label

---

Thank you for contributing to Quantum X Builder! 🚀
