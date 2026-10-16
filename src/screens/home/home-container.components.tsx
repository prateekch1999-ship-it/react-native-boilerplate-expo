import { ThemedText } from '@app-components/themed-text';

import type { HomeHeaderProps } from './home-container.interface';
import { styles } from './home-container.styles';

/** Pieces used only by this screen. Anything reused elsewhere belongs in src/components. */
export function HomeHeader({ title }: HomeHeaderProps) {
  return (
    <ThemedText type="display" style={styles.header}>
      {title}
    </ThemedText>
  );
}
