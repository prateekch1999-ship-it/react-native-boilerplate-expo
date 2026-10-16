import type { Palette, ThemeColor } from '@app-experience/theme';

/**
 * The design file's 54-icon set, by its own names, plus `key` from the
 * forgot-password artboard. These are the contract — the
 * library behind them is an implementation detail, so swapping it would never
 * touch a screen.
 */
export type IconName =
  | 'alert'
  | 'arrow-right'
  | 'back'
  | 'barcode-scan'
  | 'battery-low'
  | 'bell'
  | 'bell-off'
  | 'box'
  | 'calendar'
  | 'camera'
  | 'cash'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'document'
  | 'edit'
  | 'expand'
  | 'eye'
  | 'flame'
  | 'flash'
  | 'globe'
  | 'gps-off'
  | 'help'
  | 'home'
  | 'image'
  | 'info'
  | 'key'
  | 'lock'
  | 'minus'
  | 'more'
  | 'navigate'
  | 'orders'
  | 'pause'
  | 'phone'
  | 'pill'
  | 'pin'
  | 'plus'
  | 'power'
  | 'qr'
  | 'refresh'
  | 'scooter'
  | 'search'
  | 'settings'
  | 'shield-check'
  | 'snowflake'
  | 'sparkle'
  | 'store'
  | 'swap'
  | 'trash'
  | 'user'
  | 'volume'
  | 'wallet'
  | 'wifi-off';

export type IconProps = {
  name: IconName;
  /** Defaults to IconSize.base (24), the grid the set is drawn on. */
  size?: number;
  /**
   * A theme colour name; the glyph inherits it, matching the design's
   * currentColor. A palette accent (`sun`, `sky`…) is for decoration on the
   * brand blue, where the theme's text colours are not what the design draws.
   */
  color?: ThemeColor | keyof typeof Palette;
};
