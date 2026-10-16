import { Colors } from '@app-experience/theme';

/**
 * The colours for the active theme.
 *
 * Light only for now, so this ignores the device setting rather than pretending
 * to follow it. When the dark palette lands, resolve the scheme here — every
 * screen reads colour through this hook, so this is the only file that changes.
 *
 * https://docs.expo.dev/guides/color-schemes/
 */
export function useTheme() {
  return Colors.light;
}
