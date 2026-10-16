/**
 * Layout measurements. Use these instead of raw numbers so spacing, corners and
 * shadows stay consistent across screens.
 */
/**
 * 8-point grid. The key is the design file's own step label — `Spacing.two` is
 * its space-2 — so a value can be read off an artboard and used without doing
 * arithmetic.
 */
export const Spacing = {
  /** 4 · icon to its label */
  half: 4,
  /** 8 · tag rows, tight stacks */
  one: 8,
  /** 12 · the minimum padding inside a card */
  oneHalf: 12,
  /** 16 · page gutter and card padding */
  two: 16,
  /** 24 · gap between sections */
  three: 24,
  /** 32 · hero spacing */
  four: 32,
  five: 40,
  six: 48,
  seven: 56,
  eight: 64,
} as const;
export const Radius = {
  sm: 8,
  control: 12,
  card: 16,
  /** Top corners only, on bottom sheets. */
  sheet: 24,
  pill: 999,
} as const;
/**
 * Minimum hit areas. 48 is the floor for anything tappable and 56 is a primary
 * button. The Shop and Rider apps go a step larger again — they are used at a
 * counter and on a scooter, not on a sofa.
 */
export const TapTarget = {
  min: 48,
  primary: 56,
} as const;
/**
 * Elevation is tone first. These are the design's shadows verbatim, including
 * e1's two layers and the negative spreads, because React Native 0.86 accepts
 * `boxShadow` — none of it has to be flattened into shadowOffset/shadowRadius.
 */
export const Elevation = {
  /** Cards. */
  e1: [
    { offsetX: 0, offsetY: 1, blurRadius: 2, color: 'rgba(11, 27, 51, 0.05)' },
    { offsetX: 0, offsetY: 1, blurRadius: 1, color: 'rgba(11, 27, 51, 0.03)' },
  ],
  /** The order card, and anything selected. */
  e2: [
    { offsetX: 0, offsetY: 6, blurRadius: 20, spreadDistance: -6, color: 'rgba(11, 27, 51, 0.14)' },
  ],
  /** Sheets and toasts. */
  e3: [
    {
      offsetX: 0,
      offsetY: 16,
      blurRadius: 40,
      spreadDistance: -12,
      color: 'rgba(11, 27, 51, 0.26)',
    },
  ],
} satisfies Record<string, BoxShadow[]>;
/** Blur radius behind the frosted surfaces. */
export const Blur = {
  actionBar: 24,
  sheet: 28,
  notification: 30,
} as const;
/**
 * Motion confirms what just happened; it never hurries anyone. Three durations,
 * one curve. Anything animated needs a reduce-motion fallback.
 */
export const Motion = {
  fast: 150,
  base: 200,
  slow: 250,
  /** Spread into Easing.bezier(...Motion.easing). */
  easing: [0.2, 0.8, 0.2, 1],
  /** Loops: a counting tick, the timeline pulse, a spinner, a skeleton shimmer. */
  tick: 600,
  pulse: 1600,
  spin: 800,
  shimmer: 1200,
} as const;
/** Icons are drawn on a 24 grid with a 2 stroke. */
export const IconSize = {
  sm: 16,
  md: 20,
  base: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

/**
 * The shape React Native's `boxShadow` takes, declared locally so a token file
 * imports nothing. Structurally identical to RN's `BoxShadowValue`.
 */
export type BoxShadow = {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadDistance?: number;
  color: string;
};
