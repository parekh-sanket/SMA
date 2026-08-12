export interface AnalyticsSummary {
  headcount: number;
  totalPayrollMinor: number;
  totalPayrollFormatted: string;
  averageMinor: number;
  averageFormatted: string;
  medianMinor: number;
  medianFormatted: string;
}

export interface BreakdownGroup {
  key: string;
  count: number;
  totalMinor: number;
  totalFormatted: string;
  averageMinor: number;
  averageFormatted: string;
}

export interface DistributionBucket {
  start: number;
  end: number;
  count: number;
}

export interface Distribution {
  bucketSizeMinor: number;
  buckets: DistributionBucket[];
}

export type BreakdownDimension = 'department' | 'country';
