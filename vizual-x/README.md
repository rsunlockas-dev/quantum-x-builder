<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fQ99mZgdiM4nUMfKASAVb82os_7cqTnF

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## VS Code Extension (Auto-Open on Startup)

The VS Code extension lives in [vscode-extension](vscode-extension). It opens Vizual-X in a webview on VS Code startup.

1. Build the web app assets:
   `npm install`
   `npm run build`

2. Install the extension in VS Code:
   - Open the Command Palette and run `Developer: Install Extension from Location...`
   - Choose the [vscode-extension](vscode-extension) folder

3. Reload VS Code. Vizual-X will open automatically.

If you need to reopen it manually, run `Vizual-X: Open Vizual-X Studio` from the Command Palette.
