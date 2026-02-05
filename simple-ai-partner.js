// Quantum X Builder - Simplified AI Partner System
// Self-contained implementation without external dependencies

class SimpleAIPartner {
    constructor() {
        this.isActive = true;
        this.editor = null;
        this.currentLanguage = 'javascript';
        this.suggestionCache = new Map();
        this.conversationHistory = [];
        
        this.aiKnowledge = {
            javascript: {
                patterns: ['function', 'const', 'let', 'class', 'async', 'await', 'import', 'export'],
                suggestions: {
                    'func': 'function functionName() {\n    // Your code here\n}',
                    'arrow': 'const functionName = () => {\n    // Your code here\n};',
                    'async': 'async function functionName() {\n    try {\n        // Your async code\n    } catch (error) {\n        console.error(error);\n    }\n}',
                    'class': 'class ClassName {\n    constructor() {\n        // Initialize\n    }\n\n    method() {\n        // Method code\n    }\n}',
                    'for': 'for (let i = 0; i < array.length; i++) {\n    // Loop body\n}',
                    'foreach': 'array.forEach((item, index) => {\n    // Process item\n});',
                    'promise': 'new Promise((resolve, reject) => {\n    // Promise code\n    resolve(value);\n});',
                    'try': 'try {\n    // Try code\n} catch (error) {\n    console.error(error);\n}'
                }
            },
            python: {
                patterns: ['def', 'class', 'import', 'from', 'if', 'for', 'while'],
                suggestions: {
                    'func': 'def function_name():\n    """Docstring"""\n    pass',
                    'class': 'class ClassName:\n    def __init__(self):\n        pass\n    \n    def method(self):\n        pass',
                    'for': 'for item in iterable:\n    # Loop body\n    pass',
                    'if': 'if condition:\n    # If body\n    pass\nelse:\n    # Else body\n    pass',
                    'try': 'try:\n    # Try code\nexcept Exception as e:\n    print(f"Error: {e}")',
                    'with': 'with open(filename, "r") as f:\n    content = f.read()'
                }
            },
            typescript: {
                patterns: ['interface', 'type', 'function', 'class', 'const', 'let'],
                suggestions: {
                    'interface': 'interface InterfaceName {\n    property: string;\n    method(): void;\n}',
                    'type': 'type TypeName = {\n    property: string;\n};',
                    'func': 'function functionName(param: string): string {\n    // Your code here\n    return param;\n}',
                    'class': 'class ClassName {\n    private property: string;\n    \n    constructor(property: string) {\n        this.property = property;\n    }\n    \n    public method(): void {\n        // Method code\n    }\n}'
                }
            }
        };
    }

    init() {
        this.editor = document.getElementById('code-editor');
        this.setupEventListeners();
        this.initializeEditor();
        this.initializeUI();
        this.addAIMessage('Editor loaded successfully! Ready to assist you with coding.');
    }

    initializeEditor() {
        this.editor.value = this.getWelcomeCode();
        this.updateStats();
    }

    getWelcomeCode() {
        const welcomeCodes = {
            javascript: `// Welcome to Quantum X Builder - AI Partner System
// Start typing and the AI will help you!

function welcomeMessage() {
    const message = "Hello, World!";
    console.log(message);
    
    // Try typing 'func', 'class', or 'async' to see AI suggestions
    return message;
}

welcomeMessage();`,
            python: `# Welcome to Quantum X Builder - AI Partner System
# Start typing and the AI will help you!

def welcome_message():
    """Display a welcome message"""
    message = "Hello, World!"
    print(message)
    
    # Try typing 'func', 'class', or 'for' to see AI suggestions
    return message

welcome_message()`,
            typescript: `// Welcome to Quantum X Builder - AI Partner System
// Start typing and the AI will help you!

interface Message {
    text: string;
    timestamp: Date;
}

function welcomeMessage(): Message {
    const message: Message = {
        text: "Hello, World!",
        timestamp: new Date()
    };
    console.log(message.text);
    
    // Try typing 'interface', 'type', or 'class' to see AI suggestions
    return message;
}

welcomeMessage();`,
            html: `<!DOCTYPE html>
<!-- Welcome to Quantum X Builder - AI Partner System -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Start coding with AI assistance!</p>
</body>
</html>`,
            css: `/* Welcome to Quantum X Builder - AI Partner System */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}`,
            json: `{
  "welcome": "Quantum X Builder - AI Partner System",
  "version": "1.0.0",
  "features": [
    "AI Code Completion",
    "Smart Suggestions",
    "Real-time Analysis"
  ]
}`
        };
        
        return welcomeCodes[this.currentLanguage] || welcomeCodes.javascript;
    }

