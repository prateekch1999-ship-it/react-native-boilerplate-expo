import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ReactNode, Ref } from 'react';

export type SheetProps = {
  children: ReactNode;
  /** `present()` opens the sheet, `dismiss()` closes it. */
  ref?: Ref<BottomSheetModal>;
  /** Fires on every close, including a drag down and a tap on the backdrop. */
  onDismiss?: () => void;
  /** What a screen reader announces the sheet as. */
  accessibilityLabel?: string;
};
