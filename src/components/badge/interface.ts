import type { IconName } from '@app-components/icon/interface';

/**
 * The design's badges:
 * - `brand`: a frosted pill on the blue sign-up band, white label and a sun
 *   icon — "Licensed chemists".
 * - `tint`: a pale blue tag with blue text — a password rule that is met.
 * - `outline`: an outlined tag in grey — the same rule not met yet.
 */
export type BadgeType = 'brand' | 'tint' | 'outline';

export type BadgeProps = {
  label: string;
  /** Leads the label. Some badges are label only. */
  icon?: IconName;
  /** Defaults to `brand`. */
  type?: BadgeType;
};