    setupEventListeners() {
        // Editor events
        this.editor.addEventListener('input', () => {
            this.updateStats();
            if (this.isActive) {
                this.analyzeCode();
                this.provideSuggestions();
            }
        });

        this.editor.addEventListener('keydown', (e) => {
            // Handle Tab key
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const value = this.editor.value;
                this.editor.value = value.substring(0, start) + '    ' + value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + 4;
            }
        });

        // Language selector
        document.getElementById('language').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // AI toggle button
        document.getElementById('ai-toggle').addEventListener('click', () => {
            this.toggleAI();
        });

        // Chat functionality
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Action buttons
        document.getElementById('action-explain').addEventListener('click', () => {
            this.explainCode();
        });

        document.getElementById('action-optimize').addEventListener('click', () => {
            this.optimizeCode();
        });

        document.getElementById('action-refactor').addEventListener('click', () => {
            this.refactorCode();
        });

        document.getElementById('action-debug').addEventListener('click', () => {
            this.debugCode();
        });

        document.getElementById('action-document').addEventListener('click', () => {
            this.addDocumentation();
        });

        document.getElementById('action-test').addEventListener('click', () => {
            this.generateTests();
        });
    }

    initializeUI() {
        this.updateStatus('Ready');
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        this.editor.value = this.getWelcomeCode();
        this.updateStats();
        this.addAIMessage(`Language changed to ${language}. I'm ready to help!`);
    }

    toggleAI() {
        this.isActive = !this.isActive;
        const toggleBtn = document.getElementById('ai-toggle');
        const status = document.getElementById('ai-status');
        
        if (this.isActive) {
            toggleBtn.textContent = 'Active';
            toggleBtn.classList.remove('inactive');
            status.textContent = 'Ready';
            status.style.background = '#4caf50';
            this.addAIMessage('AI Partner activated! I\'m here to help.');
        } else {
            toggleBtn.textContent = 'Inactive';
            toggleBtn.classList.add('inactive');
            status.textContent = 'Inactive';
            status.style.background = '#999';
            this.addAIMessage('AI Partner deactivated.');
        }
    }

    updateStats() {
        const code = this.editor.value;
        const lines = code.split('\n').length;
        const chars = code.length;
        const words = code.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        document.getElementById('line-count').textContent = `Lines: ${lines}`;
        document.getElementById('char-count').textContent = `Characters: ${chars}`;
        document.getElementById('word-count').textContent = `Words: ${words}`;
    }

    analyzeCode() {
        const code = this.editor.value;
        
        // Detect potential issues
        const issues = [];
        
        if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
            if (code.includes('var ')) {
                issues.push('Consider using "let" or "const" instead of "var"');
            }
            if (code.includes('console.log') && code.split('console.log').length > 5) {
                issues.push('Many console.log statements detected');
            }
        }
        
        if (this.currentLanguage === 'python') {
            if (!code.includes('"""') && code.includes('def ')) {
                issues.push('Consider adding docstrings');
            }
        }
        
        if (issues.length > 0) {
            this.updateStatus(`${issues.length} suggestion(s)`);
        }
    }

    provideSuggestions() {
        const cursorPos = this.editor.selectionStart;
        const code = this.editor.value.substring(0, cursorPos);
        const lines = code.split('\n');
        const currentLine = lines[lines.length - 1];
        const words = currentLine.trim().split(/\s+/);
        const lastWord = words[words.length - 1] || '';
        
        const suggestionsList = document.getElementById('suggestions-list');
        
        // Get AI suggestions based on current context
        const suggestions = this.getAISuggestions(lastWord);
        
        if (suggestions.length > 0) {
            suggestionsList.innerHTML = '';
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion.label;
                item.title = suggestion.description;
                item.addEventListener('click', () => {
                    this.applySuggestion(suggestion);
                });
                suggestionsList.appendChild(item);
            });
        } else {
            suggestionsList.innerHTML = '<p class="empty-state">Start typing to get AI suggestions...</p>';
        }
    }

    getAISuggestions(word) {
        const suggestions = [];
        const langData = this.aiKnowledge[this.currentLanguage];
        
        if (!langData) return suggestions;
        
        // Match against known patterns
        for (const [key, snippet] of Object.entries(langData.suggestions)) {
            if (key.startsWith(word.toLowerCase()) && word.length > 0) {
                suggestions.push({
                    label: `${key} - AI Suggestion`,
                    description: `Insert ${key} template`,
                    code: snippet,
                    type: 'snippet'
                });
            }
        }
        
        return suggestions.slice(0, 5);
    }

    applySuggestion(suggestion) {
        if (suggestion.code) {
            const cursorPos = this.editor.selectionStart;
            const code = this.editor.value;
            
            // Insert suggestion at cursor
            this.editor.value = code.substring(0, cursorPos) + '\n' + suggestion.code + '\n' + code.substring(cursorPos);
            this.editor.focus();
            
            this.addAIMessage(`Applied suggestion: ${suggestion.label}`);
            this.updateStatus('Suggestion applied');
            this.updateStats();
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            input.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                this.generateAIResponse(message);
            }, 500);
        }
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `<strong>You:</strong> ${this.escapeHtml(message)}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addAIMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `<strong>AI:</strong> ${message}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            response = 'I can help you with various coding tasks! Try using the Quick Actions buttons, or ask me specific questions about your code.';
        } else if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
            response = 'I\'ll analyze your code for potential bugs. Click the "🐛 Debug" button to start debugging, or describe the issue you\'re facing.';
        } else if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
            response = 'I can help optimize your code for better performance. Click the "⚡ Optimize" button to get optimization suggestions.';
        } else if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
            response = 'Select the code you want me to explain and click the "📖 Explain Code" button, or paste a code snippet in the chat.';
        } else if (lowerMessage.includes('test')) {
            response = 'I can generate unit tests for your code. Click the "🧪 Generate Tests" button to create test cases.';
        } else if (lowerMessage.includes('refactor')) {
            response = 'Refactoring can improve code readability. Click the "🔧 Refactor" button for suggestions.';
        } else {
            response = `I understand you're asking about "${userMessage}". I'm here to help with code completion, debugging, optimization, and more. What specifically would you like assistance with?`;
        }
        
        this.addAIMessage(response);
    }

    explainCode() {
        const selectedText = this.getSelectedText();
        const code = this.editor.value;
        const textToExplain = selectedText || code;
        
        if (textToExplain.trim()) {
            this.addAIMessage(`Explaining your code:\n\nThis code appears to be ${this.analyzeCodePurpose(textToExplain)}. It uses ${this.detectLanguageFeatures(textToExplain).join(', ')}. The code is structured to ${this.inferIntent(textToExplain)}.`);
        } else {
            this.addAIMessage('Please select some code in the editor first, then click "Explain Code" again.');
        }
        this.updateStatus('Explained code');
    }

    optimizeCode() {
        const code = this.editor.value;
        if (code.trim()) {
            const suggestions = [];
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                if (code.includes('for (')) {
                    suggestions.push('Consider using array methods like .map(), .filter(), or .forEach()');
                }
                if (code.includes('var ')) {
                    suggestions.push('Replace "var" with "const" or "let" for better scoping');
                }
                if (code.split('\n').some(line => line.trim().length > 120)) {
                    suggestions.push('Some lines are very long - consider breaking them up');
                }
            }
            
            if (suggestions.length > 0) {
                this.addAIMessage(`Optimization suggestions:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
            } else {
                this.addAIMessage('Your code looks well-optimized! Good job!');
            }
        } else {
            this.addAIMessage('Please write some code first, then click "Optimize" again.');
        }
        this.updateStatus('Optimization complete');
    }

    refactorCode() {
        const selectedText = this.getSelectedText();
        if (selectedText || this.editor.value.trim()) {
            this.addAIMessage('Refactoring suggestions:\n1. Extract repeated code into functions\n2. Use meaningful variable names\n3. Add proper error handling\n4. Consider using modern language features\n5. Break down complex functions into smaller ones');
        } else {
            this.addAIMessage('Write some code first, then click "Refactor" to get suggestions.');
        }
        this.updateStatus('Refactoring suggested');
    }

    debugCode() {
        const code = this.editor.value;
        if (code.trim()) {
            const issues = [];
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                if (code.includes('==') && !code.includes('===')) {
                    issues.push('Consider using "===" instead of "==" for strict equality');
                }
                const openBraces = (code.match(/{/g) || []).length;
                const closeBraces = (code.match(/}/g) || []).length;
                if (openBraces !== closeBraces) {
                    issues.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
                }
                const openParens = (code.match(/\(/g) || []).length;
                const closeParens = (code.match(/\)/g) || []).length;
                if (openParens !== closeParens) {
                    issues.push(`Mismatched parentheses: ${openParens} opening, ${closeParens} closing`);
                }
            }
            
            if (issues.length > 0) {
                this.addAIMessage(`🐛 Debug Report:\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}`);
            } else {
                this.addAIMessage('No obvious issues detected! Your code syntax looks good.');
            }
        } else {
            this.addAIMessage('Please write some code first, then click "Debug" again.');
        }
        this.updateStatus('Debug complete');
    }

    addDocumentation() {
        const code = this.editor.value;
        if (code.trim()) {
            let docExample = '';
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                docExample = '/**\n * Function description\n * @param {type} paramName - Parameter description\n * @returns {type} Return value description\n */';
            } else if (this.currentLanguage === 'python') {
                docExample = '"""\nFunction description\n\nArgs:\n    param_name (type): Parameter description\n\nReturns:\n    type: Return value description\n"""';
            } else if (this.currentLanguage === 'html') {
                docExample = '<!-- Component description -->';
            } else if (this.currentLanguage === 'css') {
                docExample = '/* Style description */';
            }
            
            this.addAIMessage(`Adding documentation template:\n\n${docExample}\n\nPlace this above your functions for better code documentation.`);
        } else {
            this.addAIMessage('Please write some code first, then click "Add Docs" again.');
        }
        this.updateStatus('Documentation added');
    }

    generateTests() {
        const code = this.editor.value;
        if (code.trim()) {
            let testExample = '';
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                testExample = `describe('YourFunction', () => {
    it('should return expected result', () => {
        const result = yourFunction(input);
        expect(result).toBe(expectedOutput);
    });
    
    it('should handle edge cases', () => {
        expect(yourFunction(null)).toBe(defaultValue);
    });
});`;
            } else if (this.currentLanguage === 'python') {
                testExample = `def test_your_function():
    """Test the your_function"""
    result = your_function(input_value)
    assert result == expected_output
    
def test_edge_cases():
    """Test edge cases"""
    assert your_function(None) == default_value`;
            }
            
            this.addAIMessage(`Generated test template:\n\n${testExample}\n\nCreate a test file and use this template to test your code.`);
        } else {
            this.addAIMessage('Please write some code first, then click "Generate Tests" again.');
        }
        this.updateStatus('Tests generated');
    }

    getSelectedText() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        return this.editor.value.substring(start, end);
    }

    analyzeCodePurpose(code) {
        if (code.includes('function') || code.includes('def ')) {
            return 'a function definition';
        } else if (code.includes('class')) {
            return 'a class definition';
        } else if (code.includes('if') || code.includes('else')) {
            return 'conditional logic';
        } else if (code.includes('for') || code.includes('while')) {
            return 'a loop structure';
        }
        return 'a code snippet';
    }

    detectLanguageFeatures(code) {
        const features = [];
        if (code.includes('async') || code.includes('await')) features.push('asynchronous operations');
        if (code.includes('try') || code.includes('catch')) features.push('error handling');
        if (code.includes('class')) features.push('object-oriented programming');
        if (code.includes('=>')) features.push('arrow functions');
        if (features.length === 0) features.push('basic syntax');
        return features;
    }

    inferIntent(code) {
        if (code.includes('fetch') || code.includes('axios') || code.includes('request')) {
            return 'make API calls or network requests';
        } else if (code.includes('map') || code.includes('filter') || code.includes('reduce')) {
            return 'transform or process data';
        } else if (code.includes('console.log') || code.includes('print')) {
            return 'output information for debugging or logging';
        }
        return 'perform specific operations';
    }

    updateStatus(message) {
        const status = document.getElementById('ai-status');
        if (status) {
            status.textContent = message;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the AI Partner System when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const aiPartner = new SimpleAIPartner();
        aiPartner.init();
    });
} else {
    const aiPartner = new SimpleAIPartner();
    aiPartner.init();
}
