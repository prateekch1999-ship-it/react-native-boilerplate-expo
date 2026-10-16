import type { ColorValue, ViewProps } from 'react-native';

export type GlassProps = ViewProps & {
  /**
   * Tints the glass, and fills the opaque fallback. Leave it off for a plain
   * frosted surface over whatever is behind it.
   */
  tint?: ColorValue;
  /**
   * Lets iOS animate the glass under a finger. For glass that is itself the
   * control — a button — not for a bar that merely contains controls.
   */
  interactive?: boolean;
};
