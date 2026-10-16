import type { ViewProps } from 'react-native';

import type { IconName } from '@app-components/icon/interface';

export type HintProps = ViewProps & {
  icon?: IconName;
  message: string;
};
