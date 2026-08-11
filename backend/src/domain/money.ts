/**
 * Money handling for the single reporting currency: USD.
 *
 * All money is stored and computed as integer **minor units** (cents) to avoid
 * floating-point drift. USD has 2 decimal digits, so 1 dollar = 100 cents.
 */

/** Number of decimal digits in the reporting currency (USD). */
export const CURRENCY_DECIMAL_DIGITS = 2;

const MINOR_UNITS_PER_MAJOR = 10 ** CURRENCY_DECIMAL_DIGITS;

/**
 * Converts an amount in major units (dollars) to integer minor units (cents),
 * rounding to the nearest cent.
 */
export function toMinorUnits(major: number): number {
  return Math.round(major * MINOR_UNITS_PER_MAJOR);
}
