import { Text } from 'react-native';

import { Typography, TypographyDevanagari } from '@app-experience/theme';
import { useTheme } from '@app-hooks/use-theme';
import { useTypography } from '@app-hooks/use-typography';

import type { ThemedTextProps } from './interface';

const Scales = { latin: Typography, devanagari: TypographyDevanagari };

export function ThemedText({ style, type = 'body', themeColor, script, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const forLanguage = useTypography();
  const scale = script ? Scales[script] : forLanguage;

  return <Text style={[{ color: theme[themeColor ?? 'ink'] }, scale[type], style]} {...rest} />;
}
