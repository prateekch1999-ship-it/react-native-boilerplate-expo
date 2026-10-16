import type { ViewProps } from 'react-native';

import type { ThemeColor } from '@app-experience/theme';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};
