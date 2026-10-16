import type { AppLanguage } from '@app-experience/strings';
import Storage from '@app-helpers/storage';

/**
 * Whatever your backend says a signed-in person is. Replace these fields with
 * the ones it actually returns, and parse them at the boundary before they get
 * here — see `createClient` in `http.ts`.
 */
export type UserProfile = {
  id: string;
  name: string;
};

/**
 * The only place a storage key string is written.
 *
 * Nothing else in the app passes a raw key — accessors below are named for the
 * domain concept, so renaming a key is a one-line change here.
 */
export const STORAGE_KEYS = {
  /**
   * No token key: authentication is the backend's cookies, held by the native
   * networking layer. Should a real secret ever need keeping, it goes in
   * `Locker` (Keychain / Keystore) and never in `Storage`.
   */
  USER_PROFILE: 'user.profile',
  USER_ONBOARDED: 'user.onboarded',
  APP_LANGUAGE: 'app.language',
} as const;

/** Readers. Every one is synchronous, so callers never await a local read. */
const check = {
  getUserProfile: (): UserProfile | null => Storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE),

  userOnboarded: (): boolean => Storage.get<boolean>(STORAGE_KEYS.USER_ONBOARDED) ?? false,

  /** Null until the person has picked one, which is what gates the intro screen. */
  getLanguage: (): AppLanguage | null => Storage.get<AppLanguage>(STORAGE_KEYS.APP_LANGUAGE),
};

/** Writers. Return false rather than throwing when the store is unavailable. */
const save = {
  setUserProfile: (profile: UserProfile): boolean =>
    Storage.set(STORAGE_KEYS.USER_PROFILE, profile),

  setUserOnboarded: (): boolean => Storage.set(STORAGE_KEYS.USER_ONBOARDED, true),

  setLanguage: (language: AppLanguage): boolean => Storage.set(STORAGE_KEYS.APP_LANGUAGE, language),
};

const remove = {
  /**
   * Drops every user-scoped key in one call. Sign-out and a 401 both land here,
   * so neither can forget a key the other remembers.
   *
   * `USER_ONBOARDED` and `APP_LANGUAGE` deliberately survive — signing out is
   * not a reason to replay the intro, nor to start asking someone in a language
   * they did not choose.
   */
  removeUser(): boolean {
    return Storage.delete(STORAGE_KEYS.USER_PROFILE);
  },
};

/** Factory reset: user keys plus preferences, caches and flags. */
const removeAll = (): boolean => {
  const userCleared = remove.removeUser();
  return Storage.burn() && userCleared;
};

const StorageService = { check, save, remove, removeAll };

export default StorageService;
