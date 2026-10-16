import { StyleSheet } from 'react-native';

import { Spacing } from '@app-experience/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  message: { flexShrink: 1, textAlign: 'center' },
});
