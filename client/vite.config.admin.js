import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-html-transform',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            // Rewrite all navigation requests to admin.html
            if (req.url === '/' || req.url === '/index.html' || (!req.url.includes('.') && !req.url.startsWith('/src') && !req.url.startsWith('/@'))) {
              req.url = '/admin.html';
            }
            next();
          });
        };
      },
    },
  ],
  root: '.',
  // Use separate cache directory to avoid conflicts with main app
  cacheDir: 'node_modules/.vite-admin',
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: resolve(__dirname, 'admin.html'),
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    allowedHosts: [
      'nexprompt.local',
      'admin.nexprompt.local',
      'localhost',
    ],
    // Disable browser caching completely
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
  },
});
