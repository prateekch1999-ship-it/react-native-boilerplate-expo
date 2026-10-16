import { StyleSheet } from 'react-native';

import { Spacing } from '@app-experience/theme';

// The screen frame, its padding and its gaps come from <Screen>. Only what is
// particular to this screen belongs here.
export const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.one,
  },
});
