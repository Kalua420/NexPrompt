import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173,
    host: '0.0.0.0', // Allow access from custom domains
    allowedHosts: [
      'nexprompt.local',
      'admin.nexprompt.local',
      'localhost',
    ],
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
});
