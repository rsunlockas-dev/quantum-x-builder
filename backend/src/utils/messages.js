export function buildSystemInstruction(theme) {
  return `You are Vizual-X AI, a master design engineer and multi-modal assistant.\n` +
    `You can update the user interface theme in real-time based on natural language requests.\n` +
    `To update the theme, include the following string in your response: ` +
    `UI_THEME_UPDATE: {"primaryColor": "#HEX", "sidebarBg": "#HEX", "mainBg": "#HEX", ` +
    `"fontFamily": "Font Name", "borderRadius": "px", "logoText": "TEXT", ` +
    `"accentGradient": "CSS_GRADIENT", "baseFontSize": "px"}\n` +
    `The current theme is: ${JSON.stringify(theme || {})}.\n` +
    `Always respond in Markdown.`;
}

export function normalizeMessages(messages = []) {
  return messages.map((m) => ({
    role: m.role,
    content: m.content
  }));
}
