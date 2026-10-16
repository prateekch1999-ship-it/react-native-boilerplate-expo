import { Typography, TypographyDevanagari } from '@app-experience/theme';
import { selectLanguage } from '@app-store/language.slice';
import { useAppSelector } from '@app-store/index';

/**
 * The type scale for the active language — Devanagari faces for Hindi, with the
 * taller line heights the script needs.
 *
 * Text that must stay Latin whatever the app language — a medicine name, read
 * off the pack — passes `script="latin"` to ThemedText instead.
 */
export function useTypography() {
  const language = useAppSelector(selectLanguage);
  return language === 'hi' ? TypographyDevanagari : Typography;
}
