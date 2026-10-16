/**
 * Single entry point for design tokens:
 * `import { Colors, Spacing, Typography } from '@app-experience/theme'`.
 *
 * The tokens themselves live in `./tokens` — plain values, no imports — and this
 * file re-exports them and adds the pieces that need a framework: anything
 * touching expo-router or a platform check.
 *
 * Screens keep importing from here, so moving a token out into a shared package
 * later stays invisible to them.
 */

import { DefaultTheme } from 'expo-router';
import { Platform } from 'react-native';

import { Colors, Palette } from './tokens';

export * from './tokens';

/**
 * React Navigation's own theme, filled in from our tokens so that screen
 * backgrounds, headers and its fallback text colour match the rest of the app.
 *
 * Pinned to light. When a dark palette lands this becomes a pair and the root
 * layout picks between them.
 */
export const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.brand,
    background: Colors.light.bg,
    card: Colors.light.surface,
    text: Colors.light.ink,
    border: Colors.light.line,
    notification: Colors.light.danger,
  },
};

/**
 * Measurements of this app's own chrome rather than design tokens: the tab bar
 * is this app's, and the reading width is its layout choice.
 */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * The primary button while it can be pressed: lighter at the top left,
 * deepening to pressed blue. It sits over `brand`, so the button is still blue
 * wherever the gradient does not draw.
 */
export const ButtonGradient = `linear-gradient(135deg, #4F8FF7 0%, ${Palette.blue} 55%, ${Colors.light.brandPressed} 100%)`;

/** The page behind every screen: a soft sky wash at the top fading to near white. */
export const PageGradient =
  'linear-gradient(180deg, #DDEBFF 0%, #EDF4FF 30%, #F6F9FF 62%, #F9FBFF 100%)';
