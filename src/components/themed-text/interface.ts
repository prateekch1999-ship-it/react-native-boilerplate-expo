import type { TextProps } from 'react-native';

import type { ThemeColor, TypographyVariant } from '@app-experience/theme';

export type ThemedTextProps = TextProps & {
  type?: TypographyVariant;
  themeColor?: ThemeColor;
  /**
   * Forces a script rather than following the app language. Medicine names stay
   * `latin` in both languages, because they are read off the pack.
   */
  script?: 'latin' | 'devanagari';
};
