import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@app-components/glass';
import { Spacing } from '@app-experience/theme';

import type { SheetProps } from './interface';
import { styles } from './style';

/**
 * The app's bottom sheet: frosted, rounded at the top only, dismissed by
 * dragging it down or tapping the dimmed page behind it.
 *
 * It sizes itself to whatever is put inside it rather than taking snap points,
 * because the sheets in the design are short and their height is whatever the
 * content needs — a fixed fraction of the screen would leave a gap under a
 * two-line confirmation and clip a long one.
 *
 * Opened and closed through its ref, which is this library's own idiom:
 *
 * ```tsx
 * const sheet = useRef<BottomSheetModal>(null);
 * <Sheet ref={sheet}><Confirm /></Sheet>
 * sheet.current?.present();
 * ```
 */
export function Sheet({ children, ref, onDismiss, accessibilityLabel }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
      accessibilityLabel={accessibilityLabel}
      backgroundComponent={SheetBackground}
      backdropComponent={SheetBackdrop}
      handleIndicatorStyle={styles.handle}>
      {/* The sheet sits over the home indicator, so it takes that inset
          itself — nothing above it can know it is there. */}
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

/** Frosted on iOS 26, the opaque surface colour everywhere else. */
function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return <Glass style={[style, styles.background]} />;
}

/**
 * Dims the page behind the sheet, and closes it when tapped. `appearsOnIndex`
 * and `disappearsOnIndex` are the open and closed positions — without them the
 * backdrop sits there dimming the app after the sheet has gone.
 */
function SheetBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}
