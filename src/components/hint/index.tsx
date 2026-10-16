import { View } from 'react-native';

import { Icon } from '@app-components/icon';
import { ThemedText } from '@app-components/themed-text';
import { IconSize } from '@app-experience/theme';

import type { HintProps } from './interface';
import { styles } from './style';

/** The one line above a screen's button that says what is happening or what to do. */
export function Hint({ icon, message, style, ...rest }: HintProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {icon ? <Icon name={icon} size={IconSize.sm} color="ink3" /> : null}
      <ThemedText
        type="caption"
        themeColor="ink3"
        style={styles.message}
        accessibilityLiveRegion="polite">
        {message}
      </ThemedText>
    </View>
  );
}
