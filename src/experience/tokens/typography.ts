/**
 * The type scale, straight from the design file's User app column.
 *
 * Shop and Rider run one step larger with higher-contrast greys. That scale
 * belongs with those apps, so it is deliberately not here.
 */
/**
 * Plus Jakarta Sans at the four weights the design uses. expo-font registers
 * each weight under its own family name, so the entries below set `fontFamily`
 * and never `fontWeight` — asking for a weight the family does not carry is
 * what produces the fake-bold Android renders.
 */
export const FontFamily = {
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;
/**
 * Noto Sans Devanagari, for Hindi copy.
 *
 * Medicine names stay in Latin in both languages — they are read off the pack,
 * and transliterating them would be a dispensing error waiting to happen.
 */
export const FontFamilyDevanagari = {
  medium: 'NotoSansDevanagari_500Medium',
  semiBold: 'NotoSansDevanagari_600SemiBold',
  bold: 'NotoSansDevanagari_700Bold',
  extraBold: 'NotoSansDevanagari_800ExtraBold',
} as const;
/**
 * letterSpacing is in points here, converted from the design's em values —
 * -0.02em on display-l at 28 pt is -0.56.
 */
export const Typography = {
  displayL: {
    fontFamily: FontFamily.extraBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
  },
  display: { fontFamily: FontFamily.extraBold, fontSize: 24, lineHeight: 28, letterSpacing: -0.48 },
  heading: { fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: FontFamily.medium, fontSize: 16, lineHeight: 24 },
  secondary: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.12 },
  /** Prices and totals. Tabular, so digits do not jitter while a bill updates. */
  amount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  /** The 4-digit delivery code, read aloud at the door. */
  code: {
    fontFamily: FontFamily.extraBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 6.4,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextToken>;
/**
 * The same scale in Devanagari. Sizes are identical so the two languages lay
 * out the same, with +4 line height on body and secondary where the taller
 * glyphs and their matras need the room.
 *
 * `satisfies` against TypographyVariant means a variant added above without a
 * Hindi counterpart fails to compile rather than silently falling back to a
 * Latin face.
 */
export const TypographyDevanagari = {
  displayL: {
    fontFamily: FontFamilyDevanagari.extraBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
  },
  display: {
    fontFamily: FontFamilyDevanagari.extraBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.48,
  },
  heading: {
    fontFamily: FontFamilyDevanagari.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  title: { fontFamily: FontFamilyDevanagari.bold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: FontFamilyDevanagari.medium, fontSize: 16, lineHeight: 28 },
  secondary: { fontFamily: FontFamilyDevanagari.medium, fontSize: 14, lineHeight: 24 },
  caption: {
    fontFamily: FontFamilyDevanagari.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  amount: {
    fontFamily: FontFamilyDevanagari.extraBold,
    fontSize: 20,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  code: {
    fontFamily: FontFamilyDevanagari.extraBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 6.4,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextToken>;

/** Every type style a screen may ask for by name. */
export type TypographyVariant = keyof typeof Typography;

/**
 * The subset of React Native's `TextStyle` a type token sets. Declared locally
 * so a token file imports nothing; the app checks the real assignability when
 * it applies one to a `<Text>`.
 */
export type TextToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontVariant?: ['tabular-nums'];
};
