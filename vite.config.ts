import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // For GitHub Pages: set GITHUB_REPO env var to your repo name (e.g. "ases")
  // so assets are served from /ases/. Leave unset for custom domains.
  const repoName = env.GITHUB_REPO || process.env.GITHUB_REPO || '';
  return {
    base: repoName ? `/${repoName}/` : '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
