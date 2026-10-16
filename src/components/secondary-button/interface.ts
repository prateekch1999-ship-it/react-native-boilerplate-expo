import type { ReactNode } from 'react';

import type { IconName } from '@app-components/icon/interface';

export type SecondaryButtonProps = {
  label: string;
  /** Leads the label, in the label's colour. */
  icon?: IconName;
  /**
   * A mark that is not one of the app's icons — a brand's own logo, in its own
   * colours. Takes the place of `icon`.
   */
  leading?: ReactNode;
  onPress: () => void;
};
