import type { HealthResponse } from '../types';

/**
 * Calls the backend health endpoint.
 * Uses a relative path so it works behind the Vite dev proxy and in production
 * where the API is served under the same origin.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return (await res.json()) as HealthResponse;
}
