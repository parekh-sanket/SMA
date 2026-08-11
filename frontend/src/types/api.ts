/**
 * Shared API contract types — response shapes returned by the backend.
 * Used across features, so they live centrally (not co-located with one component).
 */

export interface HealthResponse {
  status: string;
}
