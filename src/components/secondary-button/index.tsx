import { Pressable } from 'react-native';

import { Icon } from '@app-components/icon';
import { ThemedText } from '@app-components/themed-text';
import { IconSize } from '@app-experience/theme';

import type { SecondaryButtonProps } from './interface';
import { styles } from './style';

/** The outlined second action, under a screen's one PrimaryButton. */
export function SecondaryButton({ label, icon, leading, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      {leading ?? (icon ? <Icon name={icon} size={IconSize.md} /> : null)}
      <ThemedText type="title">{label}</ThemedText>
    </Pressable>
  );
}
