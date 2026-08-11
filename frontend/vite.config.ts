import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend talks to the backend via a relative `/api` path.
// In dev, Vite proxies `/api` to the local Express server so the SPA and API
// can run on separate ports without CORS friction.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
