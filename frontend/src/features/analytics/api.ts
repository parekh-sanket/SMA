import type { Employee } from '../../types/models';
import type {
  AnalyticsSummary,
  BreakdownDimension,
  BreakdownGroup,
  Distribution,
  Insights,
} from './types';
import { authFetch } from '../auth/authFetch';

export async function getSummary(): Promise<AnalyticsSummary> {
  const res = await authFetch('/api/analytics/summary');
  if (!res.ok) throw new Error(`Failed to load summary (${res.status})`);
  return (await res.json()) as AnalyticsSummary;
}

export async function getBreakdown(
  dimension: BreakdownDimension
): Promise<BreakdownGroup[]> {
  const res = await authFetch(`/api/analytics/breakdown?dimension=${dimension}`);
  if (!res.ok) throw new Error(`Failed to load breakdown (${res.status})`);
  return (await res.json()) as BreakdownGroup[];
}

export async function getTopEarners(limit = 5): Promise<Employee[]> {
  const res = await authFetch(`/api/analytics/top-earners?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to load top earners (${res.status})`);
  return (await res.json()) as Employee[];
}

export async function getDistribution(): Promise<Distribution> {
  const res = await authFetch('/api/analytics/distribution');
  if (!res.ok) throw new Error(`Failed to load distribution (${res.status})`);
  return (await res.json()) as Distribution;
}

export async function getInsights(filters: {
  country?: string;
  title?: string;
}): Promise<Insights> {
  const params = new URLSearchParams();
  if (filters.country) params.set('country', filters.country);
  if (filters.title) params.set('title', filters.title);
  const res = await authFetch(`/api/analytics/insights?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load insights (${res.status})`);
  return (await res.json()) as Insights;
}
