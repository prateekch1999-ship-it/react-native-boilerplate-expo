import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { AnimatedSplashOverlay } from '@app-components/animated-icon';
import { CrashScreen } from '@app-components/crash-screen';
import { NavigationTheme } from '@app-experience/theme';
import Crash from '@app-helpers/crash';
import { useScreenTracking } from '@app-hooks/use-screen-tracking';
import { store } from '@app-store/index';

SplashScreen.preventAutoHideAsync();

/**
 * Catches a throw from any render below and shows something instead of a blank
 * screen. expo-router picks this up by name from a route file; exported from
 * the root layout, it covers the whole app.
 *
 * It renders in place of everything below, including the providers — hence a
 * crash screen that needs none of them.
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <CrashScreen {...props} />;
}

export default function RootLayout() {
  // The four weights of each script the type scale uses. Loaded by file rather
  // than from the packages' barrels, which require every variant at module
  // scope and would bundle far more font than the scale needs.
  //
  // Holding the splash until they are ready keeps text from flashing in the
  // system face first.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_500Medium: require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'),
    PlusJakartaSans_600SemiBold: require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
    PlusJakartaSans_700Bold: require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
    PlusJakartaSans_800ExtraBold: require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf'),
    NotoSansDevanagari_500Medium: require('@expo-google-fonts/noto-sans-devanagari/500Medium/NotoSansDevanagari_500Medium.ttf'),
    NotoSansDevanagari_600SemiBold: require('@expo-google-fonts/noto-sans-devanagari/600SemiBold/NotoSansDevanagari_600SemiBold.ttf'),
    NotoSansDevanagari_700Bold: require('@expo-google-fonts/noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf'),
    NotoSansDevanagari_800ExtraBold: require('@expo-google-fonts/noto-sans-devanagari/800ExtraBold/NotoSansDevanagari_800ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontError) Crash.recordError(fontError, { stage: 'font-load' });
  }, [fontError]);

  // A font that fails to load falls back to the system face. Waiting on it
  // forever would leave the app sitting on the splash screen instead.
  if (!fontsLoaded && !fontError) return null;

  return (
    // Outermost, and it has to be: every bottom sheet in the app is dragged by
    // a gesture handler, and a handler outside this view silently never fires.
    <GestureHandlerRootView style={styles.fill}>
      <Provider store={store}>
        {/* Light theme only for now — the palette has no dark values yet. */}
        <ThemeProvider value={NavigationTheme}>
          {/* Sheets are presented through a portal rooted here, so one opened
              from a screen draws over the whole app rather than inside it. */}
          <BottomSheetModalProvider>
            {/* Every screen is drawn on a light ground, so the icons are always dark. */}
            <StatusBar style="dark" />
            <AnimatedSplashOverlay />
            <RootStack />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

/**
 * One navigator for the whole app.
 *
 * Add a route by adding a file under `src/app/` and a `Stack.Screen` here.
 * When a screen set depends on state — signed in or not, onboarded or not —
 * wrap it in `Stack.Protected guard={...}` so no screen has to police its own
 * access.
 */
function RootStack() {
  // One call covers every route in the app — see use-screen-tracking.ts.
  useScreenTracking();

  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        // Screens draw their own top bar through `Screen`'s `header` prop.
        // Opt a screen back in with `options={{ headerShown: true }}`.
        headerShown: false,
      }}>
      {/* Home owns "/", so it is where the app opens. */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
