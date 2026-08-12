/**
 * Money handling for the single reporting currency: USD.
 *
 * All money is stored and computed as integer **minor units** (cents) to avoid
 * floating-point drift. USD has 2 decimal digits, so 1 dollar = 100 cents.
 */

/** Number of decimal digits in the reporting currency (USD). */
export const CURRENCY_DECIMAL_DIGITS = 2;

const MINOR_UNITS_PER_MAJOR = 10 ** CURRENCY_DECIMAL_DIGITS;

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * Asserts that a value is a valid amount of minor units:
 * a non-negative, finite integer. Throws a RangeError otherwise.
 */
export function assertValidMinorUnits(minor: number): void {
  if (!Number.isFinite(minor)) {
    throw new RangeError(`Minor units must be a finite number, received ${minor}`);
  }
  if (!Number.isInteger(minor)) {
    throw new RangeError(`Minor units must be an integer, received ${minor}`);
  }
  if (minor < 0) {
    throw new RangeError(`Minor units must be non-negative, received ${minor}`);
  }
  if (minor > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(`Minor units exceed the safe integer range, received ${minor}`);
  }
}

/**
 * Converts an amount in major units (dollars) to integer minor units (cents),
 * rounding to the nearest cent. Rejects non-finite or negative amounts.
 */
export function toMinorUnits(major: number): number {
  if (!Number.isFinite(major)) {
    throw new RangeError(`Amount must be a finite number, received ${major}`);
  }
  if (major < 0) {
    throw new RangeError(`Amount must be non-negative, received ${major}`);
  }
  // Nudge by EPSILON so exact half-cents (e.g. 1.005) round up reliably despite
  // floating-point representation.
  const minor = Math.round((major + Number.EPSILON) * MINOR_UNITS_PER_MAJOR);
  if (!Number.isSafeInteger(minor)) {
    throw new RangeError(`Amount too large to represent exactly, received ${major}`);
  }
  return minor;
}

/**
 * Converts integer minor units (cents) back to major units (dollars).
 * Use only for display/serialization, never for intermediate math.
 */
export function fromMinorUnits(minor: number): number {
  assertValidMinorUnits(minor);
  return minor / MINOR_UNITS_PER_MAJOR;
}

/**
 * Formats an amount in minor units (cents) as a USD display string,
 * e.g. 8500000 -> "$85,000.00".
 */
export function formatUsd(minor: number): string {
  assertValidMinorUnits(minor);
  return usdFormatter.format(minor / MINOR_UNITS_PER_MAJOR);
}
