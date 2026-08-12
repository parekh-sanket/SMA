/**
 * Base URL for the API.
 *
 * Empty by default → calls are origin-relative (`/api/...`), which works in dev
 * (Vite proxy) and same-origin deploys. Set `VITE_API_BASE_URL` at build time to
 * point the SPA at a different-origin backend (e.g. frontend on Vercel, API on
 * Render). Injected via Vite `define` (see vite.config.ts) so it also stays
 * empty in Jest.
 */
export const API_BASE_URL: string = process.env.API_BASE_URL || '';

export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;
