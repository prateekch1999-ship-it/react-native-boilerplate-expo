import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@app-components/themed-text';
import { Colors, IconSize, Palette, Spacing } from '@app-experience/theme';
import { useStrings } from '@app-hooks/use-strings';
import { useAppSelector } from '@app-store/index';
import { selectLanguage } from '@app-store/language.slice';

import { styles } from './style';

/** The whole fade, start to finish. */
const DURATION = 600;

/**
 * The app-opening screen: the brand, the promise, and a quiet "getting ready"
 * while the app loads. It takes over from the native splash and fades out over
 * the first route, so there is no blank frame between the two.
 *
 * Replace the mark and the copy with yours; the handoff is the part worth
 * keeping.
 */
export function AnimatedSplashOverlay() {
  const strings = useStrings();
  const language = useAppSelector(selectLanguage);
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);
  // onLayout fires again on any relayout; the fade must only be started once.
  const started = useRef(false);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  /**
   * One view, mounted from the first frame until the fade ends. Swapping a
   * plain View for an Animated.View remounts the overlay and reloads the logo,
   * which shows as a flicker at the handoff from the native splash.
   */
  const start = () => {
    if (started.current) return;
    started.current = true;

    SplashScreen.hideAsync().finally(() => {
      // Hold for the first fifth, then fade out over half the duration.
      opacity.value = withDelay(
        DURATION * 0.2,
        withTiming(
          0,
          { duration: DURATION * 0.5, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) scheduleOnRN(setVisible, false);
          },
        ),
      );
    });
  };

  if (!visible) return null;

  return (
    <Animated.View onLayout={start} style={[styles.splashOverlay, fade]}>
      {/* Dark icons on the pale splash. Mounted after the route's status bar,
          so it wins while the overlay is up and hands back when it unmounts. */}
      <StatusBar style="dark" />
      <View style={[styles.splashContent, { paddingTop: insets.top + Spacing.four }]}>
        <View style={styles.brandRow}>
          <SunriseMark />
          <ThemedText type="title" themeColor="brandText">
            {strings.app.name}
          </ThemedText>
        </View>
        <ThemedText
          type="displayL"
          style={[styles.headline, language === 'hi' && styles.headlineDevanagari]}>
          {strings.splash.headline}
        </ThemedText>
        <ThemedText type="secondary" themeColor="ink2" style={styles.subtitle}>
          {strings.splash.subtitle}
        </ThemedText>
      </View>
      <View style={[styles.loading, { paddingBottom: insets.bottom + Spacing.six }]}>
        <ActivityIndicator size="small" color={Colors.light.brand} />
        <ThemedText type="caption" themeColor="ink3">
          {strings.splash.loading}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

/** A placeholder mark, drawn on the 24 grid the icon set uses. */
function SunriseMark() {
  return (
    <View style={styles.brandTile}>
      <Svg
        width={IconSize.md}
        height={IconSize.md}
        viewBox="0 0 24 24"
        fill="none"
        stroke={Palette.sun}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M4 16h16" />
        <Path d="M7 16a5 5 0 0110 0" />
        <Path d="M12 5v3M5.6 8.6l1.8 1.8M18.4 8.6l-1.8 1.8" />
      </Svg>
    </View>
  );
}
