import { View } from 'react-native';

import { Icon } from '@app-components/icon';
import { ThemedText } from '@app-components/themed-text';

import type { BadgeProps } from './interface';
import { styles, typeLooks, typeStyles } from './style';

/** A short label in a pill, with an optional icon ahead of it. Read, not tapped. */
export function Badge({ label, icon, type = 'brand' }: BadgeProps) {
  const look = typeLooks[type];

  return (
    <View style={[styles.base, typeStyles[type]]}>
      {icon ? <Icon name={icon} size={look.iconSize} color={look.icon} /> : null}
      <ThemedText type="caption" themeColor={look.label} numberOfLines={1} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}
