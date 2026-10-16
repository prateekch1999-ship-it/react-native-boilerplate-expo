import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getLocales } from 'expo-localization';

import type { AppLanguage, AppStrings } from '@app-experience/strings';
import { Strings } from '@app-experience/strings';
import Analytics from '@app-helpers/analytics';
import StorageService from '@app-services/storage.service';

export type LanguageState = {
  language: AppLanguage;
  /** False until the person picks one themselves — this is what gates the intro. */
  hasChosen: boolean;
};

/**
 * MMKV reads synchronously, so the right language is known on the first render
 * and no screen flashes in the wrong one.
 *
 * The device locale only decides which card starts selected; the person still
 * confirms it, because a Hindi-locale phone does not mean its owner wants a
 * Hindi app.
 */
export const initialLanguageState = (): LanguageState => {
  const stored = StorageService.check.getLanguage();
  const [primary] = getLocales();

  return {
    language: stored ?? (primary?.languageCode === 'hi' ? 'hi' : 'en'),
    hasChosen: stored !== null,
  };
};

/** Also the switch in the top bar and in Profile: choosing again is the same act. */
export const chooseLanguage = createAsyncThunk('language/choose', (language: AppLanguage) => {
  StorageService.save.setLanguage(language);
  Analytics.track('language_selected', { language });
  return language;
});

const languageSlice = createSlice({
  name: 'language',
  initialState: initialLanguageState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(chooseLanguage.fulfilled, (state, action) => {
      state.language = action.payload;
      state.hasChosen = true;
    });
  },
});

type WithLanguage = { language: LanguageState };

export const selectLanguage = (state: WithLanguage): AppLanguage => state.language.language;
export const selectHasChosenLanguage = (state: WithLanguage): boolean => state.language.hasChosen;
/** `Strings[lang]` is a stable reference, so this needs no memoising. */
export const selectStrings = (state: WithLanguage): AppStrings => Strings[state.language.language];

export default languageSlice.reducer;
