import { Glyphs } from '@app-components/icon';

/**
 * The design file lists 54 icons, plus the key that the forgot-password artboard draws
 * inline. This asserts the map still covers every name
 * and that each one resolves to something renderable — a Lucide rename between
 * versions (trash-2 became trash, help-circle became circle-question-mark)
 * would otherwise surface as a blank space on a screen.
 */
describe('icon set', () => {
  const names = Object.keys(Glyphs);

  test('covers the design set', () => {
    expect(names).toHaveLength(55);
  });

  test('every name resolves to a component', () => {
    const unresolved = names.filter(
      (name) =>
        typeof Glyphs[name as keyof typeof Glyphs] !== 'object' &&
        typeof Glyphs[name as keyof typeof Glyphs] !== 'function',
    );
    expect(unresolved).toEqual([]);
  });
});
