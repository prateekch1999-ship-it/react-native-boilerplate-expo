import type { IconName } from '@app-components/icon/interface';

export type PrimaryButtonProps = {
  label: string;
  /** Leads the label, in the label's colour. */
  icon?: IconName;
  /** Follows the label, in the label's colour — an arrow on a step that moves on. */
  trailingIcon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  /**
   * Work is under way: a spinner leads the label and presses are ignored, but
   * the button keeps its colour — it is busy, not unavailable.
   */
  loading?: boolean;
};
