import { StyleSheet } from 'react-native';

import { ButtonGradient, Radius, Spacing } from '@app-experience/theme';

/** A blue glow pulled in tight under the button, so it reads as lift rather than haze. */
export const ACTIVE_SHADOW = '0px 14px 26px -14px rgba(35, 115, 244, 0.85)';
export const DISABLED_SHADOW = '0px 6px 12px rgba(180, 180, 180, 0.20)';

/** The design's sheen: a soft band of white, slanted a little past upright. */
const SHEEN_GRADIENT =
  'linear-gradient(105deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 50%, rgba(255, 255, 255, 0) 100%)';

export const styles = StyleSheet.create({
  // ponytail: the components sheet says r 14 for a 56-high primary, but both
  // screenshots show a pill. Following the screenshots.
  //
  // The radius is on both layers on purpose: the glass shapes itself to the
  // inner one, and the outer clip catches the press highlight and the sheen
  // at the corners.
  hitArea: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  surface: {
    // Padding, not a height: 56 tall at the default text size, and a label that
    // wraps grows the button.
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  // A hairline of light along the top edge, the way the design catches it.
  active: { boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.26)' },
  gradient: { experimental_backgroundImage: ButtonGradient },
  // Its width is a share of the button's, so it sweeps a long label as fast as a short one.
  sheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '45%',
    experimental_backgroundImage: SHEEN_GRADIENT,
  },
});
