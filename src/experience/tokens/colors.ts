/**
 * Every colour the app is allowed to use. The names match the design file's
 * tokens (mh.css), so a value can be traced from an artboard to this file
 * without a translation step.
 *
 * Light only today. Dark is planned: add a `dark` key with the same shape and
 * teach `useTheme()` to choose between them. Every screen already reads colour
 * through that hook, so nothing else has to change.
 *
 * The design file nests the status colours (`match: { bg, fg }`). They are flat
 * here so `ThemeColor` stays a union of colour names and `theme[name]` is
 * always a colour, never an object.
 */
export const Colors = {
  light: {
    // Surfaces, back to front.
    bg: '#F5F8FD',
    surface: '#FFFFFF',
    surface2: '#EDF2FA',
    surface3: '#E1E8F3',
    // Text and icons, darkest first. ink is 16.6:1 on bg; ink3 is the lightest
    // that still passes AA for body text.
    ink: '#0B1B33',
    ink2: '#3C4B63',
    ink3: '#5E6B82',
    inkDisabled: '#A0AABB',
    // Hairlines, then input borders.
    line: '#E3E9F3',
    lineStrong: '#CBD5E4',
    // Brand. brandText is the only blue allowed at text size on white (5.9:1);
    // brand itself is for fills, where contrast is carried by onBrand.
    brand: '#2373F4',
    brandPressed: '#1A5FD6',
    brandText: '#1A5FD6',
    brandTint: '#E3EDFE',
    brandTint2: '#F0F5FF',
    onBrand: '#FFFFFF',
    // Delight accents. Both are light, so both always carry ink text, never white.
    glow: '#65D0F4',
    glowTint: '#F2F7A0',
    // Bill-line status. Colour never travels alone here — every use carries the
    // word as well, so the four states still read without colour vision.
    matchBg: '#DFF5EA',
    matchFg: '#067A4B',
    subBg: '#FFF0D2',
    subFg: '#7A4700',
    differsBg: '#FDE3DF',
    differsFg: '#B0261A',
    unsureBg: '#E9EDF3',
    unsureFg: '#3C4B63',
    // Destructive only, and never the first button in a pair.
    danger: '#C8281E',
    // Overlays.
    scrim: 'rgba(11, 27, 51, 0.48)',
    glass: 'rgba(252, 253, 255, 0.80)',
    camera: '#0A1426',
  },
} as const;
/**
 * The raw brand ramp. Prefer a semantic colour above; this is for the few
 * places the design reaches for blue-soft directly — progress rails and
 * gradients — which have no semantic token of their own.
 */
export const Palette = {
  blue: '#2373F4',
  blueSoft: '#578EF5',
  sky: '#65D0F4',
  sun: '#F2F7A0',
} as const;

/** Every colour name a screen may ask the theme for. */
export type ThemeColor = keyof typeof Colors.light;
