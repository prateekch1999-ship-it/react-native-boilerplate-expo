import { Strings, fill, splitAround } from '@app-experience/strings';

describe('fill', () => {
  test('substitutes a named placeholder', () => {
    expect(fill('{number} is now your login.', { number: '+91 98970 41236' })).toBe(
      '+91 98970 41236 is now your login.',
    );
  });

  test('takes numbers as well as strings', () => {
    expect(fill('No match. {tries} tries left.', { tries: 2 })).toBe('No match. 2 tries left.');
  });

  test('leaves an unknown placeholder alone rather than blanking it', () => {
    expect(fill('Look for {sender}.', {})).toBe('Look for {sender}.');
  });

  test('replaces every occurrence', () => {
    expect(fill('{a} and {a}', { a: 'x' })).toBe('x and x');
  });
});

describe('splitAround', () => {
  test('returns the words either side of the placeholder', () => {
    expect(splitAround(Strings.en.common.agreement, 'terms')).toEqual([
      'By continuing you agree to our ',
      ' and {privacy}',
    ]);
  });

  test('follows the language when the value comes first', () => {
    expect(splitAround('{terms} से सहमत', 'terms')).toEqual(['', ' से सहमत']);
  });

  test('keeps the whole template when the placeholder is missing', () => {
    expect(splitAround('Send again', 'time')).toEqual(['Send again', '']);
  });
});

describe('translations', () => {
  test('every language carries the same keys', () => {
    const paths = (strings: object, prefix = ''): string[] =>
      Object.entries(strings).flatMap(([key, value]) =>
        typeof value === 'object' && value !== null
          ? paths(value, `${prefix}${key}.`)
          : [`${prefix}${key}`],
      );

    expect(paths(Strings.hi)).toEqual(paths(Strings.en));
  });
});
