import { View } from 'react-native';

import { useTheme } from '@app-hooks/use-theme';

import type { ThemedViewProps } from './interface';

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'bg'] }, style]} {...otherProps} />;
}
