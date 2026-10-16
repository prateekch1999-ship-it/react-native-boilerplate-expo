import type { AppStrings } from '@app-experience/strings';
import { selectStrings } from '@app-store/language.slice';
import { useAppSelector } from '@app-store/index';

/** Every string for the active language: `const strings = useStrings()`. */
export function useStrings(): AppStrings {
  return useAppSelector(selectStrings);
}
