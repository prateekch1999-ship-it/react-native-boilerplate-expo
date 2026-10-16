import languageReducer, { chooseLanguage } from '@app-store/language.slice';

jest.mock('@app-services/storage.service', () => ({
  __esModule: true,
  default: { check: { getLanguage: jest.fn(() => null) }, save: { setLanguage: jest.fn() } },
}));
jest.mock('@app-helpers/analytics', () => ({ __esModule: true, default: { track: jest.fn() } }));
jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => [{ languageCode: 'en' }]) }));

const unchosen = { language: 'en', hasChosen: false } as const;

describe('language reducer', () => {
  test('choosing a language records it and marks the intro done', () => {
    const state = languageReducer(unchosen, chooseLanguage.fulfilled('hi', '', 'hi'));
    expect(state).toEqual({ language: 'hi', hasChosen: true });
  });

  test('switching back later keeps hasChosen true, so the intro never returns', () => {
    const hindi = { language: 'hi', hasChosen: true } as const;
    const state = languageReducer(hindi, chooseLanguage.fulfilled('en', '', 'en'));
    expect(state).toEqual({ language: 'en', hasChosen: true });
  });

  test('a pending choice changes nothing until it is written to storage', () => {
    expect(languageReducer(unchosen, chooseLanguage.pending('', 'hi'))).toEqual(unchosen);
  });
});
