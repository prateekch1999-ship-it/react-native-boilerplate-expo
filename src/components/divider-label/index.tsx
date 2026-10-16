import { View } from 'react-native';

import { ThemedText } from '@app-components/themed-text';

import type { DividerLabelProps } from './interface';
import { styles } from './style';

/** A hairline either side of a short caption, between a screen's two ways on. */
export function DividerLabel({ label }: DividerLabelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <ThemedText type="caption" themeColor="ink3" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.rule} />
    </View>
  );
}
