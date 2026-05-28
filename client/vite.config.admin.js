import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-html-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve admin.html for all routes in dev mode
          if (req.url === '/' || !req.url.includes('.')) {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  root: '.',
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: resolve(__dirname, 'admin.html'),
    },
  },
  server: {
    port: 5174,
    host: 'localhost',
  },
});
