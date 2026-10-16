import { Screen } from '@app-components/screen';
import { SecondaryButton } from '@app-components/secondary-button';
import { useStrings } from '@app-hooks/use-strings';
import { useAppDispatch, useAppSelector } from '@app-store/index';
import { chooseLanguage, selectLanguage } from '@app-store/language.slice';

import { HomeHeader } from './home-container.components';
import type { HomeContainerProps } from './home-container.interface';

export default function HomeContainer({ title }: HomeContainerProps) {
  const strings = useStrings();
  const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();

  // Screen owns the background, the safe-area insets, the keyboard lift and the
  // scrolling. Pass `header` for a top bar and `footer` for the action bar —
  // never reach for SafeAreaView here.
  return (
    <Screen
      footer={
        // The example screen's one action: flip the language, so a new app can
        // see the store, the strings and the persistence all working before any
        // feature exists. Replace it with yours.
        <SecondaryButton
          icon="globe"
          label={strings.common.switchLanguage}
          onPress={() => void dispatch(chooseLanguage(language === 'en' ? 'hi' : 'en'))}
        />
      }>
      <HomeHeader title={title ?? strings.home.title} />
    </Screen>
  );
}
