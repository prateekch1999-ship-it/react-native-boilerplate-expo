/**
 * Indian mobile numbers, the only kind this app takes.
 *
 * The country code is fixed at +91 in the UI, so everything here works on the
 * 10 national digits alone.
 */

const NATIONAL_LENGTH = 10;

/** Indian mobile numbers start 6–9; landlines and short codes do not. */
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/**
 * `०` — where Devanagari's digits start. They run to `९` in the same order as
 * `0`–`9`, so the Latin digit is the offset from this one.
 */
const DEVANAGARI_ZERO = 0x0966;

/**
 * Devanagari digits read as Latin ones.
 *
 * A Hindi keyboard types `९८९७०४१२३६`, and JavaScript's `\d` matches ASCII
 * only — so without this the strip below reduces that to nothing and the field
 * stays empty for exactly the people the Hindi translation is for.
 *
 * ponytail: Devanagari alone. It is the only other script this app offers, and
 * the only other keyboard it implies; add a range here if a language ever does.
 */
function toLatinDigits(input: string): string {
  return input.replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - DEVANAGARI_ZERO));
}

/** Everything that is not a digit, dropped — paste, autofill and spaces included. */
export function digitsOnly(input: string): string {
  return toLatinDigits(input).replace(/\D/g, '').slice(0, NATIONAL_LENGTH);
}

/** `9897041236` reads back as `98970 41236`, the 5 + 5 grouping the design uses. */
export function formatMobile(digits: string): string {
  const clean = digitsOnly(digits);
  return clean.length > 5 ? `${clean.slice(0, 5)} ${clean.slice(5)}` : clean;
}

export function isCompleteMobile(digits: string): boolean {
  return MOBILE_PATTERN.test(digitsOnly(digits));
}

/** What the API is given: no spaces, no country code. */
export function toE164National(digits: string): string {
  return digitsOnly(digits);
}
