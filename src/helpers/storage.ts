import { createMMKV } from 'react-native-mmkv';

/**
 * Process-wide key/value store.
 *
 * MMKV reads and writes synchronously, so values are available during the first
 * render — there is no hydration step. The calls stay `await`-safe, so
 * `await Storage.get(key)` in existing code keeps working.
 *
 * ponytail: single unencrypted instance. Pass `encryptionKey` here if tokens
 * ever need to be encrypted at rest, and split instances only if a cache needs
 * clearing independently of the session.
 */
const mmkv = createMMKV({ id: 'app-storage' });

/** Stores any JSON-serialisable value. Returns false instead of throwing. */
const _storeData = (key: string, value: unknown): boolean => {
  try {
    mmkv.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] could not write "${key}"`, error);
    return false;
  }
};

/** Returns null when the key is missing or holds unreadable JSON. */
const _retrieveData = <T = unknown>(key: string): T | null => {
  try {
    const item = mmkv.getString(key);
    return item !== undefined ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.warn(`[storage] could not read "${key}"`, error);
    return null;
  }
};

const _removeData = (key: string): boolean => {
  try {
    mmkv.remove(key);
    return true;
  } catch (error) {
    console.warn(`[storage] could not remove "${key}"`, error);
    return false;
  }
};

/** Wipes every key — sign-out of last resort, not routine cleanup. */
const _clearAll = (): boolean => {
  try {
    mmkv.clearAll();
    return true;
  } catch (error) {
    console.warn('[storage] could not clear', error);
    return false;
  }
};

const Storage = {
  set: _storeData,
  get: _retrieveData,
  delete: _removeData,
  burn: _clearAll,
};

export default Storage;
