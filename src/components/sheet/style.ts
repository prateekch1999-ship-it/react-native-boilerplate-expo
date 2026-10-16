import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@app-experience/theme';

export const styles = StyleSheet.create({
  /**
   * Rounded at the top only — the bottom runs off the screen. `overflow` is
   * what makes the glass take the corners rather than squaring them off.
   */
  background: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    overflow: 'hidden',
  },
  handle: { backgroundColor: Colors.light.lineStrong },
  content: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
});
