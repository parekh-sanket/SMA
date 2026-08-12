import { average, median, percentile, summarize, histogram } from '../../src/domain/analytics';

describe('average', () => {
  it('is 0 for an empty set', () => {
    expect(average([])).toBe(0);
  });

  it('is the arithmetic mean', () => {
    expect(average([10, 20, 30])).toBe(20);
  });
});

describe('median', () => {
  it('is 0 for an empty set', () => {
    expect(median([])).toBe(0);
  });

  it('is the middle value for an odd count', () => {
    expect(median([30, 10, 20])).toBe(20);
  });

  it('is the mean of the two middle values for an even count', () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });
});

describe('percentile', () => {
  const values = [10, 20, 30, 40, 50];

  it('is 0 for an empty set', () => {
    expect(percentile([], 50)).toBe(0);
  });

  it('returns the extremes at 0 and 100', () => {
    expect(percentile(values, 0)).toBe(10);
    expect(percentile(values, 100)).toBe(50);
  });

  it('interpolates within the range', () => {
    expect(percentile(values, 50)).toBe(30);
    expect(percentile(values, 25)).toBe(20);
  });
});

describe('summarize', () => {
  it('reports zeros for an empty set', () => {
    expect(summarize([])).toEqual({ count: 0, total: 0, average: 0, median: 0 });
  });

  it('reports count, total, average and median', () => {
    expect(summarize([100, 200, 300])).toEqual({
      count: 3,
      total: 600,
      average: 200,
      median: 200,
    });
  });
});

describe('histogram', () => {
  it('is empty for no values', () => {
    expect(histogram([], 100)).toEqual([]);
  });

  it('buckets values by size, including empty buckets in range', () => {
    expect(histogram([50, 60, 250], 100)).toEqual([
      { start: 0, end: 100, count: 2 },
      { start: 100, end: 200, count: 0 },
      { start: 200, end: 300, count: 1 },
    ]);
  });

  it('places a boundary value in the upper bucket', () => {
    expect(histogram([100], 100)).toEqual([
      { start: 0, end: 100, count: 0 },
      { start: 100, end: 200, count: 1 },
    ]);
  });
});
