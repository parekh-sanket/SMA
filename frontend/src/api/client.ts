import { apiUrl } from '../config';
import type { HealthResponse } from '../types';

/**
 * Calls the backend health endpoint via the configured API base URL
 * (origin-relative by default; set VITE_API_BASE_URL for a cross-origin backend).
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(apiUrl('/api/health'));
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return (await res.json()) as HealthResponse;
}
