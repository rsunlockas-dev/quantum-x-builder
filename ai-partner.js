// Quantum X Builder - AI Partner System
// Monaco Editor Integration with Autonomous AI

class AIPartner {
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
        this.loadMonacoEditor();
        this.setupEventListeners();
        this.initializeUI();
    }

    loadMonacoEditor() {
        // Wait for Monaco to be available
        const initEditor = () => {
            if (typeof monaco !== 'undefined') {
                this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                    value: this.getWelcomeCode(),
                    language: this.currentLanguage,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    wordWrap: 'on',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true }
                });

                this.setupEditorListeners();
                this.addAIMessage('Editor loaded successfully! Ready to assist you with coding.');
            } else {
                // Retry after a short delay
                setTimeout(initEditor, 100);
            }
        };
        
        // Configure and load Monaco
        if (typeof require !== 'undefined') {
            require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
            require(['vs/editor/editor.main'], initEditor);
        } else {
            // Fallback: wait for Monaco to load via script tag
            initEditor();
        }
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

welcomeMessage();`
        };
        
        return welcomeCodes[this.currentLanguage] || welcomeCodes.javascript;
    }

    setupEditorListeners() {
        // Listen to content changes
        this.editor.onDidChangeModelContent((e) => {
            if (this.isActive) {
                this.analyzeCode();
                this.provideSuggestions();
            }
        });

        // Listen to cursor position changes
        this.editor.onDidChangeCursorPosition((e) => {
            if (this.isActive) {
                this.updateContextualHelp(e.position);
            }
        });
    }

    setupEventListeners() {
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
        if (this.editor) {
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
            this.addAIMessage(`Language changed to ${language}. I'm ready to help!`);
        }
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

    analyzeCode() {
        const code = this.editor.getValue();
        
        // Simple code analysis
        const lines = code.split('\n').length;
        const chars = code.length;
        
        // Detect potential issues
        const issues = [];
        
        if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
            if (code.includes('var ')) {
                issues.push('Consider using "let" or "const" instead of "var"');
            }
            if (code.includes('console.log') && code.split('console.log').length > 5) {
                issues.push('Many console.log statements detected - consider using a logger');
            }
        }
        
        if (this.currentLanguage === 'python') {
            if (!code.includes('"""') && code.includes('def ')) {
                issues.push('Consider adding docstrings to your functions');
            }
        }
        
        // Update status with analysis
        if (issues.length > 0) {
            this.updateStatus(`Found ${issues.length} suggestion(s)`);
        }
    }

    provideSuggestions() {
        const position = this.editor.getPosition();
        const model = this.editor.getModel();
        const currentLine = model.getLineContent(position.lineNumber);
        const wordBeforeCursor = this.getWordBeforeCursor(currentLine, position.column);
        
        const suggestionsList = document.getElementById('suggestions-list');
        
        // Get AI suggestions based on current context
        const suggestions = this.getAISuggestions(wordBeforeCursor);
        
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

    getWordBeforeCursor(line, column) {
        const textBeforeCursor = line.substring(0, column - 1);
        const words = textBeforeCursor.split(/\s+/);
        return words[words.length - 1] || '';
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
        
        return suggestions.slice(0, 5); // Limit to 5 suggestions
    }

    applySuggestion(suggestion) {
        if (this.editor && suggestion.code) {
            const position = this.editor.getPosition();
            const range = new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
            );
            
            this.editor.executeEdits('ai-suggestion', [{
                range: range,
                text: suggestion.code,
                forceMoveMarkers: true
            }]);
            
            this.addAIMessage(`Applied suggestion: ${suggestion.label}`);
            this.updateStatus('Suggestion applied');
        }
    }

    updateContextualHelp(position) {
        // Could provide context-aware help based on cursor position
        // This is a placeholder for future enhancement
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
        
        // Simple AI response logic based on keywords
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            response = 'I can help you with various coding tasks! Try using the Quick Actions buttons on the right, or ask me specific questions about your code.';
        } else if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
            response = 'I\'ll analyze your code for potential bugs. Click the "🐛 Debug" button to start debugging, or describe the issue you\'re facing.';
        } else if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
            response = 'I can help optimize your code for better performance. Click the "⚡ Optimize" button to get optimization suggestions.';
        } else if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
            response = 'Select the code you want me to explain and click the "📖 Explain Code" button, or paste a code snippet in the chat.';
        } else if (lowerMessage.includes('test')) {
            response = 'I can generate unit tests for your code. Click the "🧪 Generate Tests" button to create test cases.';
        } else if (lowerMessage.includes('refactor')) {
            response = 'Refactoring can improve code readability and maintainability. Click the "🔧 Refactor" button for suggestions.';
        } else {
            response = `I understand you're asking about "${userMessage}". I'm here to help with code completion, debugging, optimization, and more. What specifically would you like assistance with?`;
        }
        
        this.addAIMessage(response);
    }

    explainCode() {
        const selectedText = this.getSelectedText();
        if (selectedText) {
            this.addAIMessage(`Explaining the selected code:\n\nThis code appears to be ${this.analyzeCodePurpose(selectedText)}. It uses ${this.detectLanguageFeatures(selectedText).join(', ')}. The code is structured to ${this.inferIntent(selectedText)}.`);
        } else {
            this.addAIMessage('Please select some code in the editor first, then click "Explain Code" again.');
        }
        this.updateStatus('Explained code');
    }

    optimizeCode() {
        const code = this.editor.getValue();
        if (code.trim()) {
            const suggestions = [];
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                if (code.includes('for (')) {
                    suggestions.push('Consider using array methods like .map(), .filter(), or .forEach() for better readability');
                }
                if (code.includes('var ')) {
                    suggestions.push('Replace "var" with "const" or "let" for better scoping');
                }
            }
            
            if (suggestions.length > 0) {
                this.addAIMessage(`Optimization suggestions:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
            } else {
                this.addAIMessage('Your code looks well-optimized! Consider reviewing for specific performance bottlenecks if needed.');
            }
        } else {
            this.addAIMessage('Please write some code first, then click "Optimize" again.');
        }
        this.updateStatus('Optimization complete');
    }

    refactorCode() {
        const selectedText = this.getSelectedText();
        if (selectedText) {
            this.addAIMessage('Refactoring suggestions:\n1. Extract repeated code into functions\n2. Use meaningful variable names\n3. Add proper error handling\n4. Consider using modern language features\n5. Break down complex functions into smaller ones');
        } else {
            this.addAIMessage('Select code to refactor, or I can provide general refactoring tips for your entire file.');
        }
        this.updateStatus('Refactoring suggested');
    }

    debugCode() {
        const code = this.editor.getValue();
        if (code.trim()) {
            const issues = [];
            
            // Simple debugging checks
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                if (code.includes('==') && !code.includes('===')) {
                    issues.push('Consider using "===" instead of "==" for strict equality');
                }
                const openBraces = (code.match(/{/g) || []).length;
                const closeBraces = (code.match(/}/g) || []).length;
                if (openBraces !== closeBraces) {
                    issues.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
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
        const code = this.editor.getValue();
        if (code.trim()) {
            let docExample = '';
            
            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                docExample = '/**\n * Function description\n * @param {type} paramName - Parameter description\n * @returns {type} Return value description\n */';
            } else if (this.currentLanguage === 'python') {
                docExample = '"""\nFunction description\n\nArgs:\n    param_name (type): Parameter description\n\nReturns:\n    type: Return value description\n"""';
            }
            
            this.addAIMessage(`Adding documentation template:\n\n${docExample}\n\nPlace this above your functions for better code documentation.`);
        } else {
            this.addAIMessage('Please write some code first, then click "Add Docs" again.');
        }
        this.updateStatus('Documentation added');
    }

    generateTests() {
        const code = this.editor.getValue();
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
        if (this.editor) {
            const selection = this.editor.getSelection();
            const model = this.editor.getModel();
            return model.getValueInRange(selection);
        }
        return '';
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
        const aiPartner = new AIPartner();
        aiPartner.init();
    });
} else {
    const aiPartner = new AIPartner();
    aiPartner.init();
}
