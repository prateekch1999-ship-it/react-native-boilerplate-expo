import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing, TapTarget, Typography } from '@app-experience/theme';

// Raw tokens rather than `useTheme()`: see the note in index.tsx. Light only,
// which is all the palette has.
const { light } = Colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.bg,
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.three,
  },
  copy: { gap: Spacing.one },
  title: { ...Typography.heading, color: light.ink },
  body: { ...Typography.body, color: light.ink2 },
  button: {
    height: TapTarget.primary,
    borderRadius: Radius.control,
    backgroundColor: light.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...Typography.title, color: light.onBrand },
  pressed: { backgroundColor: light.brandPressed },
});
