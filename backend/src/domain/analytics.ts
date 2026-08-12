/**
 * Pure analytics helpers over numeric series (salaries in minor units).
 * No I/O — unit-tested directly and reused by the analytics service.
 */

export interface Summary {
  count: number;
  total: number;
  average: number;
  median: number;
}

export interface HistogramBucket {
  start: number;
  end: number;
  count: number;
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/**
 * The p-th percentile (0..100) using linear interpolation between ranks.
 * Empty input yields 0.
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];

  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const weight = rank - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

export function median(values: number[]): number {
  return values.length === 0 ? 0 : percentile(values, 50);
}

export function summarize(values: number[]): Summary {
  return {
    count: values.length,
    total: sum(values),
    average: average(values),
    median: median(values),
  };
}

/**
 * Groups values into fixed-width buckets starting at 0, including empty buckets
 * within the range. A value on a boundary falls into the upper bucket.
 */
export function histogram(values: number[], bucketSize: number): HistogramBucket[] {
  if (values.length === 0) return [];

  const indexOf = (v: number) => Math.floor(v / bucketSize);
  const maxIndex = Math.max(...values.map(indexOf));

  const buckets: HistogramBucket[] = [];
  for (let i = 0; i <= maxIndex; i++) {
    buckets.push({ start: i * bucketSize, end: (i + 1) * bucketSize, count: 0 });
  }
  for (const v of values) {
    buckets[indexOf(v)].count++;
  }
  return buckets;
}
