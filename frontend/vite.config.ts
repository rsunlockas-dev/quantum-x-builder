import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

// For GitHub Pages deployment: set PAGES_BASE to '/<REPO_NAME>/' for project pages
// or '/' for user pages. Defaults to this repository's project pages path.
// Override via PAGES_BASE environment variable during build if deploying elsewhere.
const PAGES_BASE = process.env.PAGES_BASE || '/quantum-x-builder/';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // For GitHub Pages: set base to '/quantum-x-builder/' (repository name)
    // For project pages (user.github.io), use '/'
    // For local dev/Docker, use '/'
    const base = process.env.PAGES_BASE || '/';
    
    return {
      base: PAGES_BASE,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        outDir: 'dist',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.MOCK_MODE': JSON.stringify(process.env.MOCK_MODE || 'false')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            }
          }
        }
      }
    };
});
