import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend talks to the backend via a relative `/api` path.
// In dev, Vite proxies `/api` to the local Express server so the SPA and API
// can run on separate ports without CORS friction.
export default defineConfig({
  plugins: [react()],
  // Bake the API base URL into the client bundle at build time.
  define: {
    'process.env.API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL ?? ''),
  },
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
