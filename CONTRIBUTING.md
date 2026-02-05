# Contributing to Quantum X Builder

Thank you for your interest in contributing to Quantum X Builder! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please create an issue with:
- Clear description of the feature
- Use cases and benefits
- Any implementation ideas
- Mockups or examples if relevant

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites
- Modern web browser
- Text editor or IDE
- Local web server (Python, Node.js, or any other)

### Getting Started
```bash
# Clone the repository
git clone https://github.com/InfinityXOneSystems/quantum-x-builder.git
cd quantum-x-builder

# Start development server
python3 -m http.server 8080

# Open browser to http://localhost:8080/demo.html
```

## Code Style Guidelines

### HTML
- Use semantic HTML5 elements
- Maintain proper indentation (2 spaces)
- Add comments for complex sections
- Keep accessibility in mind

### CSS
- Use meaningful class names
- Group related styles together
- Comment major sections
- Maintain consistent spacing

### JavaScript
- Use ES6+ features
- Write clear, descriptive variable names
- Add JSDoc comments for functions
- Keep functions focused and small
- Use meaningful error messages

### Example
```javascript
/**
 * Analyzes code for potential issues
 * @param {string} code - The code to analyze
 * @returns {Array<string>} List of issues found
 */
analyzeCode(code) {
    const issues = [];
    // Analysis logic
    return issues;
}
```

## Adding New Features

### Adding a New Language

1. **Update the language selector** in HTML:
```html
<option value="newlang">New Language</option>
```

2. **Add language data** in JavaScript:
```javascript
this.aiKnowledge = {
    newlang: {
        patterns: ['keyword1', 'keyword2'],
        suggestions: {
            'pattern': 'code template'
        }
    }
};
```

3. **Add welcome code**:
```javascript
getWelcomeCode() {
    const welcomeCodes = {
        newlang: `// Welcome code for new language`
    };
}
```

### Adding a New Suggestion Pattern

```javascript
suggestions: {
    'newpattern': 'template code for the pattern'
}
```

### Adding a New Quick Action

1. **Add button** in HTML:
```html
<button class="action-btn" id="action-new">🎯 New Action</button>
```

2. **Add event listener**:
```javascript
document.getElementById('action-new').addEventListener('click', () => {
    this.newAction();
});
```

3. **Implement the action**:
```javascript
newAction() {
    // Action implementation
    this.addAIMessage('Action completed!');
    this.updateStatus('Action done');
}
```

## Testing

### Manual Testing Checklist
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test all Quick Action buttons
- [ ] Test language switching
- [ ] Test chat functionality
- [ ] Test code suggestions
- [ ] Test responsive design
- [ ] Verify no console errors

### Test Each Feature
1. Load the application
2. Try basic editing
3. Test AI suggestions
4. Test all quick actions
5. Test chat interactions
6. Switch languages
7. Check statistics update

## Documentation

When adding features:
- Update README.md if needed
- Update QUICKSTART.md with examples
- Add inline code comments
- Update this CONTRIBUTING.md if relevant

## Commit Message Guidelines

### Format
```
<type>: <short description>

<detailed description if needed>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat: Add TypeScript language support

Add TypeScript to language selector with appropriate
code templates and suggestions.

fix: Correct suggestion insertion position

Suggestions now insert at the correct cursor position
instead of at the end of the file.

docs: Update README with new features
```

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion
- Reach out to the maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help create a positive environment

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Quantum X Builder! 🚀
