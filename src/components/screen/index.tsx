import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glass } from '@app-components/glass';
import { PageGradient, Spacing } from '@app-experience/theme';
import { useTheme } from '@app-hooks/use-theme';

import type { ScreenProps } from './interface';
import { styles } from './style';

/**
 * The frame every screen sits in: background, safe-area insets, the keyboard
 * lift, and a scrolling content area with an optional pinned action bar.
 *
 * Screens do not reach for SafeAreaView themselves — getting this wrong is not
 * cosmetic. A plain View does not clip its children, so when the keyboard takes
 * the height, content draws straight through whatever is below it.
 *
 * The app is portrait-locked, so only the top and bottom edges are claimed.
 */
export function Screen({ children, header, footer, centered, fullBleed }: ScreenProps) {
  const theme = useTheme();
  /**
   * The action bar floats over the content rather than sitting beside it, which
   * is what gives the frosted bar something to frost. Nothing else knows how
   * tall it is — it depends on how many lines of terms or helper text a screen
   * puts above its button — so it is measured and handed back as padding. Zero
   * until the first layout, and zero forever on a screen with no action bar.
   */
  const [actionBarHeight, setActionBarHeight] = useState(0);

  return (
    // Wraps the whole screen, so the lift needs no manual offset.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.fill,
        { backgroundColor: theme.bg, experimental_backgroundImage: PageGradient },
      ]}>
      {/* Full bleed has to reach the top edge, and the ScrollView clips, so the
          frame claims no top inset and the screen clears the status bar itself. */}
      <SafeAreaView edges={fullBleed ? [] : ['top']} style={styles.fill}>
        {header}

        <ScrollView
          contentContainerStyle={[
            fullBleed ? styles.fullBleed : styles.content,
            centered && styles.centered,
            // Without this the last line of a screen sits under the action bar,
            // unreachable: scrolling stops at the end of the content. A full-bleed
            // screen with no action bar runs its last section to the bottom edge.
            {
              paddingBottom: fullBleed && !footer ? 0 : actionBarHeight + Spacing.three,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>

      {footer ? (
        <Glass
          style={styles.actionBar}
          onLayout={(event) => setActionBarHeight(event.nativeEvent.layout.height)}>
          {/* Inside the glass, so the frost reaches the bottom of the screen
              and the buttons stay above the home indicator. */}
          <SafeAreaView edges={['bottom']} style={styles.actionBarContent}>
            {footer}
          </SafeAreaView>
        </Glass>
      ) : null}
    </KeyboardAvoidingView>
  );
}
