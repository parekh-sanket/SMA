import {
  toMinorUnits,
  fromMinorUnits,
  formatUsd,
  assertValidMinorUnits,
} from '../../src/domain/money';

describe('toMinorUnits', () => {
  it('converts whole dollars to cents', () => {
    expect(toMinorUnits(85000)).toBe(8500000);
  });

  it('converts dollars with cents', () => {
    expect(toMinorUnits(1234.56)).toBe(123456);
  });

  it('rounds to the nearest cent', () => {
    expect(toMinorUnits(10.005)).toBe(1001);
    expect(toMinorUnits(10.004)).toBe(1000);
  });

  it('treats zero as zero', () => {
    expect(toMinorUnits(0)).toBe(0);
  });

  it('rejects a non-finite amount', () => {
    expect(() => toMinorUnits(NaN)).toThrow();
    expect(() => toMinorUnits(Infinity)).toThrow();
  });

  it('rejects a negative amount', () => {
    expect(() => toMinorUnits(-1)).toThrow();
  });
});

describe('fromMinorUnits', () => {
  it('converts cents back to dollars', () => {
    expect(fromMinorUnits(8500000)).toBe(85000);
    expect(fromMinorUnits(123456)).toBe(1234.56);
  });

  it('converts zero to zero', () => {
    expect(fromMinorUnits(0)).toBe(0);
  });

  it('rejects invalid minor units', () => {
    expect(() => fromMinorUnits(100.5)).toThrow();
    expect(() => fromMinorUnits(-1)).toThrow();
  });
});

describe('formatUsd', () => {
  it('formats cents as a USD string with grouping and 2 decimals', () => {
    expect(formatUsd(8500000)).toBe('$85,000.00');
    expect(formatUsd(123456)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatUsd(0)).toBe('$0.00');
  });

  it('rejects invalid minor units', () => {
    expect(() => formatUsd(-1)).toThrow();
    expect(() => formatUsd(10.5)).toThrow();
  });
});

describe('assertValidMinorUnits', () => {
  it('accepts non-negative integers', () => {
    expect(() => assertValidMinorUnits(0)).not.toThrow();
    expect(() => assertValidMinorUnits(8500000)).not.toThrow();
  });

  it('rejects negative values', () => {
    expect(() => assertValidMinorUnits(-1)).toThrow(/non-negative/i);
  });

  it('rejects non-integer values', () => {
    expect(() => assertValidMinorUnits(100.5)).toThrow(/integer/i);
  });

  it('rejects non-finite values', () => {
    expect(() => assertValidMinorUnits(NaN)).toThrow();
    expect(() => assertValidMinorUnits(Infinity)).toThrow();
  });
});
