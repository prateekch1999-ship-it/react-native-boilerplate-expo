import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@app-experience/theme';

const SPLASH_BACKGROUND =
  'radial-gradient(90% 60% at 50% 58%, #FFFFFF 0%, rgba(255, 255, 255, 0) 70%), linear-gradient(180deg, #CFE3FF 0%, #E3EEFF 46%, #F3F8FF 100%)';
const BRAND_TILE_SHADOW = '0px 6px 14px -6px rgba(35, 115, 244, 0.75)';

const HEADLINE_SIZE = 40;
const HEADLINE_LINE = 44;
const HEADLINE_LINE_DEVANAGARI = 56;
/** -0.03em at 40, as the artboard sets it. */
const HEADLINE_TRACKING = -1.2;

export const styles = StyleSheet.create({
  /**
   * The design's pale sky: a white glow just below centre over a top-to-bottom
   * blue wash. Splash-only colours, kept here with the screen that uses them.
   */
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: SPLASH_BACKGROUND,
    zIndex: 1000,
  },
  // Everything but the loading line, stacked from the top and centred.
  splashContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  brandTile: {
    padding: Spacing.half,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.brand,
    boxShadow: BRAND_TILE_SHADOW,
  },
  // Larger than any type token: the splash's one statement, as the artboard
  // draws it. Devanagari keeps the same size with room for its matras.
  headline: {
    marginTop: Spacing.four,
    fontSize: HEADLINE_SIZE,
    lineHeight: HEADLINE_LINE,
    letterSpacing: HEADLINE_TRACKING,
    textAlign: 'center',
  },
  headlineDevanagari: { lineHeight: HEADLINE_LINE_DEVANAGARI, letterSpacing: 0 },
  subtitle: { marginTop: Spacing.oneHalf, maxWidth: '75%', textAlign: 'center' },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
