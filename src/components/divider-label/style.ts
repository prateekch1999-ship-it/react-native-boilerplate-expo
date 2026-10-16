import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@app-experience/theme';

const { light } = Colors;

export const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  rule: { flex: 1, borderTopWidth: 1, borderTopColor: light.line },
  label: { flexShrink: 1, textAlign: 'center' },
});
