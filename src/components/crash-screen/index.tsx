import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Strings } from '@app-experience/strings';
import Crash from '@app-helpers/crash';
import StorageService from '@app-services/storage.service';

import type { CrashScreenProps } from './interface';
import { styles } from './style';

/**
 * What a person sees instead of a blank screen when a render throws.
 *
 * Built from React Native primitives and raw tokens on purpose. expo-router
 * renders this *in place of* the root layout, so the Redux provider above it is
 * not mounted — and `ThemedText` reads the language through a selector, which
 * would throw inside the one component that must not. The language comes
 * straight from storage instead: MMKV answers synchronously and returns null
 * rather than throwing.
 */
export function CrashScreen({ error, retry }: CrashScreenProps) {
  const strings = Strings[StorageService.check.getLanguage() ?? 'en'];

  // The only report this error gets. It never reached http.ts, and without
  // this a crash in a release build is invisible.
  useEffect(() => {
    Crash.recordError(error, { boundary: 'root' });
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{strings.crash.title}</Text>
        <Text style={styles.body}>{strings.crash.body}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{strings.crash.retry}</Text>
      </Pressable>
    </SafeAreaView>
  );
}
