import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View } from 'react-native';

import type { GlassProps } from './interface';
import { styles } from './style';

/**
 * Whether this device can draw liquid glass, which is not the same question as
 * "is this an iPhone". It needs iOS 26, and some iOS 26 betas shipped without
 * the API at all — reaching for it there crashes, hence the second check.
 *
 * Both calls return `false` off iOS without touching a native module, so this
 * is safe to ask on Android.
 *
 * App-wide and constant for the life of the process, so it is resolved once:
 * the real work is a native-module lookup, not arithmetic.
 */
let supported: boolean | undefined;

export function canUseGlass(): boolean {
  supported ??= isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  return supported;
}

/**
 * A frosted surface, and the one place that decides what to do when frost is
 * not available. The design's `Blur` tokens describe these surfaces — the
 * action bar, sheets, toasts — and iOS draws them itself; nothing here sets a
 * blur radius.
 *
 * Everywhere else, including Android and iOS 16–25, the same surface falls back
 * to the opaque `surface` colour. That is a deliberate downgrade rather than a
 * translucent approximation: a cheap fake blur behind an action bar is the kind
 * of thing that costs frames on the low-end Androids this app has to run on.
 *
 * `tint` colours the glass and doubles as the fallback's fill, so a caller
 * states its colour once.
 */
export function Glass({ children, style, tint, interactive, ...rest }: GlassProps) {
  if (!canUseGlass()) {
    return (
      <View style={[styles.solid, !!tint && { backgroundColor: tint }, style]} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      glassEffectStyle="regular"
      tintColor={tint}
      isInteractive={interactive}
      // The palette has no dark values yet, so the app is pinned to light and
      // the glass has to be too — `auto` would frost it dark on a device in
      // dark mode and leave dark-on-dark text.
      colorScheme="light"
      style={style}
      {...rest}>
      {children}
    </GlassView>
  );
}
