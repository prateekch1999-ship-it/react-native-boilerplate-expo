import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { canUseGlass, Glass } from '@app-components/glass';
import { Icon } from '@app-components/icon';
import { ThemedText } from '@app-components/themed-text';
import { Colors, IconSize } from '@app-experience/theme';

import type { PrimaryButtonProps } from './interface';
import { ACTIVE_SHADOW, DISABLED_SHADOW, styles } from './style';

const { light } = Colors;

/**
 * The design's sheen: once the button can be pressed, a band of light crosses
 * it every 6.4s, waiting 2s before the first pass. It spends most of each cycle
 * parked off the left edge and only the last 22% crossing — rare enough to
 * notice rather than to watch.
 */
const SHEEN_CYCLE_MS = 6400;
const SHEEN_SWEEP_MS = SHEEN_CYCLE_MS * 0.22;
const SHEEN_REST_MS = SHEEN_CYCLE_MS - SHEEN_SWEEP_MS;
const SHEEN_FIRST_DELAY_MS = 2000;
/** The design's own curve for this one, not the app's motion curve. */
const SHEEN_EASING = Easing.bezier(0.4, 0, 0.2, 1);
/** In band widths: fully off the left edge, then fully off the right. */
const SHEEN_FROM = -1.2;
const SHEEN_TO = 3.3;

/**
 * One per screen, in the action bar. The design allows no second one.
 *
 * The fill is a glass tint rather than a flat colour, so on iOS 26 the button
 * picks up the specular edge and presses in under a finger. The tint is the
 * same brand blue either way, which is what keeps the white label legible —
 * clear glass here would hand the label whatever happened to scroll behind it.
 */
export function PrimaryButton({
  label,
  icon,
  trailingIcon,
  onPress,
  disabled,
  loading,
}: PrimaryButtonProps) {
  // Real glass is tinted by iOS itself; a gradient painted over it would hide the glass.
  const showsGradient = !disabled && !canUseGlass();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.hitArea, { boxShadow: disabled ? DISABLED_SHADOW : ACTIVE_SHADOW }]}>
      {({ pressed }) => {
        const tint = disabled ? light.surface3 : pressed ? light.brandPressed : light.brand;
        const labelColor = disabled ? 'inkDisabled' : 'onBrand';

        return (
          <Glass
            interactive
            tint={tint}
            style={[
              styles.surface,
              !disabled && styles.active,
              showsGradient && !pressed && styles.gradient,
            ]}>
            {/* Busy is not ready: the light only runs on a button waiting for a press. */}
            {disabled || loading ? null : <Sheen />}
            {loading ? (
              <ActivityIndicator color={light[labelColor]} />
            ) : icon ? (
              <Icon name={icon} size={IconSize.md} color={labelColor} />
            ) : null}
            <ThemedText type="title" themeColor={labelColor}>
              {label}
            </ThemedText>
            {trailingIcon && !loading ? (
              <Icon name={trailingIcon} size={IconSize.md} color={labelColor} />
            ) : null}
          </Glass>
        );
      }}
    </Pressable>
  );
}

/** Decoration only: nothing to read, nothing to touch, and gone under reduce motion. */
function Sheen() {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  // The band moves by its own width, which is only known once it has laid out.
  const [bandWidth, setBandWidth] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const sweep = withTiming(1, { duration: SHEEN_SWEEP_MS, easing: SHEEN_EASING });
    // Snap back while off screen, then rest before the next pass.
    const cycle = withSequence(withDelay(SHEEN_REST_MS, sweep), withTiming(0, { duration: 0 }));
    progress.set(withDelay(SHEEN_FIRST_DELAY_MS, withRepeat(cycle, -1)));
  }, [reduceMotion, progress]);

  const position = useAnimatedStyle(() => ({
    // Hidden until measured: at width 0 the band would sit on the button, not beside it.
    opacity: bandWidth ? 1 : 0,
    transform: [
      {
        translateX: interpolate(
          progress.get(),
          [0, 1],
          [SHEEN_FROM * bandWidth, SHEEN_TO * bandWidth],
        ),
      },
    ],
  }));

  if (reduceMotion) return null;

  return (
    <Animated.View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      onLayout={(event) => setBandWidth(event.nativeEvent.layout.width)}
      style={[styles.sheen, position]}
    />
  );
}
