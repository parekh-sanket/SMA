import { histogram, summarize } from '../domain/analytics';
import { formatUsd } from '../domain/money';
import type {
  BreakdownDimension,
  EmployeeRepository,
} from './employeeRepository';
import type { EmployeeResponse } from './types';

/** Salary-distribution bucket width: $10,000 in minor units. */
export const ANALYTICS_BUCKET_SIZE_MINOR = 1_000_000;

export interface AnalyticsSummary {
  headcount: number;
  totalPayrollMinor: number;
  totalPayrollFormatted: string;
  averageMinor: number;
  averageFormatted: string;
  medianMinor: number;
  medianFormatted: string;
}

export interface BreakdownGroupResponse {
  key: string;
  count: number;
  totalMinor: number;
  totalFormatted: string;
  averageMinor: number;
  averageFormatted: string;
}

export interface DistributionResponse {
  bucketSizeMinor: number;
  buckets: { start: number; end: number; count: number }[];
}

export interface AnalyticsService {
  summary(): AnalyticsSummary;
  breakdown(dimension: BreakdownDimension): BreakdownGroupResponse[];
  topEarners(limit: number): EmployeeResponse[];
  distribution(): DistributionResponse;
}

export function createAnalyticsService(repo: EmployeeRepository): AnalyticsService {
  return {
    summary() {
      const s = summarize(repo.allSalaries());
      const averageMinor = Math.round(s.average);
      const medianMinor = Math.round(s.median);
      return {
        headcount: s.count,
        totalPayrollMinor: s.total,
        totalPayrollFormatted: formatUsd(s.total),
        averageMinor,
        averageFormatted: formatUsd(averageMinor),
        medianMinor,
        medianFormatted: formatUsd(medianMinor),
      };
    },

    breakdown(dimension) {
      return repo.breakdown(dimension).map((g) => ({
        key: g.key,
        count: g.count,
        totalMinor: g.total,
        totalFormatted: formatUsd(g.total),
        averageMinor: g.average,
        averageFormatted: formatUsd(g.average),
      }));
    },

    topEarners(limit) {
      return repo
        .topEarners(limit)
        .map((e) => ({ ...e, salaryFormatted: formatUsd(e.salaryMinor) }));
    },

    distribution() {
      const buckets = histogram(repo.allSalaries(), ANALYTICS_BUCKET_SIZE_MINOR);
      return { bucketSizeMinor: ANALYTICS_BUCKET_SIZE_MINOR, buckets };
    },
  };
}
