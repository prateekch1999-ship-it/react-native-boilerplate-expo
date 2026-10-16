import type { ReactNode } from 'react';

export type ScreenProps = {
  children: ReactNode;
  /**
   * Sits above the scrolling content and inside the top inset. A top bar goes
   * here so it stays put while the content moves under it.
   */
  header?: ReactNode;
  /**
   * Pinned to the bottom: takes the bottom inset, a hairline, and lifts above
   * the keyboard. The screen's one primary button belongs here.
   */
  footer?: ReactNode;
  /** Centre the content instead of stacking it from the top. */
  centered?: boolean;
  /**
   * The content runs edge to edge and up under the status bar: no gutter, no
   * gap and no top inset. For a screen whose first section paints its own
   * background to the top of the display. It clears the status bar itself, and
   * puts its top bar in `children`, not `header`.
   */
  fullBleed?: boolean;
};
