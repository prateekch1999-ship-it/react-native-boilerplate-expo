import * as SecureStore from 'expo-secure-store';

/**
 * Encrypted storage for secrets — auth tokens, refresh tokens, anything that
 * must not sit in plain MMKV. Backed by the iOS Keychain and Android Keystore.
 *
 * Use `Storage` (src/helpers/storage.ts) for everything that is not a secret:
 * it is faster and holds arbitrary amounts of data. SecureStore values are
 * capped at ~2 KB.
 *
 * Nothing calls this directly — key names and the domain meaning of each secret
 * live in `StorageService` (src/services/storage.service.ts).
 *
 * ponytail: no `keychainService`/`sharedPreferencesName` override — SecureStore
 * is already namespaced per app, so the bundle-id lookup (and a device-info
 * dependency) buys nothing here.
 */

/**
 * Reads a secret. Values written by `setItem` come back parsed; anything else
 * is returned as the raw string. Missing or empty values read as null.
 *
 * Synchronous, so the session is known during the first render. `await` still
 * works if a caller prefers it.
 */
function getItem<T = unknown>(key: string): T | string | null {
  const value = SecureStore.getItem(key);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as T;
    return parsed === '' ? null : parsed;
  } catch {
    // Not JSON — hand back what was stored.
    return value;
  }
}

function setItem(key: string, value: unknown): boolean {
  try {
    SecureStore.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[locker] could not write "${key}"`, error);
    return false;
  }
}

/** Async because SecureStore has no synchronous delete. */
async function removeItem(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.warn(`[locker] could not remove "${key}"`, error);
    return false;
  }
}

const Locker = {
  getItem,
  setItem,
  removeItem,
};

export default Locker;
