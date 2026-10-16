import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@app-experience/theme';

/** The user-app design rounds the action bar a step past a sheet's corner. */
const ACTION_BAR_RADIUS = Radius.sheet + Spacing.half;

// The design lifts the bar with a shadow cast upward instead of a hairline:
// a faint edge, then a wide blue glow.
const ACTION_BAR_SHADOW =
  '0px -1px 0px rgba(11, 27, 51, 0.04), 0px -20px 40px -26px rgba(35, 115, 244, 0.45)';

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  // A ScrollView contentContainer: fills the screen when the content is short,
  // which is what keeps short screens from floating, and scrolls when it is
  // not. The bottom padding is added by the component — it clears the action
  // bar, whose height is only known once it has laid out.
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
  },
  /** Still fills the screen, but the screen owns its own gutters and gaps. */
  fullBleed: { flexGrow: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  /** Floats over the content at the bottom of the screen. */
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: ACTION_BAR_RADIUS,
    borderTopRightRadius: ACTION_BAR_RADIUS,
    boxShadow: ACTION_BAR_SHADOW,
  },
  actionBarContent: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.three,
    // Lifts the buttons well clear of the bottom edge, on top of the safe-area inset.
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
});
