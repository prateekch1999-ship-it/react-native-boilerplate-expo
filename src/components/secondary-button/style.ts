import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@app-experience/theme';

const { light } = Colors;

export const styles = StyleSheet.create({
  // Padding, not a height: 56 tall at the default text size, and a label that
  // wraps grows the button.
  container: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: light.surface,
    borderWidth: 1.5,
    borderColor: light.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  pressed: { backgroundColor: light.surface2 },
});
