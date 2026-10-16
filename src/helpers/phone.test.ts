import { digitsOnly, formatMobile, isCompleteMobile, toE164National } from '@app-helpers/phone';

describe('digitsOnly', () => {
  test('drops spaces, punctuation and letters', () => {
    expect(digitsOnly('98970 41236')).toBe('9897041236');
    expect(digitsOnly('+91-98970-41236')).toBe('919897041236'.slice(0, 10));
  });

  test('caps at ten digits so a pasted number cannot overflow the field', () => {
    expect(digitsOnly('98970412369999')).toBe('9897041236');
  });

  test('returns empty for input with no digits at all', () => {
    expect(digitsOnly('abc')).toBe('');
  });

  /**
   * A Hindi keyboard types Devanagari digits, and JavaScript's `\d` is
   * ASCII-only. Without the mapping these are dropped as punctuation and the
   * field stays empty for exactly the people the Hindi translation is for.
   */
  test('reads the digits a Hindi keyboard types', () => {
    expect(digitsOnly('९८९७०४१२३६')).toBe('9897041236');
  });

  test('reads a number typed half in each script', () => {
    expect(digitsOnly('98970४१२३६')).toBe('9897041236');
  });

  test('still drops Devanagari letters, which are not digits', () => {
    expect(digitsOnly('नमस्ते')).toBe('');
  });
});

describe('formatMobile', () => {
  test('groups as 5 + 5 once past the fifth digit', () => {
    expect(formatMobile('9897041236')).toBe('98970 41236');
  });

  test('leaves a part-typed number ungrouped until there is a second group', () => {
    expect(formatMobile('98970')).toBe('98970');
    expect(formatMobile('989')).toBe('989');
  });

  test('is idempotent, so re-rendering a formatted value does not double-space it', () => {
    expect(formatMobile(formatMobile('9897041236'))).toBe('98970 41236');
  });
});

describe('isCompleteMobile', () => {
  test('accepts a ten-digit number starting 6 to 9', () => {
    expect(isCompleteMobile('9897041236')).toBe(true);
    expect(isCompleteMobile('6000000000')).toBe(true);
  });

  test('accepts the formatted form, since that is what the field holds', () => {
    expect(isCompleteMobile('98970 41236')).toBe(true);
  });

  test('rejects a number that is too short', () => {
    expect(isCompleteMobile('989704123')).toBe(false);
  });

  test('rejects a landline or short code, which never starts 6 to 9', () => {
    expect(isCompleteMobile('5897041236')).toBe(false);
    expect(isCompleteMobile('0897041236')).toBe(false);
  });
});

describe('toE164National', () => {
  test('sends the API bare digits, whatever the field is displaying', () => {
    expect(toE164National('98970 41236')).toBe('9897041236');
  });
});
